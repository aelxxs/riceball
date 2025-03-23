import "reflect-metadata";

import { Constants, Deps } from "@lib/common";
import { handle, load, send } from "@lib/core";
import { logger } from "@riceball/logger";
import { Redis } from "@spectacles/brokers";
import Client from "@spectacles/proxy";
import { config } from "dotenv";
import RedisClient from "ioredis";
import { container } from "tsyringe";

config({ path: "../../.env" });

const start = async () => {
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

	const { events, plugins } = await load();

	logger.info(`Registered ${events.size} actions`);
	logger.info(`Registered ${plugins.size} plugins`);

	website.on("SEND_MESSAGE", (data) => {
		logger.debug("SEND_MESSAGE");
		console.log(data);

		send(data.channelId, {
			content: "Hello World!",
		});
	});

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
