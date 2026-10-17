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

import type { Command, Context } from "library/core";
import { Levels } from "library/plugins";
import { inject, injectable } from "tsyringe";

@injectable()
export default class implements Command {
	public constructor(@inject(Levels) private levels: Levels) {}

	public async autocompleteRun({ guild }: Context) {
		const rewards = await this.levels.getRewards(guild.id);

		return rewards.slice(0, 25).map(({ level, roles }) => ({
			name: `Level ${level} (${roles.length} ${roles.length === 1 ? "role" : "roles"})`,
			value: level,
		}));
	}

	/**
	 * Remove a reward from the leveling rewards list
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ guild }: Context, { level }: Options) {
		const removed = await this.levels.removeReward(guild.id, level);

		if (!removed) {
			throw `No reward was found for level \`${level}\`.`;
		}

		return `Successfully removed the reward for level \`${level}\`.`;
	}
}

interface Options {
	/* The level to remove the reward from */
	level: number;
}
