import { logger } from "@riceball/logger";
import type { GatewayMessageCreateDispatchData } from "discord-api-types/v10";
import type { Event } from "library/core";
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
		if (event.author.bot || event.webhook_id) return;

		try {
			await this.levels.giveTextExp(event);
		} catch (error) {
			logger.error(`Failed to give text exp in guild ${event.guild_id}`);
			logger.trace(error);
		}
	}
}
