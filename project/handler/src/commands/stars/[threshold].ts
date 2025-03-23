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
import type { Command, Context } from "@lib/core";
import { updateGuild } from "db";

export default class implements Command {
	/**
	 * Configure the amount of reactions required for a message to be posted to the starboard
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ guild }: Context, { threshold }: Options) {
		await updateGuild(guild.id, {
			stars: { threshold },
		});

		return `Messages will now be posted to the starboard if they have ${bold(threshold.toString())} or more reactions.`;
	}
}

interface Options {
	/* The amount of reactions required for a message to be posted to the starboard */
	threshold: number /* Bound: [1, Inf] */;
}
