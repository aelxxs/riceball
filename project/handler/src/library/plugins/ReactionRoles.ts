import { DiscordAPIError } from "@discordjs/rest";
import { Database, ReactionRole, type ReactionRolePair, ReactionRoleType } from "@riceball/db";
import { logger } from "@riceball/logger";
import type {
	APIPartialEmoji,
	GatewayMessageReactionAddDispatchData,
	GatewayMessageReactionRemoveDispatchData,
	Snowflake,
} from "discord-api-types/v10";
import { addMemberRole, getMember, removeMemberRole, removeUserReaction, setMemberRoles } from "library/core";
import { Queue } from "library/utilities/queue";
import { inject, singleton } from "tsyringe";

const CUSTOM_EMOJI = /^<?(?:(a)?:)?(\w{2,32}):(\d{17,21})>?$/;
const EMOJI_ID = /^\d{17,21}$/;
const VARIATION_SELECTOR = /️/g;

const REASON = "Reaction Roles";
const SUPPRESS_TTL = 10_000;
const CLEANUP_DELAY = 30_000;

export interface ParsedEmoji {
	id?: Snowflake;
	name: string;
	animated: boolean;
}

// Singleton so the add and remove events share the per-member queues and suppressed reactions.
@singleton()
export class ReactionRoles {
	private db: Database;
	private queues: Map<string, Queue> = new Map();
	private suppressed: Set<string> = new Set();

	public constructor(@inject(Database) db: Database) {
		this.db = db;
	}

	/**
	 * Parses a stored emoji string. Custom emojis may be stored as `<:name:id>`, `<a:name:id>`, `name:id` or a bare id.
	 */
	public static parseEmoji(emoji: string): ParsedEmoji {
		const trimmed = emoji.trim();
		const custom = CUSTOM_EMOJI.exec(trimmed);

		if (custom) {
			return { id: custom[3], name: custom[2], animated: Boolean(custom[1]) };
		}

		if (EMOJI_ID.test(trimmed)) {
			return { id: trimmed, name: "_", animated: false };
		}

		return { name: trimmed, animated: false };
	}

	/**
	 * A stable key used to compare emojis regardless of how they were stored.
	 */
	public static emojiKey(emoji: string | APIPartialEmoji) {
		if (typeof emoji === "string") {
			const parsed = ReactionRoles.parseEmoji(emoji);
			return parsed.id ?? parsed.name.replace(VARIATION_SELECTOR, "");
		}

		return emoji.id ?? (emoji.name ?? "").replace(VARIATION_SELECTOR, "");
	}

	/**
	 * The emoji in the form expected by the reaction REST routes (`name:id` or unicode).
	 */
	public static toReactionParam(emoji: string) {
		const { id, name } = ReactionRoles.parseEmoji(emoji);
		return id ? `${name}:${id}` : name;
	}

	public static formatEmoji(emoji: string) {
		const { id, name, animated } = ReactionRoles.parseEmoji(emoji);
		return id ? `<${animated ? "a" : ""}:${name}:${id}>` : name;
	}

	public static findPair(reactionRole: ReactionRole, emoji: string | APIPartialEmoji) {
		const key = ReactionRoles.emojiKey(emoji);
		return reactionRole.pairs.find((pair) => ReactionRoles.emojiKey(pair.emoji) === key);
	}

	public async add(event: GatewayMessageReactionAddDispatchData) {
		if (!event.guild_id || event.member?.user.bot) return;

		const guildId = event.guild_id;
		const userId = event.user_id;

		this.suppressed.delete(this.suppressKey(event.message_id, userId, ReactionRoles.emojiKey(event.emoji)));

		const reactionRole = await this.fetch(guildId, event.message_id);
		if (!reactionRole) return;

		const pair = ReactionRoles.findPair(reactionRole, event.emoji);
		if (!pair) return;

		return this.queue(`${guildId}:${userId}`, async () => {
			switch (reactionRole.type) {
				case ReactionRoleType.REMOVE:
					return this.removeRoles(guildId, userId, pair.roles);
				case ReactionRoleType.UNIQUE:
					return this.applyUnique(reactionRole, pair, userId);
				default:
					return this.addRoles(guildId, userId, pair.roles);
			}
		});
	}

	public async remove(event: GatewayMessageReactionRemoveDispatchData) {
		if (!event.guild_id) return;

		const guildId = event.guild_id;
		const userId = event.user_id;

		const key = this.suppressKey(event.message_id, userId, ReactionRoles.emojiKey(event.emoji));
		if (this.suppressed.delete(key)) return;

		const reactionRole = await this.fetch(guildId, event.message_id);
		if (!reactionRole) return;

		if (reactionRole.type === ReactionRoleType.ADD || reactionRole.type === ReactionRoleType.REMOVE) return;

		const pair = ReactionRoles.findPair(reactionRole, event.emoji);
		if (!pair) return;

		return this.queue(`${guildId}:${userId}`, () => this.removeRoles(guildId, userId, pair.roles));
	}

	// Deferred: the website moves a menu by deleting the old message before it saves the new message id.
	public scheduleCleanup(guildId: Snowflake | undefined, messageIds: Snowflake[]) {
		if (!guildId || !messageIds.length) return;

		setTimeout(() => {
			this.deleteByMessage(guildId, messageIds).catch((error) => {
				logger.error("Reaction roles: failed to clean up deleted messages");
				logger.trace(error);
			});
		}, CLEANUP_DELAY);
	}

	private async deleteByMessage(guildId: Snowflake, messageIds: Snowflake[]) {
		const em = this.db.rm.em.fork();
		const deleted = await em.nativeDelete(ReactionRole, { guildId, messageId: { $in: messageIds } });

		if (deleted) {
			logger.debug(`Deleted ${deleted} reaction role(s) for deleted message(s) -> ${messageIds.join(", ")}`);
		}
	}

	private async applyUnique(reactionRole: ReactionRole, pair: ReactionRolePair, userId: Snowflake) {
		const { guildId, channelId, messageId } = reactionRole;

		const fetched = await this.attempt(getMember(guildId, userId), `fetch member ${userId} in ${guildId}`);
		if (!fetched.ok) return;

		const member = fetched.value;
		const held = new Set(member.roles);
		const next = new Set(member.roles);
		const others = reactionRole.pairs.filter((other) => other !== pair);

		for (const other of others) {
			for (const role of other.roles) {
				if (!pair.roles.includes(role)) next.delete(role);
			}
		}

		for (const role of pair.roles) {
			next.add(role);
		}

		const changed = next.size !== held.size || [...next].some((role) => !held.has(role));

		if (changed) {
			await this.attempt(
				setMemberRoles(guildId, userId, [...next], REASON),
				`update roles of ${userId} in ${guildId}`,
			);
		}

		for (const other of others) {
			if (!other.roles.some((role) => held.has(role))) continue;

			const key = this.suppressKey(messageId, userId, ReactionRoles.emojiKey(other.emoji));
			this.suppressed.add(key);
			setTimeout(() => this.suppressed.delete(key), SUPPRESS_TTL);

			const removed = await this.attempt(
				removeUserReaction(channelId, messageId, ReactionRoles.toReactionParam(other.emoji), userId),
				`remove reaction ${other.emoji} of ${userId} on ${messageId}`,
			);

			if (!removed.ok) this.suppressed.delete(key);
		}
	}

	private async addRoles(guildId: Snowflake, userId: Snowflake, roles: Snowflake[]) {
		for (const role of roles) {
			await this.attempt(
				addMemberRole(guildId, userId, role, REASON),
				`add role ${role} to ${userId} in ${guildId}`,
			);
		}
	}

	private async removeRoles(guildId: Snowflake, userId: Snowflake, roles: Snowflake[]) {
		for (const role of roles) {
			await this.attempt(
				removeMemberRole(guildId, userId, role, REASON),
				`remove role ${role} from ${userId} in ${guildId}`,
			);
		}
	}

	private async fetch(guildId: Snowflake, messageId: Snowflake) {
		// A fresh fork so edits made from the website are never served from a stale identity map.
		const reactionRole = await this.db.rm.em.fork().findOne(ReactionRole, { guildId, messageId });

		if (!reactionRole || reactionRole.enabled === false) return null;

		return reactionRole;
	}

	private async attempt<T>(request: Promise<T>, action: string): Promise<{ ok: true; value: T } | { ok: false }> {
		try {
			return { ok: true, value: await request };
		} catch (error) {
			if (error instanceof DiscordAPIError) {
				logger.warn(`Reaction roles: failed to ${action} (${error.code}: ${error.message})`);
			} else {
				logger.error(`Reaction roles: failed to ${action}`);
				logger.trace(error);
			}
			return { ok: false };
		}
	}

	private suppressKey(messageId: Snowflake, userId: Snowflake, emojiKey: string) {
		return `${messageId}:${userId}:${emojiKey}`;
	}

	private queue(key: string, callback: () => Promise<unknown>) {
		let queue = this.queues.get(key);

		if (!queue) {
			queue = new Queue();
			this.queues.set(key, queue);
		}

		return new Promise<void>((resolve) => {
			queue.add(async () => {
				try {
					await callback();
				} finally {
					if (!queue.length) this.queues.delete(key);
					resolve();
				}
			});
		});
	}
}
