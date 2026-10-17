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

import { hyperlink } from "@discordjs/formatters";
import { stripIndents } from "common-tags";
import { Constants } from "library/common";
import { actionRow, button } from "library/components";
import type { Command, Context, MessagePayload } from "library/core";

export default class implements Command {
	/**
	 * Join the Rice Ball support server
	 *
	 * @param {Context} context - The context of the command
	 **/
	public chatInputRun({ i }: Context): MessagePayload {
		// same invite the dashboard uses to add the bot
		const invite = `https://discord.com/oauth2/authorize?client_id=${i.application_id}&scope=bot%20applications.commands&permissions=8`;

		return {
			embeds: [
				{
					title: "Rice Ball Support",
					description: stripIndents`
						Need help, found a bug or have a suggestion? Join the ${hyperlink("support server", Constants.SupportURL)}.

						You can also ${hyperlink("invite Rice Ball", invite)} to another server.
					`,
				},
			],
			components: [
				actionRow({
					command: "support",
					components: [
						button({ label: "Support Server", url: Constants.SupportURL }),
						button({ label: "Invite Rice Ball", url: invite }),
					],
				}),
			],
		};
	}
}
