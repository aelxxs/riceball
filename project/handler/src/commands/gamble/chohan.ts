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

import { bold } from "@discordjs/formatters";
import { Database } from "@riceball/db";
import { stripIndents } from "common-tags";
import { Constants } from "library/common";
import type { Command, Context } from "library/core";
import { inject, injectable } from "tsyringe";

@injectable()
export default class implements Command {
	public db: Database;

	public constructor(@inject(Database) db: Database) {
		this.db = db;
	}
	/**
	 * Play a game of chohan
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ guild, author }: Context, { wager, choice }: Options) {
		const { economy } = await this.db.getGuildSettings(guild.id);
		const { bal } = await this.db.getMemberSettings(guild.id, author.id);

		const currency = `${economy.currencyIcon ?? economy.currencyName}`;

		if (
			wager < economy.wagerMin
			|| wager > (economy.wagerMax === 0 ? Number.POSITIVE_INFINITY : economy.wagerMax)
		) {
			throw `You must wager between ${currency} ${economy.wagerMin.toLocaleString()} and ${currency} ${economy.wagerMax.toLocaleString()}.`;
		}

		if (bal < wager) {
			throw `You do not have enough ${currency} to play chohan.`;
		}

		// Roll two dice (1-6)
		const roll1 = Math.floor(Math.random() * 6) + 1;
		const roll2 = Math.floor(Math.random() * 6) + 1;
		const sum = roll1 + roll2;

		const isEven = sum % 2 === 0;
		const won = (isEven && choice === "even") || (!isEven && choice === "odd");

		const newBal = bal + (won ? wager : -wager);

		await this.db.setMemberSettings(guild.id, author.id, {
			bal: newBal,
		});

		return {
			embeds: [
				{
					description: stripIndents`
						${bold("Chohan")} - A traditional Japanese gambling game

						**Results:** ${Constants.Emoji.Dice[roll1 as 1 | 2 | 3 | 4 | 5 | 6]} ${Constants.Emoji.Dice[roll2 as 1 | 2 | 3 | 4 | 5 | 6]}
						**Sum:** ${sum} (${isEven ? "Even" : "Odd"})
						**Your Bet:** ${choice === "even" ? "Even (Cho)" : "Odd (Han)"}

						${won ? `🎉 ${bold("You won!")}` : `💔 ${bold("You lost!")}`}
						${won ? `+${currency} ${wager.toLocaleString()}` : `-${currency} ${wager.toLocaleString()}`}

						**New Balance:** ${currency} ${newBal.toLocaleString()}
					`,
				},
			],
		};
	}
}

interface Options {
	/* The amount of money to wager */
	wager: number;
	/* The choice to make */
	choice: "even" | "odd";
}
