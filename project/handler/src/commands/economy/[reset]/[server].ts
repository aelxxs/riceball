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
import { ButtonStyle, type Snowflake } from "discord-api-types/v10";
import { actionRow, button } from "library/components";
import { type Command, type Component, type Context, reply } from "library/core";
import { Economy } from "library/plugins";
import { inject, injectable } from "tsyringe";

const CONFIRM_TIMEOUT = 60 * 1000;
const TITLE = "Reset Server Economy";

@injectable()
export default class implements Command {
	private readonly pending = new Map<string, Snowflake>();

	public constructor(
		@inject(Database) private db: Database,
		@inject(Economy) private economy: Economy,
	) {}

	/**
	 * Reset every member's balance, inventory and badges
	 *
	 * @param {Context} context - The context of the command
	 **/
	public async chatInputRun({ i, guild, author }: Context) {
		const { economy } = await this.db.getGuildSettings(guild.id);

		this.pending.set(i.id, author.id);
		setTimeout(() => this.pending.delete(i.id), CONFIRM_TIMEOUT);

		return {
			embeds: [
				{
					title: TITLE,
					description: `This will set **every** member's balance to ${this.economy.formatCurrency(economy, economy.defaultBalance)} and clear all inventories and badges. This cannot be undone.`,
					footer: { text: "Expires in 1 minute" },
				},
			],
			components: [
				actionRow({
					command: "economy/reset/server",
					context: i.id,
					components: [
						button({ method: this.confirm, label: "Reset Everyone", style: ButtonStyle.Danger }),
						button({ method: this.cancel, label: "Cancel", style: ButtonStyle.Secondary }),
					],
				}),
			],
		};
	}

	public confirm: Component = async (ctx, key) => {
		const authorId = this.pending.get(key);

		if (!authorId) {
			return this.closed("This confirmation has expired. Run the command again to reset the economy.");
		}

		if (ctx.author.id !== authorId) {
			await reply(ctx.i, "Only the member who ran this command can confirm it.", { prefix: "error" });
			return;
		}

		this.pending.delete(key);

		const count = await this.economy.resetGuild(ctx.guild.id);

		return this.closed(`<@${ctx.author.id}> reset the economy for ${count.toLocaleString()} member(s).`);
	};

	public cancel: Component = async (ctx, key) => {
		const authorId = this.pending.get(key);

		if (authorId && ctx.author.id !== authorId) {
			await reply(ctx.i, "Only the member who ran this command can cancel it.", { prefix: "error" });
			return;
		}

		this.pending.delete(key);

		return this.closed("The economy reset was cancelled.");
	};

	private closed(description: string) {
		return { embeds: [{ title: TITLE, description }], components: [] };
	}
}
