/**
 * Author: Alexis Vielma
 **/

import { APIEmbed } from "discord-api-types/v10";
import { read } from "@lib/data";
import { stripIndents } from "common-tags";
import { getGuildIcon } from "@lib/core";

export default class implements Command {
	/**
	 * View your server's Leveling settings
	 *
	 * @param {Context} context
	 * @param {Options} options
	 **/
	public async chatInputRun({ t, guild }: Context) {
		const { levels } = await read(guild);

		const config = {
			enabled: true,
			expRate: {
				max: null,
				min: null,
				cooldown: null,
			},
			autoPrune: false,
			maxExpCap: null,
			clearOnLeave: false,
			replaceRewards: true,
		};

		return {
			color: 12704186,
			author: {
				name: `${guild.name} – Levels Config`,
				icon_url: `${getGuildIcon(guild)}`,
			},
			description: stripIndents`
				\`\`\`
				Viewing Plugin Settings: Levels
				\`\`\`
				${levels.enabled ? "" : "> Note: Levels module is disabled in this server."}
			`,
			fields: [
				{
					name: "Announcements",
					value: stripIndents`
						\`\`\`
						[Enabled]  ::  ${levels.announcement.enabled ? "Yes" : "No"}
						[Channel]  ::  ${levels.announcement.channel ?? "None"}
						[Message]  ::  ${levels.announcement.message ? "=>" : "Default"}
						${levels.announcement.message}
						\`\`\`
					`,
				},
				{
					name: "Blacklist",
					value: stripIndents`
						\`\`\`
						[Roles]     =>  ${levels.blacklist.roles.length}
						[Users]     =>  ${levels.blacklist.users.length}
						[Channels]  =>  ${levels.blacklist.channels.length}
						\`\`\`
						[View Blacklist Online](https://riceball.bot/manage/${guild.id}/levels#blacklist)
				`,
					inline: true,
				},
				{
					name: "Whitelist",
					value: stripIndents`
						\`\`\`
						[Roles]     =>  ${levels.whitelist.roles.length}
						[Users]     =>  ${levels.whitelist.users.length}
						[Channels]  =>  ${levels.whitelist.channels.length}
						\`\`\`
						[View Whitelist Online](https://riceball.bot/manage/${guild.id}/levels#whitelist)
					`,
					inline: true,
				},
			],
			footer: {
				text: "Rice Ball – Levels",
			},
			timestamp: new Date().toISOString(),
		} as APIEmbed;
	}
}
