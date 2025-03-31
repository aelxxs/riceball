import { logger } from "@riceball/logger";
import type { Client } from "@spectacles/proxy";
import {
	type APIChannel,
	type APIGuild,
	type APIMessage,
	type APIUser,
	Routes,
	type Snowflake,
} from "discord-api-types/v10";
import type { Redis } from "ioredis";
import { Deps } from "library/common";
import { container, inject, injectable } from "tsyringe";

const CacheKeys = {
	ApiGuild: "API:guild",
	ApiChannel: "API:channel",
	ApiMessage: "API:message",
} as const;

@injectable()
export class API {
	private readonly proxy: Client;
	public readonly redis: Redis;

	public constructor(@inject(Deps.Rest) proxy: Client, @inject(Deps.Redis) redis: Redis) {
		this.proxy = proxy;
		this.redis = redis;
	}

	@cache(CacheKeys.ApiGuild)
	public async getGuild(id: Snowflake) {
		return this.makeGetRequest<APIGuild>(Routes.guild(id));
	}

	@cache(CacheKeys.ApiChannel)
	public async getChannel(id: Snowflake) {
		return this.makeGetRequest<APIChannel>(Routes.channel(id));
	}

	@cache(CacheKeys.ApiMessage)
	public async getMessage(channel: Snowflake, message: Snowflake) {
		return this.makeGetRequest<APIMessage>(Routes.channelMessage(channel, message));
	}

	private async makeGetRequest<T = unknown>(route: string): Promise<T> {
		try {
			return (await this.proxy.get(route)) as Promise<T>;
		} catch (error) {
			this.handleError(error, route, "GET");
			throw error;
		}
	}

	private handleError(error: unknown, route: string, method: "GET") {
		if (error instanceof Error) {
			logger.error(`Failed to make GET request to ${route}: ${error.message}`);
		} else {
			logger.trace(error);
			logger.error(`Failed to make GET request to ${route}`);
		}
	}
}

function cache(key: (typeof CacheKeys)[keyof typeof CacheKeys]) {
	return (target: API, propertyKey: string, descriptor: PropertyDescriptor) => {
		const original = descriptor.value;

		descriptor.value = async function (...args: unknown[]) {
			const instance = this as API;
			if (!instance.redis) {
				throw new Error(
					"Cache decorator can only be used on methods of the API class which has a redis property",
				);
			}

			const cached = await instance.redis.get(`${key}:${args[0]}`);

			if (cached) {
				logger.debug(`${propertyKey}: cache hit`);
				return JSON.parse(cached);
			}

			const result = await original.apply(this, args);
			await instance.redis.set(`${key}:${args[0]}`, JSON.stringify(result));
			await instance.redis.expire(`${key}:${args[0]}`, 60 * 60 * 24); // 24 hours

			return result;
		};

		return descriptor;
	};
}

export async function getGuild(id: Snowflake): Promise<APIGuild> {
	const redis = container.resolve<Redis>(Deps.Redis);
	const rest = container.resolve<Client>(Deps.Rest);

	const cached = await redis.get(`API:guild:${id}`);

	if (cached) {
		logger.debug("getGuild: cache hit");
		return JSON.parse(cached) as APIGuild;
	}

	const guild = await rest.get(Routes.guild(id));
	await redis.set(`API:guild:${id}`, JSON.stringify(guild));

	return guild as APIGuild;
}

export async function getChannel(id: Snowflake) {
	const redis = container.resolve<Redis>(Deps.Redis);
	const rest = container.resolve<Client>(Deps.Rest);

	const cached = await redis.get(`API:channel:${id}`);

	if (cached) {
		logger.debug("getChannel: cache hit");
		return JSON.parse(cached) as APIChannel;
	}

	const channel = await rest.get(Routes.channel(id));
	await redis.set(`API:channel:${id}`, JSON.stringify(channel));

	return channel as APIChannel;
}

export async function getMessage(channel: Snowflake, message: Snowflake) {
	const redis = container.resolve<Redis>(Deps.Redis);
	const rest = container.resolve<Client>(Deps.Rest);

	const cached = await redis.get(`API:message:${channel}:${message}`);

	if (cached) {
		logger.debug("getMessage: cache hit");
		return JSON.parse(cached) as APIMessage;
	}

	const msg = await rest.get(Routes.channelMessage(channel, message));
	await redis.set(`API:message:${channel}:${message}`, JSON.stringify(msg));

	return msg as APIMessage;
}

export function getGuildIcon(guild: APIGuild) {
	if (!guild.icon) return undefined;

	return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`;
}

export function getUserAvatar(user: APIUser) {
	if (!user.avatar) return `https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator) % 5}.webp?size=512`;

	return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=512`;
}
