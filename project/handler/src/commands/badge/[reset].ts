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
	 * Clear all badges from your level card
	 *
	 * @param {Context} context - The context of the command
	 **/
	public async chatInputRun({ guild, author }: Context) {
		const member = await this.db.getMemberSettings(guild.id, author.id);

		const activeBadges = member.badges.filter((b) => b.active);

		if (activeBadges.length === 0) {
			return "You don't have any active badges to clear!";
		}

		// Deactivate all badges
		member.badges = member.badges.map((badge) => ({
			...badge,
			active: false,
			slot: 0,
		}));

		await this.db.setMemberSettings(guild.id, author.id, wrap(member).toObject());

		return `Successfully cleared all ${activeBadges.length} badge${activeBadges.length === 1 ? "" : "s"} from your card!`;
	}
}
