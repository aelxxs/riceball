import { Database } from "@riceball/db";
import { logger } from "@riceball/logger";
import type { GatewayGuildMemberAddDispatchData } from "discord-api-types/v10";
import type { Event } from "library/core";
import { Levels } from "library/plugins";
import { inject, injectable } from "tsyringe";

@injectable()
export default class implements Event {
	private db: Database;
	private levels: Levels;

	public constructor(@inject(Database) db: Database, @inject(Levels) levels: Levels) {
		this.db = db;
		this.levels = levels;
	}

	public async exec(event: GatewayGuildMemberAddDispatchData) {
		const { guild_id: guildId, user, roles } = event;
		if (!user || user.bot) return;

		try {
			const { levels } = await this.db.getGuildSettings(guildId);
			if (!levels.enabled || !levels.addRolesOnJoin || !levels.rewards?.length) return;

			// Reading member settings creates the record, so skip users who never had one
			const exists = await this.db.rm.members.count({ guildId, userId: user.id });
			if (!exists) return;

			const { exp } = await this.db.getMemberSettings(guildId, user.id);
			if (exp <= 0) return;

			await this.levels.syncRewardRoles(guildId, user.id, roles, levels, this.levels.getLvl(exp));
		} catch (error) {
			logger.error(`Failed to restore reward roles for ${user.id} in guild ${guildId}`);
			logger.trace(error);
		}
	}
}
