import {
	APIGuild,
	APIGuildMember,
	APIUser,
	ApplicationCommandOptionChoiceData,
	Snowflake,
} from "discord-api-types/v10";

export {};

declare module "discord-api-types/v10" {
	export interface APIGuildMember {
		guild_id: Snowflake;
	}
}

declare global {
	export interface Context {
		t: (s: string, args?: Record<string, string>) => string;
		guild: APIGuild;
		user: APIUser;
		member: APIGuildMember;
	}

	export interface Command {
		base?: string;
		chatInputRun?(ctx: Context, args: unknown): unknown | Promise<unknown>;
		userInputRun?(ctx: Context, args: unknown): unknown | Promise<unknown>;
		messageInputRun?(ctx: Context, args: unknown): unknown | Promise<unknown>;
		autocompleteRun?(ctx: Context, args: unknown): Promise<ApplicationCommandOptionChoiceData[]>;
	}

	export interface Action {
		exec(...args: unknown[]): unknown | Promise<unknown>;
	}

	export type Component = (ctx: Context, ...args: any) => unknown;
}
