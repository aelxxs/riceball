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

import { hyperlink, messageLink, roleMention } from "@discordjs/formatters";
import { Database, ReactionRole } from "@riceball/db";
import type { APIEmbedField } from "discord-api-types/v10";
import { Constants } from "library/common";
import type { Command, Context } from "library/core";
import { ReactionRoles } from "library/plugins/ReactionRoles";
import { inject, injectable } from "tsyringe";

const MAX_FIELDS = 25;
const MAX_FIELD_LENGTH = 1024;

@injectable()
export default class implements Command {
	public constructor(@inject(Database) private db: Database) {}

	/**
	 * View your server's reaction roles
	 *
	 * @param {Context} context - The context of the command
	 **/
	public async chatInputRun({ guild }: Context) {
		const reactionRoles = await this.db.rm.em
			.fork()
			.find(ReactionRole, { guildId: guild.id }, { orderBy: { createdAt: "asc" } });

		if (!reactionRoles.length) {
			throw "This server doesn't have any reaction roles yet. Use `/reaction-role create` to make one.";
		}

		const fields = reactionRoles.slice(0, MAX_FIELDS).map((reactionRole) => this.format(guild.id, reactionRole));
		const hidden = reactionRoles.length - fields.length;

		return {
			embeds: [
				{
					title: `${guild.name} Reaction Roles`,
					fields,
					footer: hidden > 0 ? { text: `And ${hidden} more...` } : undefined,
				},
			],
		};
	}

	private format(guildId: string, reactionRole: ReactionRole): APIEmbedField {
		const status = reactionRole.enabled === false ? Constants.Emoji.Disabled : Constants.Emoji.Enabled;
		const link = hyperlink("Jump to message", messageLink(reactionRole.channelId, reactionRole.messageId, guildId));

		const pairs = reactionRole.pairs.length
			? reactionRole.pairs
					.map(({ emoji, roles }) => {
						const mentions = roles.length
							? roles.map((role) => roleMention(role)).join(", ")
							: "*No roles*";
						return `${ReactionRoles.formatEmoji(emoji)} → ${mentions}`;
					})
					.join("\n")
			: "*No reaction pairs*";

		const value = `${link} • \`${reactionRole.type}\`\n${pairs}`;

		return {
			name: `${status} ${reactionRole.alias}`,
			value: value.length > MAX_FIELD_LENGTH ? `${value.slice(0, MAX_FIELD_LENGTH - 1)}…` : value,
		};
	}
}
