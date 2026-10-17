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

import type { Snowflake } from "discord-api-types/v10";
import type Redis from "ioredis";
import { Deps } from "library/common";
import { type Command, type Component, type Context, edit, type MessagePayload } from "library/core";
import { Levels } from "library/plugins";
import { inject, injectable } from "tsyringe";
import { CONFIRM_TIMEOUT, closed, confirmationRow, deferUpdate, EXPIRED_MESSAGE, isRequester } from "./__confirm";

const pendingKey = (guildId: Snowflake, id: Snowflake) => `levels-prune:${guildId}:${id}`;

@injectable()
export default class implements Command {
	public constructor(
		@inject(Levels) private levels: Levels,
		@inject(Deps.Redis) private redis: Redis,
	) {}

	/**
	 * Reset the exp of members who have left the server
	 *
	 * @param {Context} context - The context of the command
	 **/
	public async chatInputRun({ i, guild, author }: Context): Promise<MessagePayload> {
		const departed = await this.levels.findDepartedMembers(guild.id);

		if (!departed.length) {
			return "No members with exp have left this server.";
		}

		await this.redis.set(pendingKey(guild.id, i.id), JSON.stringify(departed), "EX", CONFIRM_TIMEOUT);

		const members = departed.length === 1 ? "member" : "members";

		return {
			embeds: [
				{
					description: `Found **${departed.length.toLocaleString()}** ${members} with exp who left this server. Reset their exp? This cannot be undone.`,
				},
			],
			components: [confirmationRow("levels/prune", `${author.id},${i.id}`)],
		};
	}

	public confirm: Component = async (ctx, state) => {
		const [requesterId, id] = state.split(",");

		if (!(await isRequester(ctx, requesterId))) return;

		const key = pendingKey(ctx.guild.id, id);
		const pending = await this.redis.get(key);

		if (!pending) return closed(EXPIRED_MESSAGE, "error");

		await this.redis.del(key);
		await deferUpdate(ctx.i);

		const count = await this.levels.resetExp(ctx.guild.id, JSON.parse(pending) as Snowflake[]);

		await edit(ctx.i, closed(`Reset the exp of **${count.toLocaleString()}** members who left this server.`));
	};

	public cancel: Component = async (ctx, state) => {
		const [requesterId, id] = state.split(",");

		if (!(await isRequester(ctx, requesterId))) return;

		await this.redis.del(pendingKey(ctx.guild.id, id));

		return closed("Prune cancelled.", null);
	};
}
