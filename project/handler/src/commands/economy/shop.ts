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
import { actionRow, button } from "library/components";
import { type Command, type Component, type Context, getGuildIcon } from "library/core";
import { Economy, UNLIMITED } from "library/plugins";
import { inject, injectable } from "tsyringe";

const PAGE_SIZE = 5;

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
	 * View the items in the shop
	 *
	 * @param {Context} context - The context of the command
	 **/
	public chatInputRun(ctx: Context) {
		return this.render(ctx, 0);
	}

	public previous: Component = (ctx, page) => {
		return this.render(ctx, (Number.parseInt(page, 10) || 0) - 1);
	};

	public next: Component = (ctx, page) => {
		return this.render(ctx, (Number.parseInt(page, 10) || 0) + 1);
	};

	private async render({ guild }: Context, requestedPage: number) {
		const economy = await this.economy.getSettings(guild.id);
		const items = await this.economy.fetchActiveItems(guild.id);

		const pages = Math.max(Math.ceil(items.length / PAGE_SIZE), 1);
		const page = Math.min(Math.max(requestedPage, 0), pages - 1);

		const fields = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((item) => {
			const stock = item.stock === UNLIMITED ? "" : ` • ${item.stock} left`;
			const price = item.price > 0 ? this.economy.formatCurrency(economy, item.price) : "Free";

			return {
				name: `${item.icon ?? TYPE_ICONS[item.type]} ${item.name} — ${price}${stock}`,
				value: `> ${item.about ?? "No description"}${economy.debugMode ? `\n\`ID: ${item._id}\`` : ""}`,
			};
		});

		return {
			embeds: [
				{
					author: { name: `${guild.name} Shop`, icon_url: getGuildIcon(guild) },
					description: items.length
						? "Use `/buy` to purchase an item."
						: "This server doesn't have any items for sale yet.",
					fields,
					footer: { text: `Page ${page + 1}/${pages}` },
				},
			],
			components:
				pages > 1
					? [
							actionRow({
								command: "shop",
								context: String(page),
								components: [
									button({ method: this.previous, label: "Previous", disabled: page === 0 }),
									button({ method: this.next, label: "Next", disabled: page === pages - 1 }),
								],
							}),
						]
					: [],
		};
	}
}
