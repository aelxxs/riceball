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
import { inject, injectable } from "tsyringe";

@injectable()
export default class implements Command {
	public constructor(
		@inject(Database) private db: Database,
		@inject(Economy) private economy: Economy,
	) {}

	/**
	 * Set the balance new members start with
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ guild }: Context, { amount }: Options) {
		await this.db.setGuildSettings(guild.id, {
			economy: { defaultBalance: amount },
		});

		const { economy } = await this.db.getGuildSettings(guild.id);

		return `New members will now start with ${this.economy.formatCurrency(economy, amount)}. Existing balances are unchanged.`;
	}
}

interface Options {
	/* The starting balance */
	amount: number;
}
