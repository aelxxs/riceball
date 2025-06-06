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

import { Database, type FontFamily } from "@riceball/db";
import type { Command, Context } from "library/core";
import { inject, injectable } from "tsyringe";

@injectable()
export default class implements Command {
	public db: Database;

	public constructor(@inject(Database) db: Database) {
		this.db = db;
	} /**
	 * Set the font family for the text on your card
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ guild, author }: Context, { value }: Options) {
		await this.db.setMemberSettings(guild.id, author.id, {
			card: {
				fontFamily: value as FontFamily,
			},
		});

		return `Set your rank card's font family to \`${value}\``;
	}
}

interface Options {
	/* Provide the font family name or URL */
	value: "MONOSPACE" | "SANS_SERIF" | "SERIF" | "HANDWRITING" | "CURSIVE";
}
