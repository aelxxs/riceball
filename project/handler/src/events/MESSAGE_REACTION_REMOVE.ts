import { Database } from "@riceball/db";
import type { GatewayMessageReactionRemoveDispatchData } from "discord-api-types/v10";
import { API, type Event, send } from "library/core";
import { Starboard } from "library/plugins/Starboard";
import { inject, injectable } from "tsyringe";

@injectable()
export default class implements Event {
	private api: API;
	private starboard: Starboard;
	private db: Database;

	public constructor(@inject(API) api: API, @inject(Starboard) starboard: Starboard, @inject(Database) db: Database) {
		this.api = api;
		this.starboard = starboard;
		this.db = db;
	}

	public async exec(event: GatewayMessageReactionRemoveDispatchData) {
		if (!event.guild_id) return;

		const guildSettings = await this.db.getGuildSettings(event.guild_id);

		if (!guildSettings?.stars?.enabled) return;

		const guild = await this.api.getGuild(event.guild_id);
		const channel = await this.api.getChannel(event.channel_id);
		const message = await this.api.getMessage(event.channel_id, event.message_id);

		const error = await this.starboard.remove(guild, message, event.user_id, event.emoji);

		if (error) {
			send(channel.id, error, { prefix: "error" });
		}
	}
}
