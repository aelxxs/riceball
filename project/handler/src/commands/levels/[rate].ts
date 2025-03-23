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
import { updateGuild } from "db";

export default class implements Command {
	/**
	 * Configure the rate at which users gain experience
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ guild }: Context, { type, rate, cooldown }: Options) {
		const cooldownInMs = cooldown * 1000;

		switch (type) {
			case "message":
				await updateGuild(guild.id, {
					levels: {
						talkRateMin: rate,
						talkCooldown: cooldownInMs,
					},
				});
				break;
			case "voice":
				await updateGuild(guild.id, {
					levels: {
						talkRateMin: rate,
						talkCooldown: cooldownInMs,
					},
				});
				break;
		}

		return `The ${type} rate has been set to \`${rate}\` per \`${cooldown}\` seconds.`;
	}
}

interface Options {
	/* The type of experience to set the rate for */
	type: "voice" | "message";
	/* How much experience to give */
	rate: number;
	/* How long to wait before giving experience again (in seconds) */
	cooldown: number;
}
