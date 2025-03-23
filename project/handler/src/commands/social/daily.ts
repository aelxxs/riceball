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
import { getGuild, getMember, updateMember } from "db";
import ms from "ms";

const ONE_DAY = 86400000;

export default class implements Command {
	/**
	 * Claim your daily reward
	 *
	 * @param {Context} context - The context of the command
	 **/
	public async chatInputRun({ author, guild }: Context) {
		const { lastDaily } = await getMember(guild.id, author.id);

		const now = Date.now();
		const dif = now - lastDaily;

		if (dif >= ONE_DAY) {
			const { economy } = await getGuild(guild.id);
			const { dailyRewardMin, dailyRewardMax } = economy;

			const reward = Math.floor(Math.random() * (dailyRewardMax - dailyRewardMin + 1)) + dailyRewardMin;

			const { bal } = await getMember(guild.id, author.id);

			await updateMember(guild.id, author.id, {
				bal: bal + reward,
				lastDaily: now,
			});

			return `You claimed your daily reward of \`${reward.toLocaleString()}\` ${
				economy.currencyIcon
			}! You now have a balance of \`${(bal + reward).toLocaleString()}\` ${economy.currencyIcon}`;
		}

		const timeLeft = ONE_DAY - dif;

		throw `You can claim your daily reward in \`${ms(timeLeft, { long: true })}\`!`;
	}
}
