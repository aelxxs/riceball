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
	 * Clear a badge from your level card
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ guild, author }: Context, { slot }: Options) {
		if (slot < 1 || slot > 6) {
			return "Invalid slot! Please choose a slot between 1 and 6.";
		}

		const member = await this.db.getMemberSettings(guild.id, author.id);

		// Find badge in this slot
		const badgeIndex = member.badges.findIndex((b) => b.active && b.slot === slot);

		if (badgeIndex === -1) {
			return `Slot ${slot} is already empty!`;
		}

		const badgeName = member.badges[badgeIndex].itemId;

		// Deactivate the badge
		member.badges[badgeIndex] = {
			...member.badges[badgeIndex],
			active: false,
			slot: 0,
		};

		await this.db.setMemberSettings(guild.id, author.id, wrap(member).toObject());

		return `Successfully cleared **${badgeName}** from slot ${slot}!`;
	}
}

interface Options {
	/* The slot to clear the badge from */
	slot: number;
}
