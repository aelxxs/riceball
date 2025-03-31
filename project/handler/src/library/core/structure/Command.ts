import type { APIApplicationCommandOptionChoice } from "discord-api-types/v10";
import type { MessagePayload } from "../api/interactions";
import type { Context } from "./Context";

export interface Command {
	chatInputRun?(
		ctx: Context,
		args: unknown,
	): Partial<MessagePayload> | Promise<MessagePayload> | void | Promise<void>;
	userInputRun?(ctx: Context, args: unknown): unknown | Promise<unknown>;

	messageInputRun?(ctx: Context, args: unknown): unknown | Promise<unknown>;
	autocompleteRun?(ctx: Context, args: unknown): void | Promise<void> | Promise<APIApplicationCommandOptionChoice[]>;
}
