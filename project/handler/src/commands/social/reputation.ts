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

import type { Command, Context } from "@lib/core";
import { getUser, updateUser } from "db";
import type { APIUser } from "discord-api-types/v10";
import ms from "ms";

const ONE_DAY = 86400000;

export default class implements Command {
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

		const { lastReputation } = await getUser(sender.id);

		const now = Date.now();
		const timeDiff = now - (lastReputation ?? 0);

		if (!lastReputation || timeDiff >= ONE_DAY) {
			const { reputation } = await getUser(user.id);

			await updateUser(user.id, {
				reputation: reputation + 1,
			});

			await updateUser(sender.id, {
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
