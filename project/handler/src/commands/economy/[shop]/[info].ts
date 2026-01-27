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

import { Database, ItemType } from "@riceball/db";
import type { Command, Context } from "library/core";
import { inject, injectable } from "tsyringe";

@injectable()
export default class implements Command {
	public constructor(@inject(Database) private db: Database) {}

	/**
	 * Autocomplete for the command
	 *
	 * @param {Context} context - The context of the command
	 * @param {string} input - The input of the user
	 **/
	public async autocompleteRun({ guild }: Context, input: string) {
		const transformed = input.toLowerCase().trim();

		const items = await this.db.rm.items.find({ guildId: guild.id });

		const filtered = items
			.filter((item) => item.name.toLowerCase().includes(transformed))
			.slice(0, 25)
			.map((item) => ({
				name: `${item.name}${item.active ? "" : " (Archived)"}`,
				value: item._id,
			}));

		return filtered;
	}

	/**
	 * Display information about a shop item
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ guild }: Context, { item }: Options) {
		const shopItem = await this.db.rm.items.findOne({ _id: item, guildId: guild.id });

		if (!shopItem) {
			return "Item not found. Please ensure the item exists in your server's shop.";
		}

		const { economy } = await this.db.getGuildSettings(guild.id);
		const currency = economy.currencyIcon ?? economy.currencyName;

		const itemTypeDisplay = {
			[ItemType.ROLES]: "🔖 Role",
			[ItemType.BADGE]: "🧧 Badge",
			[ItemType.STATIC]: "📦 Static",
			[ItemType.CUSTOM]: "⚙️ Custom",
		}[shopItem.type];

		const stockDisplay = shopItem.stock === -1 ? "Unlimited" : shopItem.stock.toString();
		const statusEmoji = shopItem.active ? "✅" : "📦";

		return {
			embeds: [
				{
					title: `${shopItem.icon ?? "🛍️"} ${shopItem.name}`,
					description: shopItem.about ?? "No description provided.",
					fields: [
						{
							name: "Type",
							value: itemTypeDisplay,
							inline: true,
						},
						{
							name: "Price",
							value: `${shopItem.price} ${currency}`,
							inline: true,
						},
						{
							name: "Stock",
							value: stockDisplay,
							inline: true,
						},
						{
							name: "Purchase Limit",
							value: shopItem.limit === -1 ? "Unlimited" : shopItem.limit.toString(),
							inline: true,
						},
						{
							name: "Status",
							value: `${statusEmoji} ${shopItem.active ? "Active" : "Archived"}`,
							inline: true,
						},
						{
							name: "Auto-Use",
							value: shopItem.autoUse ? "✅ Yes" : "❌ No",
							inline: true,
						},
					],
					color: shopItem.active ? 0x57f287 : 0x5865f2,
					footer: {
						text: `Item ID: ${shopItem._id}`,
					},
				},
			],
		};
	}
}

interface Options {
	/* The shop item to display information about */
	item: string;
}
