import "dotenv/config";

import { formatEmoji } from "@discordjs/formatters";
import { GatewayDispatchEvents, type Snowflake } from "discord-api-types/v10";
import ms from "ms";

enum WebsiteDispatchEvents {
	ReactionRoleAdd = "REACTION_ROLE_ADD",
	SendMessage = "SEND_MESSAGE",
}

export const Constants = {
	GatewayGroup: process.env.GATEWAY_GROUP ?? "gateway",
	WebsiteGroup: process.env.WEBSITE_GROUP ?? "website",
	Intents: [],
	GatewayEvents: [
		GatewayDispatchEvents.GuildCreate,
		GatewayDispatchEvents.GuildDelete,
		GatewayDispatchEvents.GuildUpdate,
		GatewayDispatchEvents.GuildMemberAdd,
		GatewayDispatchEvents.GuildMemberRemove,
		GatewayDispatchEvents.InteractionCreate,
		GatewayDispatchEvents.MessageCreate,
		GatewayDispatchEvents.MessageDeleteBulk,
		GatewayDispatchEvents.MessageDelete,
		GatewayDispatchEvents.MessageReactionAdd,
		GatewayDispatchEvents.MessageReactionRemove,
		GatewayDispatchEvents.MessageReactionRemoveEmoji,
		GatewayDispatchEvents.MessageReactionRemoveAll,
		GatewayDispatchEvents.MessageUpdate,
	],
	WebsiteEvents: [
		//
		WebsiteDispatchEvents.ReactionRoleAdd,
		WebsiteDispatchEvents.SendMessage,
	],
	MongoURL: process.env.MONGO_URL ?? "mongodb://localhost:27017",
	RedisURL: process.env.REDIS_URL ?? "localhost",
	SupportURL: process.env.SUPPORT_SERVER_URL ?? "https://discord.gg/AuWCjAb",
	Emoji: {
		Disabled: formatEmoji("1337095456727236640"),
		Enabled: formatEmoji("1337095458232729692"),
		Success: formatEmoji("1337095460128690286"),
		Error: formatEmoji("1337095459235172465"),
		Dice: {
			1: formatEmoji("724289280687734839"),
			2: formatEmoji("724289296957177866"),
			3: formatEmoji("724289311800950867"),
			4: formatEmoji("724289325885554698"),
			5: formatEmoji("724289338430455848"),
			6: formatEmoji("725440439640915999"),
		} as Record<1 | 2 | 3 | 4 | 5 | 6, string>,
	},
	Slots: {
		Symbols: ["🍒", "🍌", "🍉", "🍓", "🍎", "🍇", "🍐", "💎"],
		WeightedSymbols: [
			...Array(21).fill("🍒"),
			...Array(18).fill("🍌"),
			...Array(15).fill("🍉"),
			...Array(12).fill("🍓"),
			...Array(9).fill("🍎"),
			...Array(6).fill("🍇"),
			...Array(3).fill("🍐"),
			...Array(1).fill("💎"),
		],
		Paytable: {
			"🍒": { 2: 0.5, 3: 2 },
			"🍌": { 2: 0.5, 3: 2 },
			"🍉": { 2: 1, 3: 3 },
			"🍓": { 2: 1, 3: 4 },
			"🍎": { 2: 1.5, 3: 5 },
			"🍇": { 2: 1.5, 3: 6 },
			"🍐": { 2: 2, 3: 10 },
			"💎": { 2: 10, 3: 50 },
		} as Record<string, Record<2 | 3, number>>,
	},
	EmptyWhitespace: "‎" as const,
};

export const CacheKeys = {
	TextExpCooldown: (guildId: Snowflake, userId: Snowflake) => `text-exp-cooldown:${guildId}:${userId}` as const,
};

export const ErrorMessages = {
	InvalidComponentId: (customId: string) => `Attempted to run component with invalid unique ID: ${customId}`,
	InvalidComponentCommand: (commandName: string) =>
		`Attempted to run component from an unknown command: ${commandName}`,
	InvalidComponentMethod: (commandName: string, method: string) =>
		`Attempted to run an unknown component from command ${commandName}: ${method}`,
	InvalidComponentMethodType: (commandName: string, method: string) =>
		`Attempted to run non-function component from command ${commandName}: ${method}`,
	ComponentExecutionFailure: (name: string, method: string) => `Error while executing component ${name}:${method}`,
	InvalidInteractionType: (type: number) => `Invalid interaction type: ${type}`,
	UnknownCommand: (name: string) => `Attempted to run unknown command: ${name}`,
	CommandRunFailure: (name: string) => `Error while running command: ${name}`,
	ErrorDeferringCommand: (name: string) => `Error while deferring command: ${name}`,
	CommandChatInputRunNotDefined: (name: string) => `Command "${name}" does not define "chatInputRun"`,
	AutocompleteRunNotDefined: (name: string) => `Command "${name}" does not define "autocompleteRun"`,
	AutocompleteRunFailure: (name: string) => `Error while running autocomplete: ${name}`,
};

export const DebugMessages = {
	RunningComponent: (commandName: string, method: string) => `Running component ${commandName}:${method}`,
	ComponentRan: (commandName: string, method: string, executionTime: number) =>
		`Component ${commandName}:${method} ran in ${ms(executionTime, { long: false })}`,
	RunningCommand: (name: string) => `Running command "${name}"`,
	DeferingCommand: (name: string) => `Command "${name}" took too long to execute, deferring`,
	CommandRan: (name: string, executionTime: number) =>
		`Command "${name}" ran in ${ms(executionTime, { long: false })}`,
};
