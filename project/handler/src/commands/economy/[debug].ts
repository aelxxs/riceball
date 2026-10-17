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

import { codeBlock } from "@discordjs/formatters";
import { Database, type Item, ItemType } from "@riceball/db";
import { stripIndents } from "common-tags";
import type { Command, Context } from "library/core";
import { Economy, UNLIMITED } from "library/plugins";
import { formatBoolean } from "library/utilities/formatters";
import { inject, injectable } from "tsyringe";

const MAX_LISTED = 15;

@injectable()
export default class implements Command {
	public constructor(
		@inject(Database) private db: Database,
		@inject(Economy) private economy: Economy,
	) {}

	/**
	 * Display advanced information about your server's shop
	 *
	 * @param {Context} context - The context of the command
	 **/
	public async chatInputRun({ guild }: Context) {
		const { economy } = await this.db.getGuildSettings(guild.id);
		const items = await this.economy.fetchItems(guild.id);

		const active = items.filter((item) => item.active);
		const archived = items.filter((item) => !item.active);
		const soldOut = items.filter((item) => item.stock === 0);
		const orphaned = items.filter((item) => this.isOrphaned(item, guild.roles));

		const rows = items
			.slice(0, MAX_LISTED)
			.map(
				(item) =>
					`${item._id} ${item.active ? "A" : "R"} ${item.type.padEnd(6)} ${String(item.price).padStart(7)} ${(item.stock === UNLIMITED ? "∞" : String(item.stock)).padStart(5)}  ${item.name.slice(0, 24)}`,
			);

		if (items.length > MAX_LISTED) {
			rows.push(`… and ${items.length - MAX_LISTED} more`);
		}

		return {
			title: "Economy Debug",
			fields: [
				{ name: "Enabled", value: formatBoolean(economy.enabled), inline: true },
				{ name: "Debug Mode", value: formatBoolean(economy.debugMode), inline: true },
				{ name: "Auto Use Items", value: formatBoolean(economy.autoUseItems), inline: true },
				{ name: "Inventory Size", value: economy.inventorySize.toString(), inline: true },
				{ name: "Default Balance", value: economy.defaultBalance.toString(), inline: true },
				{ name: "Currency", value: this.economy.formatCurrency(economy, 1000), inline: true },
				{
					name: "Items",
					value: stripIndents`
						Total: **${items.length}** • Active: **${active.length}** • Archived: **${archived.length}**
						Sold out: **${soldOut.length}** • Missing roles: **${orphaned.length}**
					`,
				},
				...(orphaned.length
					? [
							{
								name: "Items With Missing Roles",
								value: orphaned.map((item) => `\`${item.name}\``).join(", "),
							},
						]
					: []),
				{
					name: "Item Table",
					value: rows.length
						? codeBlock(
								`${"ID".padEnd(24)} S ${"TYPE".padEnd(6)} ${"PRICE".padStart(7)} ${"STOCK".padStart(5)}  NAME\n${rows.join("\n")}`,
							)
						: "No items.",
				},
			],
		};
	}

	private isOrphaned(item: Item, roles: { id: string }[]) {
		if (item.type !== ItemType.ROLES) return false;

		const itemRoles = item.data?.roles ?? [];
		return !itemRoles.length || itemRoles.some((role) => !roles.some(({ id }) => id === role));
	}
}
