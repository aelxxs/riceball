import { Injectors, logger } from "@lib/util";
import type { APIGuild } from "discord-api-types/v10";
import type Redis from "ioredis";
import { inject, injectable } from "tsyringe";

@injectable()
export default class implements Action {
	public constructor(@inject(Injectors.Redis) public redis: Redis) {}

	public async exec(guild: APIGuild) {
		await this.redis.del(`API:guild:${guild.id}`);
		logger.debug(`Deleted Cached Guild -> ${guild.id}`);
	}
}
