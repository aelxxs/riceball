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
import { inject, injectable } from "tsyringe";

@injectable()
export default class implements Command {
	public db: Database;

	public constructor(@inject(Database) db: Database) {
		this.db = db;
	}
	/**
	 * View and apply preset designs for your leveling card
	 *
	 * @param {Context} context - The context of the command
	 **/
	public async chatInputRun({ author }: Context) {
		const { cardPresets } = await this.db.getUserSettings(author.id);

		if (cardPresets.length < 1) {
			throw "You don't have any presets saved. Please save one first.";
		}

		return {
			embeds: [
				{
					title: "Card Presets",
					description: cardPresets
						.map((preset) => `**${preset.name}**\n${preset.description ?? "No description"}\n`)
						.join("\n"),
					color: 0x00ff00,
					footer: {
						text: "Use `/card [preset] [use]` to apply a preset.",
					},
				},
			],
		};
	}
}
