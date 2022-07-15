import type { ApplicationCommandOptionChoiceData, Client, Guild, GuildMember, User } from "discord.js";

export {};

declare global {
	export interface Context {
		t: (s: string, args?: Record<string, string>) => string;
		client: Client;
		guild: Guild | null;
		user: User;
		member: GuildMember;
	}

	export interface Command {
		readonly name?: string;
		base?: string;
		exec(ctx: Context, args: unknown): unknown | Promise<unknown>;
		feed?(ctx: Context, args: unknown): Promise<ApplicationCommandOptionChoiceData[]>;
	}
}
