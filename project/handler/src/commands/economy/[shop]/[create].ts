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

import {} from "@riceball/db";
import { actionRow, select } from "library/components";
import type { Command, Context } from "library/core";

/**
 * The methods of the shop create command
 * @enum {string}
 *
 */
enum ShopCreateMethods {
	SelectItemType = "selectItemType",
}

/**
 * The shop create command
 *
 * Userflow:
 * 		1. User selects the type of item they want to create
 * 		2. User selects the item they want to create
 * 		3. User inputs the price of the item
 * 		4. User inputs the stock of the item
 * 		5. User inputs the item's description
 * 		6. User inputs the item's image or emoji/emote
 * 		7. User inputs the item's role
 * 		8. User inputs the item's channel
 * 		9. User inputs the item's emoji
 */
export default class implements Command {
	/**
	 * Create a shop item
	 *
	 * @param {Context} context - The context of the command
	 **/
	public chatInputRun({ t }: Context) {
		return {
			embeds: [
				{
					title: "Create a shop item",
					description: "Please select the type of item you want to create.",
				},
			],
		};
	}
}
