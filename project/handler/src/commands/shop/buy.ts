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

// import { getActiveShopItems } from "@riceball/db";
import type { Command, Context } from "library/core";

export default class implements Command {
	/**
	 * Autocomplete for the command
	 *
	 * @param {Context} context - The context of the command
	 * @param {string} input - The input of the user
	 **/
	// public async autocompleteRun({ guild }: Context, input: string) {
	// 	const shop = await getActiveShopItems(guild.id);

	// 	const similarItems = shop.filter((item) => item.name.toLowerCase().startsWith(input.toLowerCase()));

	// 	return similarItems.map((item) => {
	// 		return { name: item.name, value: item.id };
	// 	});
	// }

	/**
	 * Buy an item from the shop
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public chatInputRun({ guild }: Context, { item }: Options) {
		return "Sorry, this command was registered but not implemented. Please try again later.";
	}
}

interface Options {
	/* The item to buy */
	item: string;
}
