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
	 * Delete a saved preset design
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ author }: Context, { name: id }: Options) {
		const { cardPresets } = await this.db.getUserSettings(author.id);

		const presetToDelete = cardPresets.find((preset) => preset.id === id);

		if (!presetToDelete) {
			throw "This preset does not exist.";
		}

		this.db.em.remove(presetToDelete).flush();

		return `Sucessfully deleted preset **${presetToDelete.name}**!`;
	}
}

interface Options {
	/* Provide the name of the preset to delete, maps to id in chatInputRun */
	name: string;
}
