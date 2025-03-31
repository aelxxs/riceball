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
import { stripIndents } from "common-tags";
import { type APIEmoji, ComponentType } from "discord-api-types/v10";
import { actionRow, select } from "library/components";
import { type Command, type Component, type Context, edit, update } from "library/core";

export default class implements Command {
	/**
	 * Create a reaction role message
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ guild, i }: Context) {
		// return {
		// 	embeds: [
		// 		{
		// 			title: guild.name,
		// 			description: "Interactive Reaction Role Creation",
		// 		},
		// 	],
		// 	components: [
		// 		actionRow({
		// 			command: "reaction-role/create",
		// 			components: [
		// 				select({
		// 					method: this.selectReactionRole,
		// 					placeholder: "Select a role...",
		// 					type: ComponentType.RoleSelect,
		// 				}),
		// 			],
		// 		}),
		// 	],
		// };
	}

	// public selectReactionRole: Component = async (ctx, [role]: string) => {
	// 	await update(ctx.i, {
	// 		embeds: [
	// 			{
	// 				title: "Create a reaction role",
	// 				description: stripIndents`
	// 					React to this message with the emoji you want to use for the role.

	// 					${roleMention(role)} – \`Emoji\`
	// 				`,
	// 			},
	// 		],
	// 		components: [],
	// 	});

	// 	try {
	// 		const emoji = await awaitSingleEmojiReaction(ctx);

	// 		console.log({ emoji });

	// 		edit(ctx.i, {
	// 			embeds: [
	// 				{
	// 					title: "Create a reaction role",
	// 					description: stripIndents`
	// 					React to this message with the emoji you want to use for the role.

	// 					${roleMention(role)} – ${emoji.name}
	// 				`,
	// 				},
	// 			],
	// 			components: [
	// 				actionRow({
	// 					command: "reaction-role/create",
	// 					components: [
	// 						select({
	// 							method: this.selectReactionRole,
	// 							placeholder: "Select a role...",
	// 							type: ComponentType.RoleSelect,
	// 						}),
	// 					],
	// 				}),
	// 			],
	// 		});
	// 	} catch (error) {
	// 		edit(ctx.i, {
	// 			description: "Timed out",
	// 		});
	// 	}
	// };
}

// const awaitSingleEmojiReaction = async ({ i }: Context): Promise<APIEmoji> => {
// 	const collector = new ReactionCollector(
// 		i,
// 		(reaction) => {
// 			return reaction.member?.user?.id === i.member?.user.id;
// 		},
// 		{
// 			timeout: 10000,
// 			max: 1,
// 		},
// 	);

// 	return new Promise((resolve, reject) => {
// 		collector.on("collect", async (reaction) => {
// 			resolve(reaction.emoji);
// 		});

// 		collector.on("end", () => {
// 			reject("No reaction collected");
// 		});
// 	});
// };
