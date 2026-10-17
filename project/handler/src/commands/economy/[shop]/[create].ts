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

import { roleMention } from "@discordjs/formatters";
import type { REST } from "@discordjs/rest";
import { Database, ItemType } from "@riceball/db";
import { stripIndents } from "common-tags";
import { type APIEmbed, ComponentType, InteractionResponseType, Routes } from "discord-api-types/v10";
import { Deps } from "library/common";
import { actionRow, select } from "library/components";
import type { Command, Component, Context } from "library/core";
import { editMessage, reply } from "library/core";
import { Economy, UNLIMITED } from "library/plugins";
import { cancelable, PromptResponse } from "library/utilities/prompt";
import {
	promptCustom,
	promptNumber,
	promptNumberOrUnlimited,
	promptOptional,
	runPrompts,
} from "library/utilities/prompt-generator";
import { container, inject, injectable } from "tsyringe";

const MAX_ROLES = 5;
const CUSTOM_EMOJI = /^<(a)?:\w+:(\d+)>$/;
const URL = /^https?:\/\/\S+$/i;

interface ItemDraft {
	name: string;
	price: number;
	stock: number;
	description?: string;
	badge?: string;
	type: ItemType;
}

interface PendingItem {
	draft: ItemDraft;
	embed: APIEmbed;
}

/**
 * The shop create command
 *
 * Userflow:
 * 		1. User selects the type of item they want to create (role or badge)
 * 		2. Bot prompts for each field with validation:
 *       - Item name (text, unique per server)
 *       - Price (numeric validation with retry)
 *       - Stock (numeric or "unlimited", with retry)
 *       - Description (optional text)
 *       - Badge image (badge items only)
 * 		3. Role items: user selects the role(s) to grant
 * 		4. Item is created and added to the shop
 */
@injectable()
export default class implements Command {
	private readonly pending = new Map<string, PendingItem>();

	public constructor(
		@inject(Database) private db: Database,
		@inject(Economy) private economy: Economy,
	) {}

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
	public selectItemType: Component = async (ctx: Context, itemType) => {
		const rest = container.resolve<REST>(Deps.Rest);

		// Acknowledge the select so Discord doesn't mark it as failed while we wait for text replies.
		await rest.post(Routes.interactionCallback(ctx.i.id, ctx.i.token), {
			body: { type: InteractionResponseType.DeferredMessageUpdate },
		});

		await this.startPromptFlow(ctx, itemType as ItemType);
	};

	/**
	 * Handle role selection for role items and save the item
	 */
	public selectRoles: Component = async (ctx: Context, ...roleIds) => {
		const key = this.pendingKey(ctx);
		const pending = this.pending.get(key);

		if (!pending) {
			await reply(ctx.i, "This item creation session has expired. Please run the command again.", {
				prefix: "error",
			});
			return;
		}

		const resolved = ctx.i.data && "resolved" in ctx.i.data ? ctx.i.data.resolved : undefined;
		const roles = resolved && "roles" in resolved ? resolved.roles : undefined;
		const invalid = roleIds.filter((id) => id === ctx.guild.id || roles?.[id]?.managed);

		if (invalid.length) {
			await reply(ctx.i, "`@everyone` and roles managed by integrations can't be given out by the shop.", {
				prefix: "error",
			});
			return;
		}

		this.pending.delete(key);

		pending.embed.fields?.push({
			name: "🔖 Roles",
			value: roleIds.map((id) => roleMention(id)).join(" "),
			inline: false,
		});

		return this.save(ctx, pending, { roles: roleIds });
	};

	private async startPromptFlow(ctx: Context, itemType: ItemType) {
		const { i, guild } = ctx;

		const embed: APIEmbed = {
			title: "🛒 Item Creation",
			description: `Creating ${itemType === ItemType.ROLES ? "🔖 Role" : "🧧 Badge"} Item`,
			fields: [],
			footer: {
				text: "Answer the questions below • Type 'cancel' to abort",
			},
			color: 0x9042682,
		};

		const draft = await runPrompts(ctx, () => this.promptSteps(itemType, embed, guild.id), embed);

		if (!draft || !i.channel?.id || !i.message?.id) return;

		const pending: PendingItem = { draft, embed };

		if (itemType === ItemType.BADGE) {
			await editMessage(i.channel.id, i.message.id, await this.save(ctx, pending, { badge: draft.badge }));
			return;
		}

		this.pending.set(this.pendingKey(ctx), pending);

		embed.footer = { text: "Step 3 of 3: Select the role(s) to grant" };

		await editMessage(i.channel.id, i.message.id, {
			content: `🔖 | Select up to ${MAX_ROLES} role(s) that \`${draft.name}\` will grant.`,
			embeds: [embed],
			components: [
				actionRow({
					command: "economy/shop/create",
					components: [
						select({
							type: ComponentType.RoleSelect,
							method: this.selectRoles,
							placeholder: "Select role(s)...",
							min_values: 1,
							max_values: MAX_ROLES,
						}),
					],
				}),
			],
		});
	}

	private async save(ctx: Context, { draft, embed }: PendingItem, data: { roles?: string[]; badge?: string }) {
		const item = await this.economy.createItem(ctx.guild.id, {
			name: draft.name,
			type: draft.type,
			price: draft.price,
			stock: draft.stock,
			about: draft.description,
			data,
		});

		embed.color = 0x57f287;
		embed.footer = { text: `Item ID: ${item._id}` };

		return {
			content: `✅ | \`${item.name}\` has been added to the shop.`,
			embeds: [embed],
			components: [],
		};
	}

	private pendingKey({ guild, author }: Context) {
		return `${guild.id}:${author.id}`;
	}

	private async *promptSteps(itemType: ItemType, embed: APIEmbed, guildId: string) {
		const existing = new Set((await this.economy.fetchItems(guildId)).map((item) => item.name.toLowerCase()));

		if (!embed.fields) embed.fields = [];

		const name: string = yield promptCustom<string>({
			content: "💬 | What would you like to **name** this item?",
			validator: cancelable((input: string) => {
				const value = input.trim();

				if (value.length < 1 || value.length > 100) {
					return PromptResponse.error("Name must be between 1 and 100 characters");
				}

				if (existing.has(value.toLowerCase())) {
					return PromptResponse.error(`An item named \`${value}\` already exists`);
				}

				return PromptResponse.success(value);
			}),
		});

		embed.fields.push({
			name: "💬 Name",
			value: name,
			inline: true,
		});

		const { economy } = await this.db.getGuildSettings(guildId);

		const price: number = yield promptNumber({
			content: `💴 | **How much** ${economy.currencyIcon} will \`${name}\` **cost** users to buy?`,
		});

		embed.fields.push({
			name: "💴 Price",
			value: this.economy.formatCurrency(economy, price),
			inline: true,
		});

		const stock: number = yield promptNumberOrUnlimited({
			content: `📊 | **How much** \`${name}\` will be **available for sale**? Use \`unlimited\` or \`infinite\` for unlimited supply.`,
		});

		embed.fields.push({
			name: "📊 Stock",
			value: stock === UNLIMITED ? "Unlimited" : stock.toString(),
			inline: true,
		});

		const description: string | undefined = yield promptOptional({
			content: `📄 | Provide a **short description** (150 chars. max) that **describes** what \`${name}\` is/does. Use \`skip\` to skip this step.`,
			validator: cancelable((input: string) => {
				if (input.length > 150) {
					return PromptResponse.error("Description must be 150 characters or less");
				}
				return PromptResponse.success(input);
			}),
		});

		embed.fields.push({
			name: "📄 Description",
			value: description || "No description",
			inline: false,
		});

		let badge: string | undefined;

		if (itemType === ItemType.BADGE) {
			badge = yield promptCustom<string>({
				content: "🧧 | Send the **badge image**: an image URL or a custom emoji.",
				validator: cancelable((input: string) => {
					const value = input.trim();
					const emoji = value.match(CUSTOM_EMOJI);

					if (emoji) {
						return PromptResponse.success(
							`https://cdn.discordapp.com/emojis/${emoji[2]}.${emoji[1] ? "gif" : "png"}`,
						);
					}

					if (URL.test(value)) {
						return PromptResponse.success(value);
					}

					return PromptResponse.error("Please send an image URL or a custom emoji");
				}),
			});

			embed.fields.push({
				name: "🧧 Badge",
				value: `[View image](${badge})`,
				inline: false,
			});
			embed.thumbnail = { url: badge as string };
		}

		const draft: ItemDraft = { name, price, stock, description, badge, type: itemType };
		return draft;
	}
}
