import { logger } from "@riceball/logger";
import type { GatewayMessageDeleteBulkDispatchData } from "discord-api-types/v10";
import type Redis from "ioredis";
import { Deps } from "library/common";
import type { Event } from "library/core";
import { ReactionRoles } from "library/plugins/ReactionRoles";
import { inject, injectable } from "tsyringe";

@injectable()
export default class implements Event {
	private readonly redis: Redis;
	private readonly reactionRoles: ReactionRoles;

	public constructor(@inject(Deps.Redis) redis: Redis, @inject(ReactionRoles) reactionRoles: ReactionRoles) {
		this.redis = redis;
		this.reactionRoles = reactionRoles;
	}

	public async exec(event: GatewayMessageDeleteBulkDispatchData) {
		for (const id of event.ids) {
			this.redis.del(`API:message:${id}`);
		}

		logger.debug(`Deleted Cached Messages -> ${event.ids.join(", ")}`);

		this.reactionRoles.scheduleCleanup(event.guild_id, event.ids);
	}
}
