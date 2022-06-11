import type { CommandInteraction } from "discord.js";

export interface Command {
	name?: string;
	exec?: (interaction: CommandInteraction, args: Record<string, string>) => unknown | Promise<unknown>;
}
