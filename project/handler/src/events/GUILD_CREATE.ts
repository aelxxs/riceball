import { logger } from "@riceball/logger";
import type { APIGuild } from "discord-api-types/v10";
import type Redis from "ioredis";
import { Deps } from "library/common";
import { Event } from "library/core";
import { inject, injectable } from "tsyringe";

@injectable()
export default class implements Event {
	private readonly redis: Redis;

	public constructor(@inject(Deps.Redis) redis: Redis) {
		this.redis = redis;
	}

	public async exec(guild: APIGuild) {
		await this.redis.set(`API:guild:${guild.id}`, JSON.stringify(guild));
		logger.debug(`Cached Guild -> ${guild.id}`);
	}
}
