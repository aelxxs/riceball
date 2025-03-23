import { Event, getGuild } from "@lib/core";
import type { GatewayMessageCreateDispatchData } from "discord-api-types/v10";
import { Levels } from "library/plugins";
import { inject, injectable } from "tsyringe";

@injectable()
export default class implements Event {
	private levels: Levels;

	public constructor(@inject(Levels) levels: Levels) {
		this.levels = levels;
	}

	public async exec(event: GatewayMessageCreateDispatchData) {
		if (!event.guild_id || !event.member) return;
		if (event.author.bot) return;

		console.log({ content: event.content });
		// await this.levels.giveTextExp(event);
	}
}
