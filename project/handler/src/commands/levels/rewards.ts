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

// import { getLevelingRewards } from "@riceball/db";
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
		// const rewards = await getLevelingRewards(guild.id);
		// return {
		// 	embeds: [
		// 		{
		// 			thumbnail: {
		// 				url: getGuildIcon(guild),
		// 			},
		// 			author: {
		// 				name: `${guild.name} – Rewards`,
		// 				icon_url: getGuildIcon(guild),
		// 			},
		// 			description: stripIndents`
		// 				\`\`\`
		// 				Viewing Leveling Rewards
		// 				\`\`\`
		// 				> ${rewards.length === 0 ? "No rewards have been set up yet." : ""}
		// 			`,
		// 			fields: rewards.map((reward) => ({
		// 				name: `${reward.level} – ${this.levels.totalXpReq(reward.level)} exp.`,
		// 				value: `> ${reward.roles.map((role) => `<@&${role}>`).join(" ")}`,
		// 			})),
		// 			footer: {
		// 				text: "Rice Ball – Rewards",
		// 			},
		// 		},
		// 	],
		// };
	}
}
