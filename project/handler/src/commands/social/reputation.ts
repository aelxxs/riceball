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
import type { APIUser } from "discord-api-types/v10";
import type { Command, Context } from "library/core";
import ms from "ms";
import { inject, injectable } from "tsyringe";

const ONE_DAY = 86400000;

@injectable()
export default class implements Command {
	public db: Database;

	public constructor(@inject(Database) db: Database) {
		this.db = db;
	}
	/**
	 * Give a user reputation
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ author: sender }: Context, { user }: Options) {
		if (user.id === sender.id) {
			throw "You can't give yourself reputation.";
		}

		const { lastReputation } = await this.db.getUserSettings(sender.id);

		const now = Date.now();
		const timeDiff = now - (lastReputation ?? 0);

		if (!lastReputation || timeDiff >= ONE_DAY) {
			const { reputation } = await this.db.getUserSettings(user.id);

			await this.db.setUserSettings(user.id, {
				reputation: reputation + 1,
			});

			await this.db.setUserSettings(sender.id, {
				lastReputation: now,
			});

			return `You have given <@${user.id}> a reputation point.`;
		}

		const timeLeft = ms(ONE_DAY - timeDiff, { long: true });

		throw `You must wait \`${timeLeft}\` in order to give another reputation.`;
	}
}

interface Options {
	/* A user in this server */
	user: APIUser;
}
