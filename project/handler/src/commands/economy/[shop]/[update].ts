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
import { Economy, UNLIMITED, type UpdateItemInput } from "library/plugins";
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
		const items = await this.economy.searchItems(guild.id, item ?? "");

		return items.map((shopItem) => ({
			name: `${shopItem.name}${shopItem.active ? "" : " (Archived)"}`,
			value: shopItem._id.toString(),
		}));
	}

	/**
	 * Update a shop item
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ guild }: Context, { item, name, price, stock, description, limit }: Options) {
		const shopItem = await this.economy.fetchItem(guild.id, item);

		if (!shopItem) {
			return "Item not found. Please ensure the item exists in your server's shop.";
		}

		const changes: UpdateItemInput = {};

		if (name !== undefined) {
			const trimmed = name.trim();
			const items = await this.economy.fetchItems(guild.id);
			const taken = items.some(
				(other) =>
					other._id.toString() !== shopItem._id.toString()
					&& other.name.toLowerCase() === trimmed.toLowerCase(),
			);

			if (!trimmed || trimmed.length > 100) {
				throw "Name must be between 1 and 100 characters.";
			}

			if (taken) {
				throw `An item named \`${trimmed}\` already exists.`;
			}

			changes.name = trimmed;
		}

		if (price !== undefined) changes.price = price;
		if (stock !== undefined) changes.stock = stock;
		if (limit !== undefined) changes.limit = limit;
		if (description !== undefined) changes.about = description;

		if (!Object.keys(changes).length) {
			throw "Provide at least one field to update.";
		}

		const previousName = shopItem.name;
		await this.economy.updateItem(guild.id, shopItem, changes);

		const summary = Object.entries(changes)
			.map(([key, value]) => `\`${key}\` → \`${value === UNLIMITED ? "unlimited" : value}\``)
			.join(", ");

		return `Updated \`${previousName}\`: ${summary}.`;
	}
}

interface Options {
	/* The shop item to update */
	item: string;
	/* The new name of the item */
	name?: string;
	/* The new price of the item */
	price?: number;
	/* The new stock of the item, -1 for unlimited */
	stock?: number;
	/* The new description of the item */
	description?: string;
	/* How many of this item a member may hold, -1 for unlimited */
	limit?: number;
}
