/**
 * Author: Alexis Vielma
 **/

import { write } from "@lib/data";
import type { APIPartialChannel } from "discord-api-types/v10";

export default class implements Command {
	/**
	 * Configure which channel the announcement message is sent to
	 *
	 * @param {Context} context
	 * @param {Options} options
	 **/
	public async chatInputRun({ t, guild }: Context, { channel }: Options) {
		await write(guild, {
			levels: {
				announcement: {
					channel: channel.id,
				},
			},
		});

		return `Level up annoucement messages will now be sent to <#${channel.id}>.`;
	}
}

interface Options {
	/* ? The channel to send the message to */
	channel: APIPartialChannel;
}
