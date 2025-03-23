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
import { Command, Component, Context, MessagePayload } from "@lib/core";
import { stripIndents } from "common-tags";
import { getGuild, Levels, updateGuild } from "db";
import { ButtonStyle, ComponentType, TextInputStyle } from "discord-api-types/v10";
import { actionRow, button, modal, select } from "library/components";
import { booleanFromString } from "library/utilities";
import { formatBoolean, formatBooleanForButton } from "library/utilities/formatters";

export default class implements Command {
	/**
	 * View your server's Leveling settings
	 *
	 * @param {Context} context - The context of the command
	 **/
	public async chatInputRun({ guild }: Context): Promise<MessagePayload> {
		const { levels } = await getGuild(guild.id);

		return {
			embeds: [this.generateEmbed(levels)],
			components: [
				actionRow({
					command: "levels/settings",
					components: [
						button({
							method: this.editSettings,
							label: "Edit",
						}),
						button({
							method: "this.viewRestrictions,",
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

	public editSettings: Component = async ({ guild }: Context) => {
		const { levels } = await getGuild(guild.id);

		return {
			embeds: [this.generateEmbed(levels)],
			components: [
				actionRow({
					command: "levels/settings",
					components: [
						select({
							method: this.selectSetting,
							placeholder: "Select a setting to edit",
							options: [
								{ label: "Enabled", value: "enabled" },
								{ label: "Multiplier", value: "boost" },
								{ label: "Stack Rewards", value: "stackRewards" },
								{ label: "Level Up Notification", value: "notify" },
								{ label: "Text Rate", value: "textRate" },
								{ label: "Talk Rate", value: "talkRate" },
								{ label: "Restrictions", value: "restrictions" },
							],
						}),
					],
				}),
			],
		};
	};

	public selectSetting: Component = async (ctx: Context, [setting]) => {
		switch (setting) {
			case "enabled":
				return this.editBoolean(ctx, setting as keyof Levels as string);
			case "boost":
			case "stackRewards":
				return this.editBoolean(ctx, setting as keyof Levels as string);
			case "notify":
				return this.editSubSettings(ctx, setting);
			case "notifyEnabled":
				return this.editBoolean(ctx, "notifyEnabled");
			case "notifyChannel":
				return this.selectChannel(ctx, "notifyChannel");
			case "notifyMessage":
				return this.modals.editNotifyMessage;
			case "textRate":
			case "talkRate":
			case "restrictions":
		}
	};

	public editMessage: Component = async (ctx: Context, [message]) => {
		await updateGuild(ctx.guild.id, {
			levels: { notifyMessageContent: message },
		});

		return this.editSettings(ctx);
	};

	public modals = {
		editNotifyMessage: modal({
			title: "Level Up Notification",
			method: "levels/settings",
			components: [
				actionRow({
					command: "levels/settings",
					components: [
						{
							type: ComponentType.TextInput,
							custom_id: "name",
							label: "Name",
							style: TextInputStyle.Paragraph,
							min_length: 1,
							max_length: 4000,
							placeholder: "**Congrats** {user}! You are now level **{level}** 🎉!",
							required: true,
							method: this.editMessage,
						},
					],
				}),
			],
		}),
	};

	// when a user selects a setting with sub settings like notify, textRate, talkRate, restrictions, etc.
	// show another select menu with the sub settings
	public editSubSettings: Component = async (ctx: Context, setting) => {
		const { levels } = await getGuild(ctx.guild.id);

		return {
			embeds: [this.generateEmbed(levels, setting)],
			components: [
				actionRow({
					command: "levels/settings",
					context: JSON.stringify({
						setting,
					}),
					components: [
						select({
							method: this.selectSetting,
							placeholder: "Select a setting to edit",
							options: [
								{ label: "Enabled", value: "notifyEnabled" },
								{ label: "Destination", value: "notifyChannel" },
								{ label: "Message", value: "notifyMessage" },
							],
						}),
					],
				}),
			],
		};
	};

	public selectChannel: Component = async (ctx: Context, setting) => {
		return {
			components: [
				actionRow({
					command: "levels/settings",
					context: JSON.stringify({
						setting,
					}),
					components: [
						select({
							method: this.editChannel,
							placeholder: "Select a channel",
							type: ComponentType.ChannelSelect,
						}),
					],
				}),
			],
		};
	};

	public editChannel: Component = async (ctx: Context, [channel, json]) => {
		const { setting } = JSON.parse(json);

		await updateGuild(ctx.guild.id, {
			levels: { [setting]: channel },
		});

		return this.editSettings(ctx);
	};

	public editBoolean: Component = async ({ guild }: Context, setting) => {
		const { levels } = await getGuild(guild.id);

		const { text, emoji } = formatBooleanForButton(levels[setting as keyof Levels] as boolean);

		return {
			embeds: [this.generateEmbed(levels, setting as keyof Levels)],
			components: [
				actionRow({
					command: "levels/settings",
					context: JSON.stringify({
						setting,
						value: levels[setting as keyof Levels],
					}),
					components: [
						button({
							method: this.toggleSetting,
							label: text,
							emoji,
						}),
					],
				}),
			],
		};
	};

	public toggleSetting: Component = async (ctx: Context, [json]) => {
		const { setting, value } = JSON.parse(json);

		await updateGuild(ctx.guild.id, {
			levels: { [setting]: !booleanFromString(value) },
		});

		return this.editSettings(ctx);
	};

	public generateEmbed(levels: Levels, setting: keyof Levels | null = null) {
		const embed = {
			title: "Levels",
			description: stripIndents`
						${subtext("View and edit your server's leveling settings.")}

						${levels.enabled ? "" : `${bold("Note")}: The Levels plugin is disabled in this server.`}
					`,
			fields: [
				{
					__id: "enabled",
					name: "Enabled",
					value: formatBoolean(levels.enabled),
					inline: true,
				},
				{
					__id: "boost",
					name: "Multiplier",
					value: bold(`${levels.boost}x`),
					inline: true,
				},
				{
					__id: "stackRewards",
					name: "Stack Rewards",
					value: formatBoolean(levels.stackRewards),
					inline: true,
				},
				{
					__id: "notify",
					name: "Level Up Notification",
					value: stripIndents`
								${subtext("Customize the message sent when a user levels up.")}
							`,
				},
				{
					__id: "notify",
					name: formatBoolean(levels.notifyEnabled),
					value: "",
					inline: true,
				},
				{
					__id: "notify",
					value: "",
					name: `${"Send to"} ${
						levels.notifyChannel ? channelMention(levels.notifyChannel as string) : "Current Channel"
					}`,
					inline: true,
				},
				{
					__id: "notify",
					name: "",
					value: "",
					inline: true,
				},
				{
					__id: "notify",
					name: "Message",
					value: stripIndents`
								${codeBlock("yaml", levels.notifyMessage ?? "Not Set")}
							`,
				},
				{
					__id: "textRate",
					name: "Text Rate",
					value: `${bold(`${levels.textRateMin}-${levels.textRateMax ?? "∞"}xp`)} every ${bold(
						levels.textCooldown.toString(),
					)} seconds`,
					inline: true,
				},
				// {
				// 	__id: "talkRate",
				// 	name: "Talk Rate",
				// 	value: `${bold(`${levels.talkRateMin}-${levels.talkRateMax ?? "∞"}xp`)} every ${bold(
				// 		levels.talkCooldown.toString(),
				// 	)} seconds`,
				// 	inline: true,
				// },
				{
					__id: "restrictions",
					name: "Restrictions",
					value: stripIndents`
								${subtext("Allow or deny roles, users, or channels from using the leveling system.")}
								${codeBlock(
									"yaml",
									stripIndents`
										Roles    :: ${levels.roleRestriction?.omit.length ?? 0} ${levels.roleRestriction?.type ?? "Not Set"}
										Users    :: ${levels.userRestriction?.omit.length ?? 0} ${levels.userRestriction?.type ?? "Not Set"}
										Channels :: ${levels.channelRestriction?.omit.length ?? 0} ${levels.channelRestriction?.type ?? "Not Set"}
									`,
								)}
							`,
				},
			],
		};

		if (setting) {
			embed.description = "";
			embed.fields = embed.fields.filter((field) => field.__id === setting);
		}

		return embed;
	}
}
