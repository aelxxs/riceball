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

import { ItemType } from "@riceball/db";
import type { Command, Context } from "library/core";
import { Economy } from "library/plugins";
import { inject, injectable } from "tsyringe";

@injectable()
export default class implements Command {
	public constructor(@inject(Economy) private economy: Economy) {}

	/**
	 * Autocomplete for the command
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public autocompleteRun({ guild, author }: Context, { item }: Options) {
		return this.economy.searchInventory(guild.id, author.id, item ?? "");
	}

	/**
	 * Use an item from your inventory
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ guild, author }: Context, { item }: Options) {
		const { item: used, remaining } = await this.economy.use(guild.id, author.id, item);

		const reward =
			used.type === ItemType.ROLES
				? "Your role(s) have been granted."
				: used.type === ItemType.BADGE
					? "The badge has been added to your collection, equip it with `/badge set`."
					: "";

		const response = used.response?.content ? `\n${used.response.content}` : "";

		return `Used \`${used.name}\`. ${reward} You have ${remaining} left.${response}`;
	}
}

interface Options {
	/* The item to use */
	item: string;
}
