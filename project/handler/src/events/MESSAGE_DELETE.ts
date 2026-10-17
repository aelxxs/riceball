import type { GatewayMessageDeleteDispatchData } from "discord-api-types/v10";
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

	public async exec(event: GatewayMessageDeleteDispatchData) {
		this.reactionRoles.scheduleCleanup(event.guild_id, [event.id]);

		// const exists = await this.redis.exists(`API:message:${event.id}`);
		// if (exists) {
		// 	await this.redis.del(`API:message:${event.id}`);
		// 	logger.debug(`Deleted Cached Message -> ${event.id}`);
		// }
	}
}
