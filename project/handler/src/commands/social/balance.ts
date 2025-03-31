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
import type { APIUser } from "discord-api-types/v10";
import type { Command, Context } from "library/core";
import { inject, injectable } from "tsyringe";

@injectable()
export default class implements Command {
	public db: Database;

	public constructor(@inject(Database) db: Database) {
		this.db = db;
	}
	/**
	 * View your or another user's balance
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ guild, author }: Context, { user }: Options) {
		const { bal } = await this.db.getMemberSettings(guild.id, author.id);
		const { economy } = await this.db.getGuildSettings(guild.id);

		return `${user ? `${user.username} has` : "You have"} a balance of **${bal.toLocaleString()}** ${
			economy.currencyIcon
		}`;
	}
}

interface Options {
	/* A user in this server */
	user?: APIUser;
}
