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
import { Economy } from "library/plugins";
import ms from "ms";
import { inject, injectable } from "tsyringe";

const DEFAULT_DAILY_COOLDOWN = 86400;

@injectable()
export default class implements Command {
	public constructor(
		@inject(Database) private db: Database,
		@inject(Economy) private economy: Economy,
	) {}

	/**
	 * Claim your daily reward
	 *
	 * @param {Context} context - The context of the command
	 **/
	public async chatInputRun({ author, guild }: Context) {
		const economy = await this.economy.getSettings(guild.id);
		const { lastDaily } = await this.db.getMemberSettings(guild.id, author.id);

		// Settings cached before dailyCooldown existed won't have it
		const cooldown = (economy.dailyCooldown > 0 ? economy.dailyCooldown : DEFAULT_DAILY_COOLDOWN) * 1000;

		const now = Date.now();
		const elapsed = now - lastDaily;

		if (elapsed < cooldown) {
			throw `You can claim your daily reward in \`${ms(cooldown - elapsed, { long: true })}\`!`;
		}

		const { dailyRewardMin, dailyRewardMax } = economy;
		const reward = Math.floor(Math.random() * (dailyRewardMax - dailyRewardMin + 1)) + dailyRewardMin;

		await this.db.setMemberSettings(guild.id, author.id, { lastDaily: now });
		const bal = await this.economy.giveBalance(guild.id, author.id, reward);

		return `You claimed your daily reward of \`${reward.toLocaleString()}\` ${
			economy.currencyIcon
		}! You now have a balance of \`${bal.toLocaleString()}\` ${economy.currencyIcon}`;
	}
}
