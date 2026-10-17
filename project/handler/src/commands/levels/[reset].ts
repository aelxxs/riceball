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

import { userMention } from "@discordjs/formatters";
import type { APIUser } from "discord-api-types/v10";
import { type Command, type Component, type Context, edit, type MessagePayload } from "library/core";
import { Levels } from "library/plugins";
import { inject, injectable } from "tsyringe";
import { closed, confirmationRow, deferUpdate, EXPIRED_MESSAGE, isExpired, isRequester } from "./__confirm";

@injectable()
export default class implements Command {
	public constructor(@inject(Levels) private levels: Levels) {}

	/**
	 * Reset the exp of every member, or of a single member
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public chatInputRun({ author }: Context, { member }: Options): MessagePayload {
		const target = member ? `the exp of ${userMention(member.id)}` : "the exp of **every member** in this server";

		return {
			embeds: [{ description: `Are you sure you want to reset ${target}? This cannot be undone.` }],
			components: [confirmationRow("levels/reset", `${author.id},${member?.id ?? ""}`)],
		};
	}

	public confirm: Component = async (ctx, state) => {
		const [requesterId, memberId] = state.split(",");

		if (!(await isRequester(ctx, requesterId))) return;
		if (isExpired(ctx)) return closed(EXPIRED_MESSAGE, "error");

		if (memberId) {
			await this.levels.resetExp(ctx.guild.id, [memberId]);
			return closed(`Reset the exp of ${userMention(memberId)}.`);
		}

		await deferUpdate(ctx.i);

		const count = await this.levels.resetExp(ctx.guild.id);

		await edit(ctx.i, closed(`Reset the exp of **${count.toLocaleString()}** members.`));
	};

	public cancel: Component = async (ctx, state) => {
		const [requesterId] = state.split(",");

		if (!(await isRequester(ctx, requesterId))) return;

		return closed("Reset cancelled.", null);
	};
}

interface Options {
	/* The member to reset, or everyone when omitted */
	member?: APIUser;
}
