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

import { bold, channelMention, codeBlock, subtext } from "@discordjs/formatters";
import type { REST } from "@discordjs/rest";
import { Database } from "@riceball/db";
import { stripIndents } from "common-tags";
import { ButtonStyle, Routes } from "discord-api-types/v10";
import { Deps } from "library/common";
import { actionRow, button } from "library/components";
import type { Command, Context } from "library/core";
import { formatBoolean } from "library/utilities/formatters";
import { container, inject, injectable } from "tsyringe";

@injectable()
export default class implements Command {
	public db: Database;

	public constructor(@inject(Database) db: Database) {
		this.db = db;
	}
	/**
	 * View your server's Starboard settings
	 *
	 * @param {Context} context - The context of the command
	 **/
	public async chatInputRun({ i, guild }: Context) {
		const { stars } = await this.db.getGuildSettings(guild.id);

		return {
			embeds: [
				{
					title: "Starboard",
					description: stripIndents`
						${subtext("View and edit your server's starboard settings.")}

						${stars.enabled ? "" : `${bold("Note")}: The Starboard plugin is disabled in this server.`}
					`,
					fields: [
						{
							name: "Enabled",
							value: formatBoolean(stars.enabled),
							inline: true,
						},
						{
							name: "Emoji",
							value: stars.emoji,
							inline: true,
						},
						{
							name: "Channel",
							value: stars.channelId ? `${channelMention(stars.channelId)}` : "None",
							inline: true,
						},
						{
							name: "Reaction Threshold",
							value: stripIndents`
								${bold(stars.threshold.toString())} reaction${stars.threshold === 1 ? "" : "s"}
								${subtext("The number of reactions required to post a message to the starboard.")}
							`,
						},
						{
							name: "Allow Self-Starring",
							value: formatBoolean(stars.selfStarEnabled),
							inline: true,
						},
						{
							name: "Warn on Self-Starring",
							value: formatBoolean(stars.selfStarWarning),
							inline: true,
						},
						{ name: "", value: "", inline: true },
						// {
						// 	name: "Restrictions",
						// 	value: stripIndents`
						// 		${subtext("Allow or deny roles, users, or channels from using the starboard.")}
						// 		${codeBlock(
						// 			"yaml",
						// 			stripIndents`
						// 				Roles    :: ${stars.roleRestriction?.omit.length ?? 0} ${stars.roleRestriction?.type ?? "Not Set"}
						// 				Channels :: ${stars.channelRestriction?.omit.length ?? 0} ${stars.channelRestriction?.type ?? "Not Set"}
						// 			`,
						// 		)}
						// 	`,
						// },
					],
				},
			],
			components: [
				actionRow({
					command: "stars/config",
					components: [
						button({
							method: this.editSettings,
							label: "Edit",
						}),
						button({
							method: this.viewRestrictions,
							label: "View Restrictions",
						}),
						button({
							label: "View Online",
							style: ButtonStyle.Link,
							url: "https://riceball.bot",
							disabled: true,
						}),
					],
				}),
			],
		};
	}

	public async viewRestrictions({ guild }: Context) {}

	/**
	 * Replaces each setting with its respective command for easy access
	 *
	 * @param {Context} context - The context of the command
	 **/
	public async editSettings({ guild }: Context) {
		return {
			components: [
				actionRow({
					context: "settings",
					command: "stars/config",
					components: [
						button({
							method: this.selectSetting,
							label: "Enabled",
						}),
						button({
							method: this.selectSetting,
							label: "Emoji",
						}),
						select({
							method: this.selectSetting,
							placeholder: "Select a setting to edit...",
							options: [
								{
									label: "Enabled",
									value: "enabled",
									// description: "Toggle the starboard plugin on or off.",
								},
								{
									label: "Emoji",
									value: "emoji",
									// description: "Set the emoji used to star messages.",
								},
								{
									label: "Channel",
									value: "channel",
									// description: "Set the channel where starred messages are posted.",
								},
								{
									label: "Reaction Threshold",
									value: "threshold",
									// description: "Set the number of reactions required to star a message.",
								},
								{
									label: "Allow Self-Starring",
									value: "selfStarEnabled",
									// description: "Allow users to star their own messages.",
								},
								{
									label: "Warn on Self-Starring",
									value: "selfStarWarning",
									// description: "Warn users when they star their own messages.",
								},
								{
									label: "Restrictions",
									value: "restrictions",
									// description: "Allow or deny roles, users, or channels from using the starboard.",
								},
							],
						}),
					],
				}),
			],
		};
	}

	public async selectSetting({ i, guild }: Context, [setting]: string[]) {
		const { stars } = await getGuild(guild.id);

		const rest = container.resolve<REST>(Deps.Rest);
		const commands = await rest.get(Routes.applicationCommands(i.application_id));

		return {
			content: `Editing ${setting}`,
		};
	}
}
