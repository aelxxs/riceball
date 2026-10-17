import { userMention } from "@discordjs/formatters";
import type { REST } from "@discordjs/rest";
import {
	Database,
	Destination,
	type DiscordEmbed,
	type Guild,
	type Levels as LevelSettings,
	MessageType,
	type Restriction,
	RestrictionType,
	type Reward,
} from "@riceball/db";
import { logger } from "@riceball/logger";
import {
	type APIChannel,
	type APIEmbed,
	type APIRole,
	type GatewayMessageCreateDispatchData,
	type RESTPostAPIChannelMessageJSONBody,
	Routes,
	type Snowflake,
} from "discord-api-types/v10";
import type Redis from "ioredis";
import { CacheKeys, Deps } from "library/common";
import { inject, injectable } from "tsyringe";

const DEFAULT_NOTIFY_MESSAGE = "Congratulations {user}! You have reached level **{level}**.";
const DEFAULT_EMBED_COLOR = 9042682;
const REWARD_AUDIT_REASON = "Leveling reward";

export const MAX_ROLES_PER_REWARD = 5;

export interface LeaderboardEntry {
	rank: number;
	userId: Snowflake;
	exp: number;
	level: number;
}

export interface LeaderboardPage {
	entries: LeaderboardEntry[];
	total: number;
	page: number;
	pageCount: number;
}

@injectable()
export class Levels {
	private db: Database;
	private redis: Redis;
	private rest: REST;

	public constructor(
		@inject(Database) db: Database,
		@inject(Deps.Redis) redis: Redis,
		@inject(Deps.Rest) rest: REST,
	) {
		this.db = db;
		this.redis = redis;
		this.rest = rest;
	}

	/**
	 * Get the exp needed to go from a level to the next one
	 * @param level - The level to get the exp requirement for
	 */
	public expReq(level: number): number {
		return 6 * level ** 2 + 80 * level + 100;
	}

	/**
	 * Get the total exp needed to reach a level
	 * @param level - The level to get the total exp requirement for
	 */
	public totalXpReq(level: number): number {
		let xp = 0;
		for (let current = 1; current < level; current++) {
			xp += this.expReq(current);
		}
		return xp;
	}

	/**
	 * Get the level for an amount of exp
	 * @param xp - The exp to get the level from
	 */
	public getLvl(xp: number): number {
		let expRemaining = xp;
		let level = 1;
		while (expRemaining >= this.expReq(level)) {
			expRemaining -= this.expReq(level);
			level++;
		}
		return level;
	}

	/**
	 * Get the exp earned towards the next level
	 * @param xp - The exp to get the progress from
	 */
	public getProgress(xp: number): number {
		let expRemaining = xp;
		let level = 1;
		while (expRemaining >= this.expReq(level)) {
			expRemaining -= this.expReq(level);
			level++;
		}
		return expRemaining;
	}

	/**
	 * Gives exp to the author of a guild message, then handles reward roles and the
	 * level up announcement when the author reaches a new level.
	 *
	 * @param message - The message data from the gateway event.
	 */
	public async giveTextExp(message: GatewayMessageCreateDispatchData) {
		if (!message.guild_id || !message.member) return;

		const guildId = message.guild_id;
		const { author, member } = message;

		const settings = await this.db.getGuildSettings(guildId);
		const { levels } = settings;

		if (levels.enabled === false || levels.textExpEnabled === false) return;
		if (Levels.isRestricted(levels, message.channel_id, member.roles)) return;

		const cooldownKey = CacheKeys.TextExpCooldown(guildId, author.id);
		const cooldown = Math.max(1, Math.round(levels.textCooldown ?? 25));

		// SET NX doubles as the cooldown check so concurrent messages can't both earn exp
		const acquired = await this.redis.set(cooldownKey, "1", "EX", cooldown, "NX");
		if (!acquired) return;

		const { exp } = await this.db.getMemberSettings(guildId, author.id);
		const newExp = exp + this.rollTextExp(levels);

		await this.db.setMemberSettings(guildId, author.id, { exp: newExp });

		const newLvl = this.getLvl(newExp);

		if (newLvl > this.getLvl(exp)) {
			await this.handleLevelUp(message, settings, newLvl);
		}
	}

	private rollTextExp(levels: LevelSettings): number {
		const min = Math.max(0, levels.textRateMin ?? 1);
		const max = Math.max(min, levels.textRateMax ?? min);
		const base = min + Math.floor(Math.random() * (max - min + 1));

		return Math.max(0, Math.round(base * (levels.boost ?? 1)));
	}

	private async handleLevelUp(message: GatewayMessageCreateDispatchData, settings: Guild, lvl: number) {
		const guildId = message.guild_id as Snowflake;
		const { levels } = settings;

		try {
			await this.syncRewardRoles(guildId, message.author.id, message.member?.roles ?? [], levels, lvl);
		} catch (error) {
			logger.error(`Failed to apply leveling rewards in guild ${guildId}`);
			logger.trace(error);
			await this.pruneDeletedRewardRoles(guildId, levels.rewards ?? []);
		}

		try {
			await this.announceLevelUp(message, settings, lvl);
		} catch (error) {
			logger.error(`Failed to send level up announcement in guild ${guildId}`);
			logger.trace(error);
		}
	}

	/**
	 * Gives a member the reward roles for their level.
	 *
	 * When rewards stack, every reward up to the level is added. Otherwise the member only
	 * keeps the highest reward they qualify for, and rewards from lower levels are removed.
	 */
	public async syncRewardRoles(
		guildId: Snowflake,
		userId: Snowflake,
		currentRoles: Snowflake[],
		levels: Pick<LevelSettings, "rewards" | "stackRewards">,
		lvl: number,
	) {
		const earned = (levels.rewards ?? []).filter(({ level }) => level <= lvl);
		const owned = new Set(currentRoles);

		let desired: Set<Snowflake>;
		let replaced: Snowflake[] = [];

		if (levels.stackRewards) {
			desired = new Set(earned.flatMap(({ roles }) => roles));
		} else {
			const highest = earned.reduce<Reward | null>(
				(best, reward) => (!best || reward.level > best.level ? reward : best),
				null,
			);

			desired = new Set(highest?.roles ?? []);
			replaced = earned.filter((reward) => reward !== highest).flatMap(({ roles }) => roles);
		}

		const toAdd = [...desired].filter((roleId) => !owned.has(roleId));
		const toRemove = replaced.filter((roleId) => owned.has(roleId) && !desired.has(roleId));

		for (const roleId of toAdd) {
			await this.rest.put(Routes.guildMemberRole(guildId, userId, roleId), { reason: REWARD_AUDIT_REASON });
		}

		for (const roleId of new Set(toRemove)) {
			await this.rest.delete(Routes.guildMemberRole(guildId, userId, roleId), { reason: REWARD_AUDIT_REASON });
		}
	}

	/**
	 * Removes reward roles that no longer exist in the guild, dropping rewards left without roles.
	 */
	private async pruneDeletedRewardRoles(guildId: Snowflake, rewards: Reward[]) {
		try {
			const roles = (await this.rest.get(Routes.guildRoles(guildId))) as APIRole[];
			const existing = new Set(roles.map(({ id }) => id));

			const pruned = rewards
				.map(({ level, roles }) => ({ level, roles: roles.filter((roleId) => existing.has(roleId)) }))
				.filter(({ roles }) => roles.length > 0);

			const countRoles = (list: Reward[]) => list.reduce((count, { roles }) => count + roles.length, 0);

			if (countRoles(pruned) !== countRoles(rewards)) {
				await this.db.setGuildSettings(guildId, { levels: { rewards: pruned } });
			}
		} catch (error) {
			logger.error(`Failed to prune leveling rewards in guild ${guildId}`);
			logger.trace(error);
		}
	}

	private async announceLevelUp(message: GatewayMessageCreateDispatchData, settings: Guild, lvl: number) {
		const { levels } = settings;
		const { author } = message;

		if (levels.notifyDestination === Destination.DISABLED) return;

		const placeholders: Record<string, string> = {
			user: userMention(author.id),
			username: author.username,
			level: lvl.toLocaleString(),
		};

		const fill = (text: string) =>
			text.replace(/\{(user|username|level)\}/g, (_, key: string) => placeholders[key]);

		const color = settings.defaultEmbedColor ?? DEFAULT_EMBED_COLOR;
		const content = levels.notifyMessageContent ? fill(levels.notifyMessageContent) : undefined;

		const body: RESTPostAPIChannelMessageJSONBody = {
			allowed_mentions: { users: [author.id] },
		};

		if (levels.notifyMessageType === MessageType.TEXT) {
			body.content = content ?? fill(DEFAULT_NOTIFY_MESSAGE);
		} else {
			const embed = Levels.toAPIEmbed(levels.notifyMessageEmbed, fill);

			if (embed) {
				body.content = content;
				body.embeds = [{ color, ...embed }];
			} else {
				body.embeds = [{ color, description: content ?? fill(DEFAULT_NOTIFY_MESSAGE) }];
			}
		}

		let channelId = message.channel_id;

		switch (levels.notifyDestination) {
			case Destination.CUSTOM_CHANNEL:
				channelId = levels.notifyChannel ?? message.channel_id;
				break;
			case Destination.PRIVATE_MESSAGE: {
				const dm = (await this.rest.post(Routes.userChannels(), {
					body: { recipient_id: author.id },
				})) as APIChannel;
				channelId = dm.id;
				break;
			}
			default:
				body.message_reference = { message_id: message.id, fail_if_not_exists: false };
		}

		await this.rest.post(Routes.channelMessages(channelId), { body });
	}

	/**
	 * Converts a stored embed into an API embed, dropping empty values Discord would reject.
	 */
	private static toAPIEmbed(embed: DiscordEmbed | undefined, fill: (text: string) => string) {
		if (!embed) return undefined;

		const result: APIEmbed = {};

		if (embed.title) result.title = fill(embed.title);
		if (embed.description) result.description = fill(embed.description);
		if (embed.url) result.url = embed.url;
		if (embed.color) result.color = embed.color;
		if (embed.timestamp) result.timestamp = embed.timestamp;
		if (embed.image?.url) result.image = { url: embed.image.url };
		if (embed.thumbnail?.url) result.thumbnail = { url: embed.thumbnail.url };

		if (embed.author?.name) {
			result.author = {
				name: fill(embed.author.name),
				url: embed.author.url || undefined,
				icon_url: embed.author.icon_url || undefined,
			};
		}

		if (embed.footer?.text) {
			result.footer = { text: fill(embed.footer.text), icon_url: embed.footer.icon_url || undefined };
		}

		const fields = (embed.fields ?? [])
			.filter(({ name, value }) => name && value)
			.map(({ name, value, inline }) => ({ name: fill(name), value: fill(value), inline }));

		if (fields.length) result.fields = fields;

		const visible = Object.keys(result).some((key) => !["color", "url", "timestamp"].includes(key));

		return visible ? result : undefined;
	}

	/**
	 * Whether a message is blocked from earning exp by the plugin's channel or role restrictions.
	 */
	public static isRestricted(
		levels: Pick<LevelSettings, "channelRestriction" | "roleRestriction">,
		channelId: Snowflake,
		roles: Snowflake[],
	) {
		return (
			Levels.checkRestriction(levels.channelRestriction, [channelId])
			|| Levels.checkRestriction(levels.roleRestriction, roles)
		);
	}

	private static checkRestriction(restriction: Restriction | undefined, ids: Snowflake[]) {
		if (!restriction) return false;

		const omitted = ids.some((id) => (restriction.omit ?? []).includes(id));

		// ALLOW_ALL omits blocked entities; BLOCK_ALL omits the only allowed ones
		return restriction.type === RestrictionType.BLOCK_ALL ? !omitted : omitted;
	}

	/**
	 * Get the rank of a member, where members tied on exp share a rank
	 * @param guildId - The id of the guild to get the rank from
	 * @param userId - The id of the user to get the rank from
	 */
	public async getMemberRank(guildId: Snowflake, userId: Snowflake) {
		const { exp } = await this.db.getMemberSettings(guildId, userId);
		const ahead = await this.db.rm.members.count({ guildId, exp: { $gt: exp } });

		return ahead + 1;
	}

	/**
	 * Get a page of the guild's leaderboard, sorted by exp
	 * @param guildId - The id of the guild to get the leaderboard from
	 * @param page - The 1-indexed page to get
	 * @param pageSize - How many members to include per page
	 */
	public async getLeaderboard(guildId: Snowflake, page = 1, pageSize = 10): Promise<LeaderboardPage> {
		const where = { guildId, exp: { $gt: 0 } };
		const total = await this.db.rm.members.count(where);
		const pageCount = Math.max(1, Math.ceil(total / pageSize));
		const current = Math.min(Math.max(1, Math.trunc(page)), pageCount);
		const offset = (current - 1) * pageSize;

		const members = await this.db.rm.members.find(where, {
			orderBy: { exp: "desc", userId: "asc" },
			limit: pageSize,
			offset,
			disableIdentityMap: true,
		});

		return {
			entries: members.map(({ userId, exp }, i) => ({
				rank: offset + i + 1,
				userId,
				exp,
				level: this.getLvl(exp),
			})),
			total,
			page: current,
			pageCount,
		};
	}

	/**
	 * Get the guild's rewards sorted by level
	 * @param guildId - The id of the guild to get the rewards from
	 */
	public async getRewards(guildId: Snowflake): Promise<Reward[]> {
		const { levels } = await this.db.getGuildSettings(guildId);
		return [...(levels.rewards ?? [])].sort((a, b) => a.level - b.level);
	}

	/**
	 * Add a role to the reward given at a level
	 * @throws A user-facing message when the role can't be added
	 */
	public async addReward(guildId: Snowflake, level: number, roleId: Snowflake) {
		const rewards = await this.getRewards(guildId);

		const existing = rewards.find(({ roles }) => roles.includes(roleId));
		if (existing) {
			throw `<@&${roleId}> is already the reward for level \`${existing.level}\`.`;
		}

		const reward = rewards.find((reward) => reward.level === level);

		if (reward && reward.roles.length >= MAX_ROLES_PER_REWARD) {
			throw `There cannot be more than \`${MAX_ROLES_PER_REWARD}\` roles rewarded at level \`${level}\`.`;
		}

		const updated = reward
			? rewards.map((r) => (r.level === level ? { level, roles: [...r.roles, roleId] } : r))
			: [...rewards, { level, roles: [roleId] }].sort((a, b) => a.level - b.level);

		await this.db.setGuildSettings(guildId, { levels: { rewards: updated } });
	}

	/**
	 * Remove the reward given at a level
	 * @returns Whether a reward existed at the level
	 */
	public async removeReward(guildId: Snowflake, level: number) {
		const rewards = await this.getRewards(guildId);
		const updated = rewards.filter((reward) => reward.level !== level);

		if (updated.length === rewards.length) return false;

		await this.db.setGuildSettings(guildId, { levels: { rewards: updated } });
		return true;
	}
}
