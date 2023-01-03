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

import type { Command, Context } from "@lib/core";
import { stripIndents } from "common-tags";
import { getGuild } from "db";

export default class implements Command {
	/**
	 * View your server's Starboard settings
	 *
	 * @param {Context} context - The context of the command
	 **/
	public async chatInputRun({ guild }: Context) {
		const { stars } = await getGuild(guild.id);

		return {
			title: "Starboard Settings",
			description: stripIndents`
				\`\`\`
				Here are your server's current starboard settings.
				\`\`\`
			`,
			fields: [
				{
					name: "Enabled",
					value: stars.enabled ? "Yes" : "No",
					inline: true,
				},
				{
					name: "Channel",
					value: stars.channelId ? `<#${stars.channelId}>` : "None",
					inline: true,
				},
				{
					name: "Minimum Star Threshold",
					value: stars.threshold.toString(),
					inline: true,
				},
				{
					name: "Allow Self-Starring",
					value: stars.selfStarEnabled ? "Yes" : "No",
				},
				{
					name: "Warn on Self-Starring",
					value: stars.selfStarWarning ? "Yes" : "No",
				},
			],
		};
	}
}
