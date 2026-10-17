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

import { Database } from "@riceball/db";
import {
	type APIApplicationCommandInteractionDataBasicOption,
	type APIEmbed,
	type APIUser,
	ButtonStyle,
	InteractionType,
	type Snowflake,
} from "discord-api-types/v10";
import { actionRow, button } from "library/components";
import { type Command, type Component, type Context, reply } from "library/core";
import { extractOptions } from "library/core/interactions/runners/utils";
import { Economy } from "library/plugins";
import { inject, injectable } from "tsyringe";

const TRADE_TIMEOUT = 5 * 60 * 1000;

interface PendingTrade {
	fromId: Snowflake;
	toId: Snowflake;
	itemId: string;
	itemName: string;
	requestItemId?: string;
	requestItemName?: string;
	price?: number;
	priceLabel?: string;
}

@injectable()
export default class implements Command {
	private readonly trades = new Map<string, PendingTrade>();

	public constructor(
		@inject(Economy) private economy: Economy,
		@inject(Database) private db: Database,
	) {}

	/**
	 * Autocomplete for the command
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public autocompleteRun({ i, guild, author }: Context, options: Partial<Record<keyof Options, string>>) {
		const focused = this.getFocusedOption(i);

		if (focused === "request") {
			return options.user ? this.economy.searchInventory(guild.id, options.user, options.request ?? "") : [];
		}

		return this.economy.searchInventory(guild.id, author.id, options.item ?? "");
	}

	/**
	 * Trade items with other users
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ i, guild, author }: Context, { user, item, request, price }: Options) {
		if (user.id === author.id) {
			throw "You can't trade with yourself.";
		}

		if (user.bot) {
			throw "You can't trade with bots.";
		}

		const economy = await this.economy.getSettings(guild.id);

		const offered = await this.findInventoryEntry(guild.id, author.id, item);
		if (!offered) {
			throw "You don't have that item in your inventory.";
		}

		const requested = request ? await this.findInventoryEntry(guild.id, user.id, request) : undefined;
		if (request && !requested) {
			throw `${user.username} doesn't have that item in their inventory.`;
		}

		const trade: PendingTrade = {
			fromId: author.id,
			toId: user.id,
			itemId: offered.itemId,
			itemName: offered.name,
			requestItemId: requested?.itemId,
			requestItemName: requested?.name,
			price,
			priceLabel: price ? this.economy.formatCurrency(economy, price) : undefined,
		};

		this.trades.set(i.id, trade);
		setTimeout(() => this.trades.delete(i.id), TRADE_TIMEOUT);

		const wants = this.describeReturn(trade);

		return {
			content: `<@${user.id}>`,
			allowed_mentions: { users: [user.id] },
			embeds: [
				this.tradeEmbed(
					trade,
					`<@${author.id}> wants to trade \`${offered.name}\` with <@${user.id}> for ${wants.length ? wants.join(" and ") : "nothing in return"}.`,
					"Expires in 5 minutes",
				),
			],
			components: [
				actionRow({
					command: "trade",
					context: i.id,
					components: [
						button({ method: this.accept, label: "Accept", style: ButtonStyle.Success }),
						button({ method: this.decline, label: "Decline", style: ButtonStyle.Danger }),
					],
				}),
			],
		};
	}

	public accept: Component = async (ctx, key) => {
		const trade = this.trades.get(key);

		if (!trade) {
			return this.closed("This trade has expired.");
		}

		if (ctx.author.id !== trade.toId) {
			await reply(ctx.i, "Only the recipient can accept this trade.", { prefix: "error" });
			return;
		}

		this.trades.delete(key);

		try {
			await this.economy.trade(ctx.guild.id, trade.fromId, trade.toId, {
				itemId: trade.itemId,
				requestItemId: trade.requestItemId,
				price: trade.price,
			});
		} catch (error) {
			if (typeof error === "string") {
				return this.closed(`Trade failed: ${error}`, trade);
			}
			throw error;
		}

		return this.closed(`<@${trade.toId}> accepted the trade. Items have been exchanged!`, trade);
	};

	public decline: Component = async (ctx, key) => {
		const trade = this.trades.get(key);

		if (!trade) {
			return this.closed("This trade has expired.");
		}

		if (ctx.author.id !== trade.toId && ctx.author.id !== trade.fromId) {
			await reply(ctx.i, "You're not part of this trade.", { prefix: "error" });
			return;
		}

		this.trades.delete(key);

		const action = ctx.author.id === trade.toId ? "declined" : "cancelled";
		return this.closed(`<@${ctx.author.id}> ${action} the trade.`, trade);
	};

	private closed(description: string, trade?: PendingTrade) {
		return {
			content: "",
			embeds: [trade ? this.tradeEmbed(trade, description) : { title: "🤝 Trade", description }],
			components: [],
		};
	}

	private tradeEmbed(trade: PendingTrade, description: string, footer?: string): APIEmbed {
		const wants = this.describeReturn(trade).join("\n");

		return {
			title: "🤝 Trade",
			description,
			fields: [
				{ name: "Offering", value: `\`${trade.itemName}\``, inline: true },
				{ name: "In Return", value: wants || "Nothing", inline: true },
			],
			...(footer && { footer: { text: footer } }),
		};
	}

	private describeReturn(trade: PendingTrade) {
		return [trade.requestItemName && `\`${trade.requestItemName}\``, trade.priceLabel].filter(
			(value): value is string => Boolean(value),
		);
	}

	private async findInventoryEntry(guildId: Snowflake, userId: Snowflake, idOrName: string) {
		const { inventory } = await this.db.getMemberSettings(guildId, userId);
		const name = idOrName.trim().toLowerCase();

		return inventory.find((entry) => entry.itemId === idOrName || entry.name.toLowerCase() === name);
	}

	private getFocusedOption(i: Context["i"]) {
		if (i.type !== InteractionType.ApplicationCommandAutocomplete) return null;

		const options = extractOptions(i.data.options ?? []) as (APIApplicationCommandInteractionDataBasicOption & {
			focused?: boolean;
		})[];

		return options.find((option) => option.focused)?.name ?? null;
	}
}

interface Options {
	/* The user to trade with */
	user: APIUser;
	/* The item to trade */
	item: string;
	/* An item from their inventory you want in return */
	request?: string;
	/* An amount of currency you want in return */
	price?: number;
}
