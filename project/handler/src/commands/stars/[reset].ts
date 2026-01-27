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

import { Database, Stars } from "@riceball/db";
import type { Command, Context } from "library/core";
import { inject, injectable } from "tsyringe";

@injectable()
export default class implements Command {
	public constructor(@inject(Database) private db: Database) {}

	/**
	 * Reset your server's Starboard settings
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ guild }: Context, { key }: Options) {
		const { stars } = await this.db.getGuildSettings(guild.id);

		switch (key) {
			case "settings":
				await this.db.setGuildSettings(guild.id, {
					stars: new Stars(),
				});
				return "All starboard settings have been reset to default.";

			case "channel":
				await this.db.setGuildSettings(guild.id, {
					stars: { channelId: null },
				});
				return "The starboard channel has been reset.";

			case "emoji":
				await this.db.setGuildSettings(guild.id, {
					stars: { emoji: "⭐" },
				});
				return "The starboard emoji has been reset to ⭐.";

			case "threshold":
				await this.db.setGuildSettings(guild.id, {
					stars: { threshold: 3 },
				});
				return "The starboard threshold has been reset to 3.";

			default:
				return "Invalid setting key.";
		}
	}
}

interface Options {
	/* The setting to reset */
	key: "settings" | "channel" | "emoji" | "threshold";
}
