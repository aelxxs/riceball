import "dotenv/config";

import "reflect-metadata";

import { Database, setupDatabase } from "@riceball/db";
import { logger } from "@riceball/logger";
import { Redis } from "@spectacles/brokers";
import { Client } from "@spectacles/proxy";
import RedisClient from "ioredis";
import { Constants, Deps } from "library/common";
import { handle, load } from "library/core";
import { validateEnv } from "library/utilities/validate-env";
import { container } from "tsyringe";

const start = async () => {
	validateEnv();
	const redis = new RedisClient(Constants.RedisURL);

	const gateway = new Redis(Constants.GatewayGroup, redis);
	const discord = new Redis(Constants.DiscordGroup, redis);
	const website = new Redis(Constants.WebsiteGroup, redis);

	website.subscribe(Constants.WebsiteEvents);

	const rest = new Client(discord, process.env.DISCORD_TOKEN as string);

	await gateway.subscribe(Constants.GatewayEvents);

	container.register(Deps.Gateway, { useValue: gateway });
	container.register(Deps.Rest, { useValue: rest });
	container.register(Deps.Redis, { useValue: redis });
	container.register(Database, { useClass: Database });

	await setupDatabase({
		mongoUrl: Constants.MongoURL,
		redisUrl: Constants.RedisURL,
	});
	logger.info("Connected to database");

	const { events, plugins } = await load();

	logger.info(`Registered ${events.size} events`);
	logger.info(`Registered ${plugins.size} commands`);

	void handle();

	return { gateway, discord };
};

const gracefulShutdown = async (gateway: Redis) => {
	process.on("SIGINT", async () => {
		logger.info("Shutting down");
		await gateway.unsubscribe(Constants.GatewayEvents);
		process.exit(0);
	});
};

try {
	logger.info("Starting");
	start().then(async ({ gateway, discord }) => {
		logger.info(`Discord Broker: (redis ${discord.redis.status})`);
		logger.info(`Gateway Broker: (redis ${gateway.redis.status})`);
		logger.info(`Subscribed to ${Constants.GatewayEvents.length} Events`);
		logger.info("Handler Service Started");

		void gracefulShutdown(gateway);
	});
} catch (error) {
	logger.error(`An error occured while starting the Handler Service: ${error}`);
}
