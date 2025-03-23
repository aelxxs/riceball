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

export default class implements Command {
	/**
	 * Flip a coin
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ guild, author }: Context, { wager, choice }: Options) {
		const coin = Math.random() < 0.5 ? "heads" : "tails";

		const { bal } = await getMember(guild.id, author.id);
		const { economy } = await getGuild(guild.id);

		if (bal < wager) {
			throw `You do not have enough ${economy.currencyName ?? economy.currencyIcon} to make this wager.`;
		}

		await updateMember(guild.id, author.id, {
			bal: bal + (coin === choice ? wager : -wager),
		});

		if (coin === choice) {
			return `You won ${wager}! The coin landed on ${coin}.`;
		} else {
			throw `You lost ${wager}! The coin landed on ${coin}.`;
		}
	}
}

interface Options {
	/* The amount of money to wager */
	wager: number;
	/* The choice to make */
	choice: "heads" | "tails";
}
