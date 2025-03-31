import { getGuild as getGuildSettings } from "@riceball/db";
import type { GatewayMessageReactionRemoveDispatchData } from "discord-api-types/v10";
import { type Event, getChannel, getGuild, getMessage, send } from "library/core";
import { Starboard } from "library/plugins/Starboard";
import { inject, injectable } from "tsyringe";

@injectable()
export default class implements Event {
	private starboard: Starboard;

	public constructor(@inject(Starboard) starboard: Starboard) {
		this.starboard = starboard;
	}

	public async exec(event: GatewayMessageReactionRemoveDispatchData) {
		if (!event.guild_id) return;

		const { stars } = await getGuildSettings(event.guild_id);

		if (!stars.enabled) return;

		const guild = await getGuild(event.guild_id);
		const channel = await getChannel(event.channel_id);
		const message = await getMessage(event.channel_id, event.message_id);

		const error = await this.starboard.remove(guild, message, event.user_id, event.emoji);

		if (error) {
			send(channel.id, error, { prefix: "error" });
		}
	}
}
