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

import { roleMention } from "@discordjs/formatters";
import { stripIndents } from "common-tags";
import { type Command, type Context, getGuildIcon } from "library/core";
import { Levels } from "library/plugins";
import { inject, injectable } from "tsyringe";

@injectable()
export default class implements Command {
	public constructor(@inject(Levels) public levels: Levels) {}

	/**
	 * View your server's leveling rewards
	 *
	 * @param {Context} context - The context of the command
	 **/
	public async chatInputRun({ guild }: Context) {
		const rewards = await this.levels.getRewards(guild.id);
		const icon = getGuildIcon(guild);

		return {
			embeds: [
				{
					thumbnail: icon ? { url: icon } : undefined,
					author: {
						name: `${guild.name} – Rewards`,
						icon_url: icon,
					},
					description: stripIndents`
						\`\`\`
						Viewing Leveling Rewards
						\`\`\`
						${rewards.length === 0 ? "> No rewards have been set up yet." : ""}
					`,
					fields: rewards.slice(0, 25).map((reward) => ({
						name: `Level ${reward.level} – ${this.levels.totalXpReq(reward.level).toLocaleString()} exp.`,
						value: `> ${reward.roles.map((role) => roleMention(role)).join(" ")}`,
					})),
					footer: {
						text: "Rice Ball – Rewards",
					},
				},
			],
		};
	}
}
