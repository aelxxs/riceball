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
import type { Command, Context } from "library/core";
import { inject, injectable } from "tsyringe";

@injectable()
export default class implements Command {
	public constructor(@inject(Database) private db: Database) {}

	/**
	 * View your purchased badges
	 *
	 * @param {Context} context - The context of the command
	 **/
	public async chatInputRun({ guild, author }: Context) {
		const { badges } = await this.db.getMemberSettings(guild.id, author.id);

		if (!badges || badges.length === 0) {
			return "You don't have any badges yet! Purchase some from the shop to get started.";
		}

		const badgeList = badges
			.map((badge) => {
				const status = badge.active ? "✓" : "✗";
				const slot = badge.slot > 0 ? ` (Slot ${badge.slot})` : "";
				return `${status} ${badge.itemId}${slot}`;
			})
			.join("\n");

		return `**Your Badges:**\n${badgeList}\n\n✓ = Active | ✗ = Inactive`;
	}
}
