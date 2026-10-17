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
import { Economy, UNLIMITED } from "library/plugins";
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
			name: `${shopItem.name} • ${shopItem.price.toLocaleString()}${shopItem.stock === UNLIMITED ? "" : ` • ${shopItem.stock} left`}`,
			value: shopItem._id.toString(),
		}));
	}

	/**
	 * Buy an item from the shop
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ guild, author }: Context, { item }: Options) {
		const economy = await this.economy.getSettings(guild.id);
		const result = await this.economy.purchase(guild.id, author.id, item);

		const price = this.economy.formatCurrency(economy, result.item.price);
		const balance = this.economy.formatCurrency(economy, result.bal);

		return `Purchased \`${result.item.name}\` for ${price}. ${this.describeReward(result.item.type, result.used)}\nYour balance is now ${balance}.`;
	}

	private describeReward(type: ItemType, used: boolean) {
		if (!used) {
			return "It has been added to your inventory, use `/use` to redeem it.";
		}

		if (type === ItemType.ROLES) {
			return "Your role(s) have been granted.";
		}

		if (type === ItemType.BADGE) {
			return "The badge has been added to your collection, equip it with `/badge set`.";
		}

		return "The item has been used.";
	}
}

interface Options {
	/* The item to buy */
	item: string;
}
