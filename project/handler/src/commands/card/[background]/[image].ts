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
import { updateMember } from "db";
import type { APIAttachment } from "discord-api-types/v10";

export default class implements Command {
	/**
	 * Set the background image of your card
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ guild, author }: Context, { value }: Options) {
		// Check if image url is (png, jpg, jpeg, gif)
		// if (!value.url.match(/\.(jpeg|jpg|gif|png)$/) !== null) {
		// 	return "Sorry, the image you provided is not a valid image. Please provide a valid image.";
		// }

		await updateMember(guild.id, author.id, {
			card: { backgroundUrl: value.url },
		});

		return `Your background image has been set to ${value.url}.`;
	}
}

interface Options {
	/* The image attachment */
	value: APIAttachment;
}
