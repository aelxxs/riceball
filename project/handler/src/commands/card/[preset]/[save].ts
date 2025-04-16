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

import { CardPreset, Database } from "@riceball/db";
import type { Command, Context } from "library/core";
import { inject, injectable } from "tsyringe";

@injectable()
export default class implements Command {
	public db: Database;

	public constructor(@inject(Database) db: Database) {
		this.db = db;
	}

	/**
	 * Save your current card design as a preset
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ guild, author }: Context, { name, description, public: isPublic }: Options) {
		const { cardPresets } = await this.db.getUserSettings(author.id);
		const { card } = await this.db.getMemberSettings(guild.id, author.id);

		const preset = cardPresets.find((preset) => preset.name === name);

		if (preset) {
			throw "This preset name is already taken. Please choose another one.";
		}

		if (cardPresets.length >= 100) {
			throw "You have reached the maximum number of presets. Please delete one to create a new one.";
		}

		const newPreset = this.db.rm.cardPresets.create({
			id: crypto.randomUUID(),
			name,
			description: description ?? null,
			public: isPublic ?? false,
			card,
			user: author.id,
		});

		await this.db.setUserSettings(author.id, {
			cardPresets: [...cardPresets, newPreset],
		});

		return "Your preset has been saved successfully!";
	}
}

interface Options {
	/* Provide a name for your preset */
	name: string;
	/* Provide a description for your preset */
	description: string;
	/* Make the preset public for others to use (default: false) */
	public: boolean;
}
