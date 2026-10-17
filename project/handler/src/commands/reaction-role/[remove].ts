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

import { Database, ReactionRole } from "@riceball/db";
import type { Command, Context } from "library/core";
import { ReactionRoles } from "library/plugins/ReactionRoles";
import { inject, injectable } from "tsyringe";

@injectable()
export default class implements Command {
	public constructor(@inject(Database) private db: Database) {}

	/**
	 * Remove a reaction role
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ guild }: Context, { message, emoji }: Options) {
		const em = this.db.rm.em.fork();
		const reactionRole = await em.findOne(ReactionRole, {
			guildId: guild.id,
			messageId: message,
		});

		if (!reactionRole) {
			return "Reaction role message not found. Please ensure the message ID is correct.";
		}

		const key = ReactionRoles.emojiKey(emoji);
		const pairIndex = reactionRole.pairs.findIndex((pair) => ReactionRoles.emojiKey(pair.emoji) === key);

		if (pairIndex === -1) {
			return `The emoji ${emoji} is not configured as a reaction role on this message.`;
		}

		reactionRole.pairs = reactionRole.pairs.filter((_, index) => index !== pairIndex);
		await em.flush();

		if (reactionRole.pairs.length === 0) {
			return `Removed ${emoji} from \`${reactionRole.alias}\`. This was the last reaction role, consider deleting the message.`;
		}

		return `Successfully removed ${emoji} from \`${reactionRole.alias}\`.`;
	}
}

interface Options {
	/* The message to remove the reaction role from */
	message: string;
	/* The emoji to remove from the message */
	emoji: string;
}
