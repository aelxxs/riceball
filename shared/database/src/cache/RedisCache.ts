import { logger } from "@riceball/logger";
import type { Redis } from "ioredis";
import { inject, injectable } from "tsyringe";
import { Deps, EXPIRE } from "../utils/constants.js";

@injectable()
export class RedisCache<T> {
	protected readonly redis: Redis;

	public constructor(@inject(Deps.Redis) redis: Redis) {
		this.redis = redis;
	}

	public async get(key: string): Promise<T | null> {
		const value = await this.redis.get(key);
		if (value) {
			logger.debug(`Cache hit for key: ${key}`);
			return JSON.parse(value) as T;
		}

		logger.debug(`Cache miss for key: ${key}`);
		return null;
	}

	public async set(key: string, value: T): Promise<void> {
		await this.redis.set(key, JSON.stringify(value), "EX", EXPIRE);
	}
}
