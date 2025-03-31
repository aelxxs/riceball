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

import { Database } from "@riceball/db";
import type { Command, Context } from "library/core";
import ms from "ms";
import { inject, injectable } from "tsyringe";

const ONE_DAY = 86400000;

@injectable()
export default class implements Command {
	public db: Database;

	public constructor(@inject(Database) db: Database) {
		this.db = db;
	} /**
	 * Claim your daily reward
	 *
	 * @param {Context} context - The context of the command
	 **/
	public async chatInputRun({ author, guild }: Context) {
		const { lastDaily, bal } = await this.db.getMemberSettings(guild.id, author.id);

		const now = Date.now();
		const dif = now - lastDaily;

		if (dif >= ONE_DAY) {
			const { economy } = await this.db.getGuildSettings(guild.id);
			const { dailyRewardMin, dailyRewardMax } = economy;

			const reward = Math.floor(Math.random() * (dailyRewardMax - dailyRewardMin + 1)) + dailyRewardMin;

			await this.db.setMemberSettings(guild.id, author.id, {
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
