import { APIGuildMember } from "discord-api-types/v10";

export {};

declare module "discord-api-types/v10" {
	export interface APIGuildMember {
		guild_id: Snowflake;
		timeout?: number;
	}
}

declare module "@spectacles/brokers" {
	export interface RedisResponseOptions {
		ack(): Promise<void>;
	}
}

declare module "@types/node-emoji" {
	export interface Emoji {
		emoji: string;
		key: string;
	}

	export function find(emoji: string): Emoji | null;
}
