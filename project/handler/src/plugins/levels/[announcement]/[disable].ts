/**
 * Author: Alexis Vielma
 **/

import { write } from "@lib/data";

export default class implements Command {
	/**
	 * Disable level up announcements
	 *
	 * @param {Context} context
	 **/
	public async chatInputRun({ t, guild }: Context) {
		await write(guild, {
			levels: {
				announcement: {
					enabled: false,
				},
			},
		});

		return `Level up annoucement messages are now disabled.`;
	}
}
