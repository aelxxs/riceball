/**
 * Author: Alexis Vielma
 **/

import { read, write } from "@lib/data";
import { APIRole } from "discord-api-types/v10";

export default class implements Command {
	/**
	 * Add or remove a role from the Levels blacklist
	 *
	 * @param {Context} context
	 * @param {Options} options
	 **/
	public async chatInputRun({ t, guild }: Context, { role }: Options) {
		const {
			levels: {
				blacklist: { roles },
			},
		} = await read(guild);

		if (roles.includes(role.id)) {
			await write(guild, {
				levels: {
					blacklist: {
						users: roles.filter((id) => id !== role.id),
					},
				},
			});

			return `<@${role.id}> was removed from the blacklist.`;
		}

		await write(guild, {
			levels: {
				blacklist: {
					users: [...roles, role.id],
				},
			},
		});

		return `<@${role.id}> was added to the blacklist. Members with this role will no longer recieve experience.`;
	}
}

interface Options {
	/* ? The role to blacklist */
	role: APIRole;
}
