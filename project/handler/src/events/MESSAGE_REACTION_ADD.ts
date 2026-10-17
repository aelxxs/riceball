import { Database } from "@riceball/db";
import type { GatewayMessageReactionAddDispatchData } from "discord-api-types/v10";
import { API, type Event, send } from "library/core";
import { ReactionRoles } from "library/plugins/ReactionRoles";
import { Starboard } from "library/plugins/Starboard";
import { inject, injectable } from "tsyringe";

@injectable()
export default class implements Event {
	private db: Database;
	private api: API;
	private starboard: Starboard;
	private reactionRoles: ReactionRoles;

	public constructor(
		@inject(API) api: API,
		@inject(Starboard) starboard: Starboard,
		@inject(ReactionRoles) reactionRoles: ReactionRoles,
		@inject(Database) db: Database,
	) {
		this.db = db;
		this.api = api;
		this.starboard = starboard;
		this.reactionRoles = reactionRoles;
	}

	public async exec(event: GatewayMessageReactionAddDispatchData) {
		if (!event.guild_id) return;

		await Promise.all([this.reactionRoles.add(event), this.handleStarboard(event.guild_id, event)]);
	}

	private async handleStarboard(guildId: string, event: GatewayMessageReactionAddDispatchData) {
		const guildSettings = await this.db.getGuildSettings(guildId);

		if (!guildSettings?.stars?.enabled) return;

		const guild = await this.api.getGuild(guildId);
		const channel = await this.api.getChannel(event.channel_id);
		const message = await this.api.getMessage(event.channel_id, event.message_id);

		const error = await this.starboard.add(guild, message, event.user_id, event.emoji);

		if (error) {
			send(channel.id, error, { prefix: "error", ephemeral: true });
		}
	}
}
