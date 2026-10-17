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

const MIN_COOLDOWN = 60;
const MAX_COOLDOWN = 30 * 24 * 60 * 60;

@injectable()
export default class implements Command {
	public constructor(@inject(Database) private db: Database) {}

	/**
	 * Set the daily cooldown
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ guild }: Context, { cooldown }: Options) {
		const input = cooldown.trim();
		// A bare number is read as hours, matching the command's original behaviour
		const millis = /^\d+(\.\d+)?$/.test(input) ? Number(input) * 60 * 60 * 1000 : ms(input as ms.StringValue);
		const seconds = Math.round(millis / 1000);

		if (!Number.isFinite(seconds) || seconds < MIN_COOLDOWN || seconds > MAX_COOLDOWN) {
			throw "Please provide a cooldown between 1 minute and 30 days, e.g. `24h`, `12h` or `1d`.";
		}

		await this.db.setGuildSettings(guild.id, {
			economy: { dailyCooldown: seconds },
		});

		return `The daily cooldown has been set to ${ms(seconds * 1000, { long: true })}.`;
	}
}

interface Options {
	/* The daily cooldown, e.g. 24h or 1d */
	cooldown: string;
}
