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
import { APIGuild } from "discord-api-types/v10";
import emojis from "node-emoji";

export default class implements Command {
	/**
	 * Configure the emoji used to star messages
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ guild }: Context, { emoji }: Options) {
		if (!validateEmoji(guild, emoji)) {
			throw `\`${emoji}\` is currently not a supported emoji. Please try again.`;
		}

		await updateGuild(guild.id, {
			stars: { emoji },
		});

		return `The emoji for starring messages has been set to ${emoji}`;
	}
}

// TODO: Move this to a separate file or define as a [class method (Broken ATM)]
function validateEmoji(guild: APIGuild, emoji: string) {
	const unicode = emojis.find(emoji);

	if (unicode) {
		return unicode.emoji;
	}

	const custom = guild.emojis.find(({ id }) => {
		return emoji.includes(id!);
	});

	if (custom) {
		return custom.id;
	}

	return null;
}

interface Options {
	/* The emoji to use to star messages */
	emoji: string;
}
