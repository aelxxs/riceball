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
import { Database, DiscordEmbed, ReactionRoleType } from "@riceball/db";
import { stripIndents } from "common-tags";
import type { APIEmbed, APIEmoji, Snowflake } from "discord-api-types/v10";
import { ComponentType, Routes } from "discord-api-types/v10";
import { Constants, Deps } from "library/common";
import { actionRow, button, select } from "library/components";
import type { Command, Component, Context } from "library/core";
import { editMessage, send, update } from "library/core";
import { ReactionCollector } from "library/core/collectors/ReactionCollector";
import { cancelable, PromptResponse } from "library/utilities/prompt";
import { promptCustom, runPrompts } from "library/utilities/prompt-generator";
import { inject, injectable } from "tsyringe";

interface EmojiRolePair {
	emoji: string;
	role: Snowflake;
}

interface ReactionRoleState {
	channel?: Snowflake;
	title?: string;
	description?: string;
	color?: number;
	alias?: string;
	type?: ReactionRoleType;
	pairs: EmojiRolePair[];
	lastEmoji?: string;
}

@injectable()
export default class implements Command {
	private db: Database;
	private rest: REST;
	private states = new Map<string, ReactionRoleState>();

	public constructor(@inject(Database) db: Database, @inject(Deps.Rest) rest: REST) {
		this.db = db;
		this.rest = rest;
	}

	/**
	 * Create a reaction role message with interactive setup
	 * Step 1: Select channel
	 */
	public chatInputRun() {
		return {
			embeds: [
				{
					title: "🎭 Reaction Role Setup",
					description: "Select the channel where you want to create the reaction role menu.",
					footer: {
						text: "Step 1: Select Channel",
					},
					color: 0x5865f2,
				},
			],
			components: [
				actionRow({
					command: "reaction-role/create",
					components: [
						select({
							method: this.selectChannel,
							placeholder: "Choose a channel...",
							type: ComponentType.ChannelSelect,
						}),
					],
				}),
			],
		};
	}

	/**
	 * Step 2: After channel selected, prompt for title/description with text prompts
	 */
	public selectChannel: Component = async (ctx: Context, channelId: string) => {
		const { i } = ctx;
		const stateKey = `${i.guild_id}:${i.user?.id ?? i.member!.user.id}`;

		this.states.set(stateKey, {
			channel: channelId,
			pairs: [],
		});

		const embed: APIEmbed = {
			title: "🎭 Reaction Role Setup",
			description: "Now let's configure the message details.",
			fields: [
				{
					name: "📍 Channel",
					value: `<#${channelId}>`,
					inline: true,
				},
			],
			footer: {
				text: "Type 'cancel' to abort at any time",
			},
			color: 0x5865f2,
		};

		await update(ctx.i, { embeds: [embed], components: [] });

		const result = await runPrompts(ctx, () => this.promptMessageDetails(embed, stateKey), embed);

		if (!result) {
			this.states.delete(stateKey);
			return;
		}

		// Now prompt for type with select menu
		const state = this.states.get(stateKey)!;
		const typeEmbed: APIEmbed = {
			title: "🎭 Reaction Role Setup",
			description: "Choose the type of reaction role menu:",
			fields: [
				{
					name: "🔄 Toggle",
					value: "Users can add/remove the role by reacting",
					inline: false,
				},
				{
					name: "➕ Add",
					value: "Users can only add the role (never removed)",
					inline: false,
				},
				{
					name: "➖ Remove",
					value: "Users can only remove the role (never added)",
					inline: false,
				},
				{
					name: "⭐ Unique",
					value: "Users can only have one role from this menu at a time",
					inline: false,
				},
			],
			footer: {
				text: "Step 3: Select Type",
			},
			color: state.color,
		};

		await editMessage(ctx.i.channel!.id!, ctx.i.message!.id, {
			embeds: [typeEmbed],
			components: [
				actionRow({
					command: "reaction-role/create",
					components: [
						select({
							method: this.selectType,
							placeholder: "Choose reaction role type...",
							options: [
								{
									label: "Toggle",
									value: ReactionRoleType.TOGGLE,
									description: "Add/remove role on reaction",
									emoji: { name: "🔄" },
								},
								{
									label: "Add",
									value: ReactionRoleType.ADD,
									description: "Only add role, never remove",
									emoji: { name: "➕" },
								},
								{
									label: "Remove",
									value: ReactionRoleType.REMOVE,
									description: "Only remove role, never add",
									emoji: { name: "➖" },
								},
								{
									label: "Unique",
									value: ReactionRoleType.UNIQUE,
									description: "Only one role from menu at a time",
									emoji: { name: "⭐" },
								},
							],
						}),
					],
				}),
			],
		});
	};

	private async *promptMessageDetails(embed: APIEmbed, stateKey: string): AsyncGenerator<any, boolean, any> {
		// Prompt for title and description
		const messageContent = yield promptCustom<{ title: string; description: string }>({
			content: stripIndents`
				📝 | What would you like the reaction menu to say?

				Use the format: \`title | description\`

				**Tip:** Use \`{roles}\` in the description to display a formatted list of all reaction pairs.
			`,
			validator: cancelable((input: string) => {
				const parts = input.split("|").map((s) => s.trim());
				if (parts.length < 2) {
					return PromptResponse.error("Please use the format: `title | description`");
				}

				const [title, ...descParts] = parts;
				const description = descParts.join("|").trim();

				if (!title || !description) {
					return PromptResponse.error("Both title and description are required");
				}

				return PromptResponse.success({ title, description });
			}),
		});

		const state = this.states.get(stateKey)!;
		state.title = messageContent.title;
		state.description = messageContent.description;

		embed.fields!.push({
			name: "📝 Message",
			value: `**${messageContent.title}**\n${messageContent.description}`,
			inline: false,
		});

		// Prompt for color
		const color: number = yield promptCustom<number>({
			content:
				"🎨 | What color would you like the embed to have? Provide a hex code (e.g., `#5865F2`) or `random`.",
			validator: cancelable((input: string) => {
				if (input.toLowerCase() === "random") {
					return PromptResponse.success(Math.floor(Math.random() * 16777215));
				}

				const match = input.match(/^#?([0-9a-f]{6})$/i);
				if (!match) {
					return PromptResponse.error(
						"Please provide a valid 6-digit hex code (e.g., `#5865F2`) or `random`",
					);
				}

				return PromptResponse.success(Number.parseInt(match[1], 16));
			}),
		});

		state.color = color;
		embed.color = color;

		embed.fields!.push({
			name: "🎨 Color",
			value: `#${color.toString(16).padStart(6, "0")}`,
			inline: true,
		});

		// Prompt for alias
		const suggestedAlias = state.title!.toLowerCase().replace(/\s+/g, "-");
		const alias: string = yield promptCustom<string>({
			content: `🏷️ | What alias would you like to use? This is used to identify the reaction role menu.\n\n**Suggested:** \`${suggestedAlias}\``,
			validator: cancelable((input: string) => {
				const cleaned = input.toLowerCase().replace(/\s+/g, "-");
				if (!cleaned || cleaned.length < 2) {
					return PromptResponse.error("Alias must be at least 2 characters long");
				}
				if (!/^[a-z0-9-]+$/.test(cleaned)) {
					return PromptResponse.error("Alias can only contain lowercase letters, numbers, and hyphens");
				}
				return PromptResponse.success(cleaned);
			}),
		});

		state.alias = alias;

		return true;
	}

	/**
	 * Step 2.5: Select reaction role type
	 */
	public selectType: Component = async (ctx: Context, type: string) => {
		const { i } = ctx;
		const stateKey = `${i.guild_id}:${i.user?.id ?? i.member!.user.id}`;
		const state = this.states.get(stateKey);

		if (!state) {
			await update(ctx.i, {
				content: `${Constants.Emoji.Error} Session expired. Please start over with \`/reaction-role create\``,
				embeds: [],
				components: [],
			});
			return;
		}

		state.type = type as ReactionRoleType;

		await update(ctx.i, {
			content: `${Constants.Emoji.Success} Configuration complete! Now let's add emoji-role pairs.`,
			embeds: [],
			components: [],
		});

		await this.startPairCollection(ctx, stateKey);
	};

	/**
	 * Step 3: Collect emoji-role pairs using reactions + role select
	 */
	private buildPairCollectionView(state: ReactionRoleState, stateKey: string) {
		const mergedPairs = this.mergePairs(state.pairs);
		const pairsList =
			mergedPairs.length > 0
				? mergedPairs
						.map(({ emoji, roles }) => `${emoji} → ${roles.map((r) => roleMention(r)).join(", ")}`)
						.join("\n")
				: "*No pairs added yet*";

		const embed: APIEmbed = {
			title: "🎭 Reaction Role Setup",
			description: "React to this message with an emoji, then select the role(s) for that emoji.",
			fields: [
				{
					name: "📍 Channel",
					value: `<#${state.channel}>`,
					inline: true,
				},
				{
					name: "🎨 Color",
					value: `#${state.color!.toString(16).padStart(6, "0")}`,
					inline: true,
				},
				{
					name: "👥 Pairs",
					value: pairsList,
					inline: false,
				},
			],
			footer: {
				text: `Pairs added: ${state.pairs.length} • React to add more`,
			},
			color: state.color,
		};

		// Show "Done" button when at least one pair exists
		const components =
			state.pairs.length > 0
				? [
						actionRow({
							command: "reaction-role/create",
							components: [
								button({
									method: this.finishSetup,
									label: "Finish Setup",
									style: 3, // Success/Green
									custom_id: stateKey,
								}),
							],
						}),
					]
				: [];

		return { embed, components };
	}

	private async startPairCollection(ctx: Context, stateKey: string) {
		const { i } = ctx;
		const state = this.states.get(stateKey)!;

		const { embed, components } = this.buildPairCollectionView(state, stateKey);

		await editMessage(i.channel!.id, i.message!.id, {
			content: "React to this message with an emoji to add a new pair.",
			embeds: [embed],
			components,
		});

		this.continuePairCollection(ctx, stateKey);
	}

	private async continuePairCollection(ctx: Context, stateKey: string) {
		const { i } = ctx;
		const state = this.states.get(stateKey)!;

		// Wait for user to react with an emoji
		try {
			const reaction = await this.awaitSingleEmojiReaction(ctx);
			const emoji = reaction.emoji;
			const emojiStr = emoji.id ? `<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>` : emoji.name!;
			state.lastEmoji = emojiStr;

			// Show role select
			await editMessage(i.channel!.id, i.message!.id, {
				embeds: [
					{
						title: "🎭 Reaction Role Setup",
						description: `Selected emoji: ${emojiStr}\n\nNow select the role(s) for this emoji.`,
						color: state.color,
					},
				],
				components: [
					actionRow({
						command: "reaction-role/create",
						components: [
							select({
								method: this.selectRoles,
								placeholder: "Select a role...",
								type: ComponentType.RoleSelect,
							}),
						],
					}),
					...(state.pairs.length > 0
						? [
								actionRow({
									command: "reaction-role/create",
									components: [
										button({
											method: this.finishSetup,
											label: "Finish Setup",
											style: 3,
											custom_id: stateKey,
										}),
									],
								}),
							]
						: []),
				],
			});
		} catch (error) {
			// Timeout - just end the collection, user can use the finish button if they added pairs
			return;
		}
	}

	/**
	 * Handle role selection - add pair and return to collection
	 */
	public selectRoles: Component = async (ctx: Context, roleIds: string | string[]) => {
		const { i } = ctx;
		const stateKey = `${i.guild_id}:${i.user?.id ?? i.member!.user.id}`;
		const state = this.states.get(stateKey);

		console.log({ state, stateKey, roleIds });
		if (!state || !state.lastEmoji) return;

		// Normalize to array
		const roles = Array.isArray(roleIds) ? roleIds : [roleIds];

		// Add each role as a separate pair (will be merged later)
		for (const roleId of roles) {
			state.pairs.push({
				emoji: state.lastEmoji,
				role: roleId,
			});
		}

		delete state.lastEmoji;
		console.log("calling again");

		// Return to pair collection view - use update() to respond to the interaction
		const { embed, components } = this.buildPairCollectionView(state, stateKey);
		await update(ctx.i, {
			content: "React to this message with an emoji to add a new pair.",
			embeds: [embed],
			components,
		});

		// Continue waiting for reactions
		this.continuePairCollection(ctx, stateKey);
	};

	/**
	 * Wait for a single emoji reaction from the user
	 */
	private async awaitSingleEmojiReaction(ctx: Context) {
		const { i } = ctx;
		const userId = i.user?.id ?? i.member!.user.id;

		const collector = new ReactionCollector(
			i,
			(reaction) => {
				return reaction.user_id === userId;
			},
			{
				timeout: 300000, // 5 minutes
				max: 1,
			},
		);

		return new Promise<any>((resolve, reject) => {
			collector.on("collect", (reactionEvent: any) => {
				resolve(reactionEvent);
			});

			collector.on("end", (collected, reason) => {
				if (reason === "limit") return; // Already resolved
				reject(new Error("No reaction collected"));
			});
		});
	}

	/**
	 * Finish setup and create the reaction role message
	 */
	public finishSetup: Component = async (ctx: Context) => {
		const { i } = ctx;
		const stateKey = `${i.guild_id}:${i.user?.id ?? i.member!.user.id}`;
		const state = this.states.get(stateKey);

		if (!state || state.pairs.length === 0) {
			await update(ctx.i, {
				content: `${Constants.Emoji.Error} No pairs were added. Setup cancelled.`,
				embeds: [],
				components: [],
			});
			this.states.delete(stateKey);
			return;
		}

		await this.createReactionRoleMessage(ctx, state);
		this.states.delete(stateKey);
	};

	private async createReactionRoleMessage(ctx: Context, state: ReactionRoleState) {
		const { i, guild } = ctx;

		// Merge duplicate emojis
		const mergedPairs = this.mergePairs(state.pairs);

		// Format pairs for display
		const formattedPairs = mergedPairs
			.map(({ emoji, roles }) => `${emoji} – ${roles.map((r) => roleMention(r)).join(", ")}`)
			.join("\n");

		// Replace {roles} placeholder in description
		const description = state.description!.replace("{roles}", formattedPairs);

		// Create the message
		const messageEmbed: APIEmbed = {
			title: state.title,
			description,
			color: state.color,
		};

		const message = await send(state.channel!, { embeds: [messageEmbed] });

		if (!message) {
			await update(ctx.i, {
				content: `${Constants.Emoji.Error} Failed to create reaction role message`,
				embeds: [],
				components: [],
			});
			return;
		}

		// Apply reactions to the message via REST API
		await Promise.all(
			mergedPairs.map((pair) =>
				this.rest.put(
					Routes.channelMessageOwnReaction(state.channel!, message.id, encodeURIComponent(pair.emoji)),
					{ body: undefined },
				),
			),
		);

		// Save to database
		const embedEntity = new DiscordEmbed();
		embedEntity.title = state.title!;
		embedEntity.description = description;
		embedEntity.color = state.color!;

		const reactionRole = this.db.rm.reactionRoles.create({
			guildId: guild.id,
			channelId: state.channel!,
			messageId: message.id,
			messageContent: "",
			messageEmbed: embedEntity,
			alias: state.alias!,
			type: state.type!,
			enabled: true,
			pairs: mergedPairs,
		});
		await this.db.em.persistAndFlush(reactionRole);

		// Success message
		await update(ctx.i, {
			content: `${Constants.Emoji.Success} Reaction role menu created in <#${state.channel!}>!`,
			embeds: [],
			components: [],
		});
	}

	/**
	 * Merge pairs with the same emoji
	 */
	private mergePairs(pairs: EmojiRolePair[]): Array<{ emoji: string; roles: string[] }> {
		return pairs.reduce(
			(merged, { emoji, role }) => {
				const existing = merged.find((p) => p.emoji === emoji);

				if (existing) {
					existing.roles.push(role);
				} else {
					merged.push({ emoji, roles: [role] });
				}

				return merged;
			},
			[] as Array<{ emoji: string; roles: string[] }>,
		);
	}
}
