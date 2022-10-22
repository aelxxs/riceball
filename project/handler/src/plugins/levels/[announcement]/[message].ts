/**
 * Author: Alexis Vielma
 **/

import { write } from "@lib/data";

export default class implements Command {
	/**
	 * Configure what is sent when a user levels up
	 *
	 * @param {Context} context
	 * @param {Options} options
	 **/
	public async chatInputRun({ t, guild }: Context, { message }: Options) {
		await write(guild, {
			levels: {
				announcement: {
					message,
				},
			},
		});

		return `Level up annoucement message updated.`;
	}
}

interface Options {
	/* ? The message to send */
	message: string;
}
