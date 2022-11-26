/**
 * Author: Alexis Vielma
 **/

import { read, write } from "@lib/data";
import { APIUser } from "discord-api-types/v10";

export default class implements Command {
	/**
	 * Add or remove a user from the Levels blacklist
	 *
	 * @param {Context} context
	 * @param {Options} options
	 **/
	public async chatInputRun({ t, guild }: Context, { user }: Options) {
		const {
			levels: {
				blacklist: { users },
			},
		} = await read(guild);

		if (users.includes(user.id)) {
			await write(guild, {
				levels: {
					blacklist: {
						users: users.filter((id) => id !== user.id),
					},
				},
			});

			return `<@${user.id}> was removed from the Levels blacklist.`;
		}

		await write(guild, {
			levels: {
				blacklist: {
					users: [...users, user.id],
				},
			},
		});

		return `<@${user.id}> was added to the blacklist. They will no longer gain experience.`;
	}
}

interface Options {
	/* ? The user to blacklist */
	user: APIUser;
}
