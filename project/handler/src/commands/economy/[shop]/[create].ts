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
import { stripIndents } from "common-tags";
import type { APIEmbed } from "discord-api-types/v10";
import { actionRow, select } from "library/components";
import type { Command, Component, Context } from "library/core";
import { editMessage } from "library/core";
import { cancelable, PromptResponse } from "library/utilities/prompt";
import {
	promptCustom,
	promptNumber,
	promptNumberOrUnlimited,
	promptOptional,
	runPrompts,
} from "library/utilities/prompt-generator";
import { inject, injectable } from "tsyringe";

/**
 * The shop create command
 *
 * Userflow:
 * 		1. User selects the type of item they want to create (role or badge)
 * 		2. Bot prompts for each field with validation:
 *       - Item name (text)
 *       - Price (numeric validation with retry)
 *       - Stock (numeric or "unlimited", with retry)
 *       - Description (optional text)
 * 		3. User selects/provides the role or badge
 * 		4. Item is created and added to the shop
 */
@injectable()
export default class implements Command {
	public db: Database;

	public constructor(@inject(Database) db: Database) {
		this.db = db;
	}

	/**
	 * Create a shop item
	 **/
	public chatInputRun() {
		return {
			embeds: [
				{
					title: "🛒 Item Creation",
					description: stripIndents`
						Create a new item for your server shop!

						Select the type of item you want to create below.
					`,
					footer: {
						text: "Step 1 of 3: Select Item Type",
					},
				},
			],
			components: [
				actionRow({
					command: "economy/shop/create",
					components: [
						select({
							method: this.selectItemType,
							placeholder: "Choose item type...",
							options: [
								{
									label: "Role",
									value: ItemType.ROLES,
									description: "Give users a role when they purchase this item",
									emoji: { name: "🔖" },
								},
								{
									label: "Badge",
									value: ItemType.BADGE,
									description: "Award users a badge when they purchase this item",
									emoji: { name: "🧧" },
								},
							],
						}),
					],
				}),
			],
		};
	}

	/**
	 * Handle item type selection and start prompt flow
	 */
	public selectItemType: Component = async (ctx: Context, [itemType]) => {
		await this.startPromptFlow(ctx, itemType as ItemType);
	};

	private async startPromptFlow(ctx: Context, itemType: ItemType) {
		const { i, guild } = ctx;

		// Create the base embed that we'll update throughout
		const embed: APIEmbed = {
			title: "🛒 Item Creation",
			description: `Creating ${itemType === ItemType.ROLES ? "🔖 Role" : "🧧 Badge"} Item`,
			fields: [],
			footer: {
				text: "Answer the questions below • Type 'cancel' to abort",
			},
			color: 0x9042682,
		};

		const result = await runPrompts(ctx, () => this.promptSteps(itemType, embed, guild.id), embed);

		if (!result) return;

		// Final summary
		embed.color = 0x00ff00;
		if (i.channel?.id && i.message?.id) {
			await editMessage(i.channel.id, i.message.id, {
				content: "✅ | Item creation complete.",
				embeds: [embed],
				components: [],
			});
		}

		// TODO: Save to database and assign role/badge
	}

	private async *promptSteps(itemType: ItemType, embed: APIEmbed, guildId: string) {
		// Step 1: Item Name
		const name: string = yield promptCustom<string>({
			content: "💬 | What would you like to **name** this item?",
			validator: cancelable((input: string) => {
				if (input.length < 1 || input.length > 100) {
					return PromptResponse.error("Name must be between 1 and 100 characters");
				}
				return PromptResponse.success(input);
			}),
		});

		if (!embed.fields) embed.fields = [];
		embed.fields.push({
			name: "💬 Name",
			value: name,
			inline: true,
		});

		// Step 2: Price
		const { economy } = await this.db.getGuildSettings(guildId);
		const currency = economy.currencyIcon ?? economy.currencyName;

		const price: number = yield promptNumber({
			content: `💴 | **How much** ${currency} will \`${name}\` **cost** users to buy?`,
		});

		if (!embed.fields) embed.fields = [];
		embed.fields.push({
			name: "💴 Price",
			value: price.toString(),
			inline: true,
		});

		// Step 3: Stock
		const stock: number = yield promptNumberOrUnlimited({
			content: `📊 | **How much** \`${name}\` will be **available for sale**? Use \`unlimited\` or \`infinite\` for unlimited supply.`,
		});

		const stockDisplay = stock === -1 ? "Unlimited" : stock.toString();
		if (!embed.fields) embed.fields = [];
		embed.fields.push({
			name: "📊 Stock",
			value: stockDisplay,
			inline: true,
		});

		// Step 4: Description (optional)
		const description: string | undefined = yield promptOptional({
			content: `📄 | Provide a **short description** (150 chars. max) that **describes** what \`${name}\` is/does. Use \`skip\` to skip this step.`,
			validator: (input: string) => {
				if (input.length > 150) {
					return PromptResponse.error("Description must be 150 characters or less");
				}
				return PromptResponse.success(input);
			},
		});

		if (!embed.fields) embed.fields = [];
		embed.fields.push({
			name: "📄 Description",
			value: description || "No description",
			inline: false,
		});

		return { name, price, stock, description, type: itemType };
	}
}
