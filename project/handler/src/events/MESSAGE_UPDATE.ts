import { logger } from "@riceball/logger";
import type { GatewayMessageUpdateDispatchData } from "discord-api-types/v10";
import type { Redis } from "ioredis";
import { Deps } from "library/common";
import type { Event } from "library/core";
import { inject, injectable } from "tsyringe";

@injectable()
export default class implements Event {
	private readonly redis: Redis;

	public constructor(@inject(Deps.Redis) redis: Redis) {
		this.redis = redis;
	}

	public async exec(event: GatewayMessageUpdateDispatchData) {
		const exists = await this.redis.exists(`API:message:${event.id}`);

		if (exists) {
			await this.redis.set(`API:message:${event.id}`, JSON.stringify(event));
			logger.debug(`Updated Cached Message -> ${event.id}`);
		}
	}
}
