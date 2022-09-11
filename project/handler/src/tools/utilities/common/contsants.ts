import { GatewayDispatchEvents } from "discord-api-types/v10";

export const Constants = {
	GatewayGroup: "gateway",
	DiscordGroup: "discord",
	GatewayEvents: [
		GatewayDispatchEvents.Ready,
		GatewayDispatchEvents.GuildCreate,
		GatewayDispatchEvents.GuildDelete,
		GatewayDispatchEvents.GuildUpdate,
		GatewayDispatchEvents.InteractionCreate,
		GatewayDispatchEvents.MessageCreate,
	],
	PostgresOptions: {
		host: process.env.POSTGRES_HOST ?? "localhost",
	},
	RedisURL: process.env.REDIS_URL ?? "localhost",
};
