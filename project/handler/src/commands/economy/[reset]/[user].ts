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
import { type APIUser, ButtonStyle, type Snowflake } from "discord-api-types/v10";
import { actionRow, button } from "library/components";
import { type Command, type Component, type Context, reply } from "library/core";
import { Economy } from "library/plugins";
import { inject, injectable } from "tsyringe";

const CONFIRM_TIMEOUT = 60 * 1000;
const TITLE = "Reset Member Economy";

interface PendingReset {
	authorId: Snowflake;
	userId: Snowflake;
}

@injectable()
export default class implements Command {
	private readonly pending = new Map<string, PendingReset>();

	public constructor(
		@inject(Database) private db: Database,
		@inject(Economy) private economy: Economy,
	) {}

	/**
	 * Reset a user's balance, inventory and badges
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ i, guild, author }: Context, { user }: Options) {
		if (user.bot) {
			throw "Bots don't have economy data.";
		}

		// Members who left can still be reset, so only check that there is data to clear
		const exists = await this.db.rm.members.count({ guildId: guild.id, userId: user.id });

		if (!exists) {
			throw `${user.username} has no economy data in this server.`;
		}

		const { economy } = await this.db.getGuildSettings(guild.id);

		this.pending.set(i.id, { authorId: author.id, userId: user.id });
		setTimeout(() => this.pending.delete(i.id), CONFIRM_TIMEOUT);

		return {
			embeds: [
				{
					title: TITLE,
					description: `This will set <@${user.id}>'s balance to ${this.economy.formatCurrency(economy, economy.defaultBalance)} and clear their inventory and badges. This cannot be undone.`,
					footer: { text: "Expires in 1 minute" },
				},
			],
			components: [
				actionRow({
					command: "economy/reset/user",
					context: i.id,
					components: [
						button({ method: this.confirm, label: "Reset", style: ButtonStyle.Danger }),
						button({ method: this.cancel, label: "Cancel", style: ButtonStyle.Secondary }),
					],
				}),
			],
		};
	}

	public confirm: Component = async (ctx, key) => {
		const reset = this.pending.get(key);

		if (!reset) {
			return this.closed("This confirmation has expired. Run the command again to reset this member.");
		}

		if (ctx.author.id !== reset.authorId) {
			await reply(ctx.i, "Only the member who ran this command can confirm it.", { prefix: "error" });
			return;
		}

		this.pending.delete(key);

		await this.economy.resetMember(ctx.guild.id, reset.userId);

		return this.closed(`<@${ctx.author.id}> reset <@${reset.userId}>'s economy data.`);
	};

	public cancel: Component = async (ctx, key) => {
		const reset = this.pending.get(key);

		if (reset && ctx.author.id !== reset.authorId) {
			await reply(ctx.i, "Only the member who ran this command can cancel it.", { prefix: "error" });
			return;
		}

		this.pending.delete(key);

		return this.closed("The reset was cancelled.");
	};

	private closed(description: string) {
		return { embeds: [{ title: TITLE, description }], components: [] };
	}
}

interface Options {
	/* The user to reset */
	user: APIUser;
}
