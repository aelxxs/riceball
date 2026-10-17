/**
 * This file is part of the Rice Ball (https://github.com/aelxxs/riceball).
 * Copyright (c) 2023 Alexis Vielma.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Affero Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 **/

import { channelMention, roleMention } from "@discordjs/formatters";
import { DiscordAPIError } from "@discordjs/rest";
import { Database, ReactionRole, ReactionRolePair, ReactionRoleType } from "@riceball/db";
import { type APIRole, PermissionFlagsBits, RESTJSONErrorCodes, type Snowflake } from "discord-api-types/v10";
import { addReaction, type Command, type Context, getGuildRoles, getMember } from "library/core";
import { ReactionRoles } from "library/plugins/ReactionRoles";
import * as emojis from "node-emoji";
import { inject, injectable } from "tsyringe";

const MESSAGE_LINK = /channels\/\d+\/(\d+)\/(\d+)/;
const SNOWFLAKE = /^\d{17,21}$/;

@injectable()
export default class implements Command {
	public constructor(@inject(Database) private db: Database) {}

	/**
	 * Add a reaction role
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ i, guild }: Context, { message, emoji, role }: Options) {
		const target = this.parseMessage(message);

		if (!target) {
			throw "Please provide a valid message ID or message link.";
		}

		await this.assertAssignable(guild.id, i.application_id, i.app_permissions, role);

		const em = this.db.rm.em.fork();
		const reactionRole = await em.findOne(ReactionRole, { guildId: guild.id, messageId: target.messageId });
		const channelId = reactionRole?.channelId ?? target.channelId ?? i.channel?.id;

		if (!channelId) {
			throw "I couldn't tell which channel that message is in. Please provide a message link instead.";
		}

		const stored = this.resolveEmoji(emoji);
		const display = ReactionRoles.formatEmoji(stored);
		const pair = reactionRole && ReactionRoles.findPair(reactionRole, stored);

		if (pair?.roles.includes(role.id)) {
			throw `${display} already gives ${roleMention(role.id)} on that message.`;
		}

		await this.react(channelId, target.messageId, stored);

		if (pair) {
			pair.roles = [...pair.roles, role.id];
		} else if (reactionRole) {
			reactionRole.pairs = [...reactionRole.pairs, this.createPair(stored, role.id)];
		} else {
			em.persist(
				em.create(ReactionRole, {
					guildId: guild.id,
					channelId,
					messageId: target.messageId,
					messageContent: "",
					alias: `message-${target.messageId}`,
					type: ReactionRoleType.TOGGLE,
					enabled: true,
					pairs: [this.createPair(stored, role.id)],
				}),
			);
		}

		await em.flush();

		return `Reacting with ${display} in ${channelMention(channelId)} will now give ${roleMention(role.id)}.`;
	}

	private parseMessage(input: string): { channelId?: Snowflake; messageId: Snowflake } | null {
		const link = MESSAGE_LINK.exec(input);
		if (link) return { channelId: link[1], messageId: link[2] };

		const id = input.trim();
		return SNOWFLAKE.test(id) ? { messageId: id } : null;
	}

	private resolveEmoji(input: string) {
		const parsed = ReactionRoles.parseEmoji(input);
		if (parsed.id) return ReactionRoles.formatEmoji(input);

		return emojis.find(parsed.name)?.emoji ?? parsed.name;
	}

	private createPair(emoji: string, roleId: Snowflake) {
		const pair = new ReactionRolePair();
		pair.emoji = emoji;
		pair.roles = [roleId];
		return pair;
	}

	private async assertAssignable(guildId: Snowflake, botId: Snowflake, appPermissions: string, role: APIRole) {
		if (role.id === guildId || role.managed) {
			throw `${roleMention(role.id)} is managed by Discord or an integration and can't be assigned.`;
		}

		if (!(BigInt(appPermissions) & PermissionFlagsBits.ManageRoles)) {
			throw "I need the **Manage Roles** permission to assign reaction roles.";
		}

		const [roles, me] = await Promise.all([getGuildRoles(guildId), getMember(guildId, botId)]);
		const highest = Math.max(0, ...roles.filter(({ id }) => me.roles.includes(id)).map(({ position }) => position));
		const position = roles.find(({ id }) => id === role.id)?.position ?? role.position;

		if (position >= highest) {
			throw `${roleMention(role.id)} is above my highest role. Move my role above it so I can assign it.`;
		}
	}

	private async react(channelId: Snowflake, messageId: Snowflake, emoji: string) {
		try {
			await addReaction(channelId, messageId, ReactionRoles.toReactionParam(emoji));
		} catch (error) {
			if (!(error instanceof DiscordAPIError)) throw error;

			switch (error.code) {
				case RESTJSONErrorCodes.UnknownMessage:
				case RESTJSONErrorCodes.UnknownChannel:
					throw `I couldn't find that message in ${channelMention(channelId)}. Try using a message link instead.`;
				case RESTJSONErrorCodes.UnknownEmoji:
					throw "That emoji is invalid or from a server I'm not in.";
				case RESTJSONErrorCodes.MissingAccess:
				case RESTJSONErrorCodes.MissingPermissions:
					throw `I don't have permission to add reactions in ${channelMention(channelId)}.`;
				case RESTJSONErrorCodes.MaximumNumberOfReactionsReached:
					throw "That message already has the maximum number of reactions.";
				default:
					throw error;
			}
		}
	}
}

interface Options {
	/* The message ID or link to add the reaction role to */
	message: string;
	/* The emoji to add to the message */
	emoji: string;
	/* The role to add to the user */
	role: APIRole;
}
