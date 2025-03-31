import { getGuild as getGuildSettings } from "@riceball/db";
import type { GatewayMessageReactionAddDispatchData } from "discord-api-types/v10";
import { API, type Event, send } from "library/core";
import { Starboard } from "library/plugins/Starboard";
import { inject, injectable } from "tsyringe";

@injectable()
export default class implements Event {
	private api: API;
	private starboard: Starboard;

	public constructor(@inject(API) api: API, @inject(Starboard) starboard: Starboard) {
		this.api = api;
		this.starboard = starboard;
	}

	public async exec(event: GatewayMessageReactionAddDispatchData) {
		if (!event.guild_id) return;

		const { stars } = await getGuildSettings(event.guild_id);

		if (!stars.enabled) return;

		const guild = await this.api.getGuild(event.guild_id);
		const channel = await this.api.getChannel(event.channel_id);
		const message = await this.api.getMessage(event.channel_id, event.message_id);

		const error = await this.starboard.add(guild, message, event.user_id, event.emoji);

		if (error) {
			send(channel.id, error, { prefix: "error", ephemeral: true });
		}
	}
}
