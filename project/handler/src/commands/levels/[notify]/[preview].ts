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

import type { REST } from "@discordjs/rest";
import { Database } from "@riceball/db";
import { Routes } from "discord-api-types/v10";
import { Deps } from "library/common";
import type { Command, Context } from "library/core";
import { Levels } from "library/plugins";
import { inject, injectable } from "tsyringe";

@injectable()
export default class implements Command {
	public constructor(
		@inject(Database) private db: Database,
		@inject(Levels) private levels: Levels,
		@inject(Deps.Rest) private rest: REST,
	) {}

	/**
	 * Preview the announcement made when you level up
	 *
	 * @param {Context} context - The context of the command
	 **/
	public async chatInputRun({ i, guild, author }: Context) {
		const settings = await this.db.getGuildSettings(guild.id);
		const { exp } = await this.db.getMemberSettings(guild.id, author.id);

		const body = this.levels.renderLevelUpMessage(settings, author, this.levels.getLvl(exp));

		// sent directly because the reply helpers recolor embeds, and the preview must match the real announcement
		await this.rest.patch(Routes.webhookMessage(i.application_id, i.token), {
			body: { ...body, allowed_mentions: { parse: [] } },
		});
	}
}
