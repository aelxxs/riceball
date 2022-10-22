/**
 * Author: Alexis Vielma
 **/

import { write } from "@lib/data";

export default class implements Command {
	/**
	 * Enable level up announcements
	 *
	 * @param {Context} context
	 **/
	public async chatInputRun({ t, guild }: Context) {
		await write(guild, {
			levels: {
				announcement: {
					enabled: true,
				},
			},
		});

		return `Level up annoucement messages are now enabled.`;
	}
}
