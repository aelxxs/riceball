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

import { getGuild, updateGuild } from "@riceball/db";
import type { Command, Context } from "library/core";

export default class implements Command {
	/**
	 * Set the minimum wager amount
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ guild }: Context, { amount }: Options) {
		const { economy } = await getGuild(guild.id);

		if (amount > economy.wagerMax) {
			throw "The minimum wager amount cannot be greater than the maximum wager amount.";
		}

		await updateGuild(guild.id, {
			economy: {
				wagerMin: amount,
			},
		});

		return `The minimum wager amount has been set to ${amount}.`;
	}
}

interface Options {
	/* The minimum wager amount */
	amount: number;
}
