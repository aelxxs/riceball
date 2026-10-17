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
import type { APIUser } from "discord-api-types/v10";
import { type Command, type Context, getUserAvatar } from "library/core";
import { Economy } from "library/plugins";
import { inject, injectable } from "tsyringe";

const TYPE_ICONS: Record<ItemType, string> = {
	[ItemType.ROLES]: "🔖",
	[ItemType.BADGE]: "🧧",
	[ItemType.STATIC]: "📦",
	[ItemType.CUSTOM]: "⚙️",
};

@injectable()
export default class implements Command {
	public constructor(@inject(Economy) private economy: Economy) {}

	/**
	 * View your or another user's inventory
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ guild, author }: Context, { user }: Options) {
		const target = user ?? author;

		if (target.bot) {
			return "Bots don't have inventories.";
		}

		const economy = await this.economy.getSettings(guild.id);
		const inventory = await this.economy.fetchInventory(guild.id, target.id);

		const size = economy.inventorySize > 0 ? `${inventory.length}/${economy.inventorySize}` : `${inventory.length}`;

		const lines = inventory.map(({ item, name, amount }) => {
			const icon = item ? TYPE_ICONS[item.type] : "❔";
			const status = item ? "" : " *(no longer in the shop)*";
			return `${icon} **${item?.name ?? name}** × ${amount}${status}`;
		});

		return {
			embeds: [
				{
					author: { name: `${target.username}'s Inventory`, icon_url: getUserAvatar(target) },
					description: lines.length
						? lines.join("\n")
						: `${user ? `${target.username} doesn't` : "You don't"} have any items yet. Check out \`/shop\`!`,
					footer: {
						text: economy.autoUseItems
							? `Slots: ${size} • Auto-use is enabled, purchased items are used immediately`
							: `Slots: ${size} • Use /use to redeem an item`,
					},
				},
			],
		};
	}
}

interface Options {
	/* A user in this server */
	user?: APIUser;
}
