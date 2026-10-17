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
import { Deps } from "library/common";
import type { Command, Context } from "library/core";
import { container, inject, injectable } from "tsyringe";
import type RankCommand from "../../levels/rank";

@injectable()
export default class implements Command {
	public db: Database;

	public constructor(@inject(Database) db: Database) {
		this.db = db;
	}

	/**
	 * Autocomplete for the command
	 *
	 * @param {Context} context - The context of the command
	 * @param {string} input - The input of the user
	 **/
	public async autocompleteRun({ author }: Context, { name }: Options) {
		const { cardPresets } = await this.db.getUserSettings(author.id);

		if (name.length < 1) {
			return cardPresets.map((preset) => ({
				name: preset.name,
				value: preset.id,
			}));
		}

		return cardPresets
			.filter((preset) => preset.name.toLowerCase().includes(name.toLowerCase()))
			.map((preset) => ({
				name: preset.name,
				value: preset.id,
			}));
	}

	/**
	 * Preview a saved preset design
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ guild, author }: Context, { name: id }: Options) {
		const { cardPresets } = await this.db.getUserSettings(author.id);

		const presetToPreview = cardPresets.find((preset) => preset.id === id);

		if (!presetToPreview) {
			throw "This preset does not exist.";
		}

		// resolved at runtime rather than imported so the bundler keeps rank.ts, and its asset paths, in its own file
		const rank = container.resolve<Map<string, Command>>(Deps.Plugins).get("rank") as RankCommand;
		const card = await rank.generateRankCard(guild, author, presetToPreview.card);

		return {
			content: `Preview of the **${presetToPreview.name}** preset:`,
			files: [{ name: `${Date.now()}-${author.username}-preset.png`, data: card }],
		};
	}
}

interface Options {
	/* Provide the name of the preset to preview */
	name: string;
}
