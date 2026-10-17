import { Database, type Member } from "@riceball/db";
import { logger } from "@riceball/logger";
import type { GatewayGuildMemberRemoveDispatchData } from "discord-api-types/v10";
import type { Event } from "library/core";
import { inject, injectable } from "tsyringe";

@injectable()
export default class implements Event {
	private db: Database;

	public constructor(@inject(Database) db: Database) {
		this.db = db;
	}

	public async exec(event: GatewayGuildMemberRemoveDispatchData) {
		const { guild_id: guildId, user } = event;
		if (user.bot) return;

		try {
			const { economy, levels } = await this.db.getGuildSettings(guildId);
			const clearEconomy = economy.enabled && economy.clearOnLeave;
			const clearLevels = levels.enabled && levels.clearOnLeave;
			if (!clearEconomy && !clearLevels) return;

			// Writing member settings creates the record, so skip users who never had one
			const exists = await this.db.rm.members.count({ guildId, userId: user.id });
			if (!exists) return;

			const reset: Partial<Member> = {};

			if (clearEconomy) {
				reset.bal = economy.defaultBalance ?? 0;
				reset.inventory = [];
				reset.badges = [];
			}

			if (clearLevels) {
				reset.exp = 0;
			}

			await this.db.setMemberSettings(guildId, user.id, reset);
			logger.debug(`Cleared member data on leave -> ${guildId}:${user.id}`);
		} catch (error) {
			logger.error(`Failed to clear member data for ${user.id} in guild ${guildId}`);
			logger.trace(error);
		}
	}
}
