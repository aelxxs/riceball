import "reflect-metadata";
import { config } from "dotenv";

config({ path: "../../.env" });

import { REST } from "@discordjs/rest";
import { handle, load } from "@lib/core";
import { CacheManager } from "@lib/data";
import { Constants, Injectors, logger } from "@lib/util";
import { Redis } from "@spectacles/brokers";
import RedisClient from "ioredis";
import postgres from "postgres";
import { container } from "tsyringe";

const start = async () => {
	const redis = new RedisClient(Constants.RedisURL);
	const query = postgres(Constants.PostgresOptions);

	const gateway = new Redis(Constants.GatewayGroup, redis);
	const discord = new Redis(Constants.DiscordGroup, redis);

	const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

	await gateway.subscribe(Constants.GatewayEvents);

	container.register(Injectors.Gateway, { useValue: gateway });
	container.register(Injectors.SQL, { useValue: query });
	container.register(Injectors.Rest, { useValue: rest });
	container.register(Injectors.Redis, { useValue: redis });
	container.register(Injectors.Cache, { useValue: container.resolve(CacheManager) });

	const { actions, plugins } = await load();

	logger.info(`Registered ${actions.size} actions`);
	logger.info(`Registered ${plugins.size} plugins`);

	void handle();

	return { gateway, discord };
};

try {
	logger.info("Starting");
	start().then(({ gateway, discord }) => {
		logger.info(`Discord Broker: (redis ${discord.redis.status})`);
		logger.info(`Gateway Broker: (redis ${gateway.redis.status})`);
		logger.info(`Subscribed to ${Constants.GatewayEvents.length} Events`);
		logger.info("Handler Service Started");
	});
} catch (error) {
	logger.error(`An error occured while starting the Handler Service: ${error}`);
}
