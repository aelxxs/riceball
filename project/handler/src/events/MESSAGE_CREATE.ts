import { logger } from "@riceball/logger";
import type { GatewayMessageCreateDispatchData } from "discord-api-types/v10";
import type { Event } from "library/core";
import { Economy, Levels } from "library/plugins";
import { inject, injectable } from "tsyringe";

@injectable()
export default class implements Event {
	private levels: Levels;
	private economy: Economy;

	public constructor(@inject(Levels) levels: Levels, @inject(Economy) economy: Economy) {
		this.levels = levels;
		this.economy = economy;
	}

	public async exec(event: GatewayMessageCreateDispatchData) {
		if (!event.guild_id || !event.member) return;
		if (event.author.bot || event.webhook_id) return;

		await Promise.all([
			this.levels.giveTextExp(event).catch((error) => {
				logger.error(`Failed to give text exp in guild ${event.guild_id}`);
				logger.trace(error);
			}),
			this.economy.giveTextCurrency(event).catch((error) => {
				logger.error(`Failed to give text currency in guild ${event.guild_id}`);
				logger.trace(error);
			}),
		]);
	}
}
