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
	public async autocompleteRun({ guild }: Context, { item }: Options) {
		const items = await this.economy.searchItems(guild.id, item ?? "", { active: true });

		return items.map((shopItem) => ({
			name: shopItem.name,
			value: shopItem._id.toString(),
		}));
	}

	/**
	 * Archive a shop item
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ guild }: Context, { item }: Options) {
		const shopItem = await this.economy.fetchItem(guild.id, item);

		if (!shopItem) {
			return "Item not found. Please ensure the item exists in your server's shop.";
		}

		if (!shopItem.active) {
			return `The item \`${shopItem.name}\` is already archived.`;
		}

		await this.economy.updateItem(guild.id, shopItem, { active: false });

		return `Successfully archived \`${shopItem.name}\`. It will no longer appear in the shop.`;
	}
}

interface Options {
	/* The shop item to archive */
	item: string;
}
