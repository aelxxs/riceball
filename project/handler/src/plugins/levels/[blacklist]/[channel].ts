/**
 * Author: Alexis Vielma
 **/

import { read, write } from "@lib/data";
import { APIPartialChannel } from "discord-api-types/v10";

export default class implements Command {
	/**
	 * Add or remove a channel from the Levels blacklist
	 *
	 * @param {Context} context
	 * @param {Options} options
	 **/
	public async chatInputRun({ t, guild }: Context, { channel }: Options) {
		const {
			levels: {
				blacklist: { channels },
			},
		} = await read(guild);

		if (channels.includes(channel.id)) {
			await write(guild, {
				levels: {
					blacklist: {
						users: channels.filter((id) => id !== channel.id),
					},
				},
			});

			return `<#${channel.id}> was removed from the Levels blacklist.`;
		}

		await write(guild, {
			levels: {
				blacklist: {
					users: [...channels, channel.id],
				},
			},
		});

		return `<#${channel.id}> was added to the blacklist. Messages sent in this channel will no longer count torwards experience growth.`;
	}
}

interface Options {
	/* ? The channel to blacklist */
	channel: APIPartialChannel;
}
