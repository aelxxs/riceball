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

import { Database, wrap } from "@riceball/db";
import type { Command, Context } from "library/core";
import { inject, injectable } from "tsyringe";

@injectable()
export default class implements Command {
	public constructor(@inject(Database) private db: Database) {}

	/**
	 * Autocomplete for the command
	 *
	 * @param {Context} context - The context of the command
	 * @param {string} input - The input of the user
	 **/
	public async autocompleteRun({ guild, author }: Context, input: string) {
		const { badges } = await this.db.getMemberSettings(guild.id, author.id);

		if (!badges || badges.length === 0) {
			return [];
		}

		const filtered = badges
			.filter((badge) => badge.itemId.toLowerCase().includes(input.toLowerCase()))
			.slice(0, 25)
			.map((badge) => ({
				name: `${badge.itemId}${badge.active ? " (Active)" : ""}`,
				value: badge.itemId,
			}));

		return filtered;
	}

	/**
	 * Set a badge on your level card
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ guild, author }: Context, { badge, slot }: Options) {
		if (slot < 1 || slot > 6) {
			return "Invalid slot! Please choose a slot between 1 and 6.";
		}

		const member = await this.db.getMemberSettings(guild.id, author.id);

		// Check if user owns this badge
		const badgeIndex = member.badges.findIndex((b) => b.itemId === badge);

		if (badgeIndex === -1) {
			return "You don't own this badge! Purchase it from the shop first.";
		}

		// Check if slot is already occupied by another badge
		const occupiedIndex = member.badges.findIndex((b) => b.active && b.slot === slot);
		if (occupiedIndex !== -1 && occupiedIndex !== badgeIndex) {
			return `Slot ${slot} is already occupied by ${member.badges[occupiedIndex].itemId}. Clear it first or choose a different slot.`;
		}

		// Update the badge
		member.badges[badgeIndex] = {
			...member.badges[badgeIndex],
			active: true,
			slot,
		};

		await this.db.setMemberSettings(guild.id, author.id, wrap(member).toObject());

		return `Successfully equipped **${badge}** to slot ${slot}!`;
	}
}

interface Options {
	/* The badge to set */
	badge: string;
	/* The slot to set the badge in */
	slot: number;
}
