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

import { bold, userMention } from "@discordjs/formatters";
import { stripIndents } from "common-tags";
import { actionRow, button } from "library/components";
import { type Command, type Component, type Context, getGuildIcon, type MessagePayload } from "library/core";
import { Levels } from "library/plugins";
import { inject, injectable } from "tsyringe";

const PAGE_SIZE = 10;

@injectable()
export default class implements Command {
	public constructor(@inject(Levels) private levels: Levels) {}

	/**
	 * View your server's level leaderboard
	 *
	 * @param {Context} context - The context of the command
	 **/
	public chatInputRun(ctx: Context) {
		return this.renderPage(ctx, 1);
	}

	public showPage: Component = (ctx: Context, page) => {
		return this.renderPage(ctx, Number(page) || 1);
	};

	private async renderPage({ guild, author }: Context, page: number): Promise<MessagePayload> {
		const [leaderboard, rank] = await Promise.all([
			this.levels.getLeaderboard(guild.id, page, PAGE_SIZE),
			this.levels.getMemberRank(guild.id, author.id),
		]);

		const lines = leaderboard.entries.map(({ rank, userId, exp, level }) => {
			const name = userId === author.id ? bold(userMention(userId)) : userMention(userId);
			return `\`#${rank}\` ${name} – Lvl. \`${level}\` (${exp.toLocaleString()} exp.)`;
		});

		return {
			embeds: [
				{
					author: {
						name: `${guild.name} – Leaderboard`,
						icon_url: getGuildIcon(guild),
					},
					description: stripIndents`
						\`\`\`
						Viewing Level Leaderboard
						\`\`\`
						${lines.length ? lines.join("\n") : "> Nobody has earned any exp yet."}
					`,
					footer: {
						text: `Page ${leaderboard.page}/${leaderboard.pageCount} • Your rank: #${rank}`,
					},
				},
			],
			components:
				leaderboard.pageCount > 1
					? [
							actionRow({
								command: "leaderboard",
								components: [
									button({
										method: `showPage|${leaderboard.page - 1}`,
										label: "Previous",
										disabled: leaderboard.page <= 1,
									}),
									button({
										method: `showPage|${leaderboard.page + 1}`,
										label: "Next",
										disabled: leaderboard.page >= leaderboard.pageCount,
									}),
								],
							}),
						]
					: [],
		};
	}
}
