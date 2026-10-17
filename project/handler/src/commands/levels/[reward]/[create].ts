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

import type { APIRole } from "discord-api-types/v10";
import type { Command, Context } from "library/core";
import { Levels } from "library/plugins";
import { inject, injectable } from "tsyringe";

@injectable()
export default class implements Command {
	public constructor(@inject(Levels) private levels: Levels) {}

	/**
	 * Add a reward to the leveling rewards list
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ guild }: Context, { level, reward }: Options) {
		if (reward.id === guild.id) {
			throw "The `@everyone` role cannot be used as a reward.";
		}

		if (reward.managed) {
			throw "Managed roles cannot be used as rewards.";
		}

		await this.levels.addReward(guild.id, level, reward.id);

		return `Users will now receive the <@&${reward.id}> role at level \`${level}\`.`;
	}
}

interface Options {
	/* The level to give the reward at */
	level: number;
	/* The reward to give */
	reward: APIRole;
}
