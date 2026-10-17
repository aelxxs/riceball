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
import type { Command, Context, MessagePayload } from "library/core";
import { inject, injectable } from "tsyringe";

@injectable()
export default class implements Command {
	public constructor(@inject(Database) private db: Database) {}

	/**
	 * Autocomplete for the command
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async autocompleteRun({ guild, author }: Context, { badge = "" }: Partial<Options>) {
		const owned = await this.getOwnedBadges(guild.id, author.id);
		const items = await this.db.rm.items.find(
			{ guildId: guild.id, type: ItemType.BADGE },
			{ orderBy: { name: "asc" }, refresh: true },
		);

		const query = badge.trim().toLowerCase();

		return items
			.filter((item) => item.active || owned.has(item.id))
			.filter((item) => item.name.toLowerCase().includes(query))
			.slice(0, 25)
			.map((item) => ({
				name: `${item.name}${owned.has(item.id) ? " (Owned)" : ""}`.slice(0, 100),
				value: item.id,
			}));
	}

	/**
	 * Preview a badge from this server's shop
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ guild, author }: Context, { badge }: Options): Promise<MessagePayload> {
		const items = await this.db.rm.items.find(
			{ guildId: guild.id, type: ItemType.BADGE },
			{ orderBy: { name: "asc" }, refresh: true },
		);

		const query = badge.trim().toLowerCase();
		const item = items.find(({ id }) => id === badge) ?? items.find(({ name }) => name.toLowerCase() === query);
		const image = item?.data?.badge;

		if (!item || !image) {
			throw "That badge doesn't exist in this server.";
		}

		const owned = await this.getOwnedBadges(guild.id, author.id);

		return {
			embeds: [
				{
					title: item.name,
					description: item.about ?? undefined,
					image: { url: image },
					footer: { text: owned.has(item.id) ? "You own this badge" : "You don't own this badge yet" },
				},
			],
		};
	}

	private async getOwnedBadges(guildId: string, userId: string) {
		const { badges } = await this.db.getMemberSettings(guildId, userId);
		return new Set(badges.map(({ itemId }) => itemId));
	}
}

interface Options {
	/* The badge to preview */
	badge: string;
}
