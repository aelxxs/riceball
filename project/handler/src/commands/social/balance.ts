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
import { getGuild, getMember } from "db";
import type { APIUser } from "discord-api-types/v10";

export default class implements Command {
	/**
	 * View your or another user's balance
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ guild, user: member }: Context, { user }: Options) {
		const { bal } = await getMember(user?.id ?? member.id, guild.id);
		const { economy } = await getGuild(guild.id);

		return `${user ? `${user.username} has` : "You have"} a balance of ${bal.toLocaleString()} ${
			economy.currencyIcon
		}`;
	}
}

interface Options {
	/* A user in this server */
	user?: APIUser;
}
