import type {
	APIApplicationCommandOptionChoice,
	APIEmbed,
	APIInteractionResponseCallbackData,
} from "discord-api-types/v10";
import { Context } from "./Context";

export interface Command {
	base?: string;

	chatInputRun?(
		ctx: Context,
		args: unknown
	):
		| any
		| (string | APIEmbed | APIInteractionResponseCallbackData)
		| Promise<string | APIEmbed | APIInteractionResponseCallbackData>;

	userInputRun?(ctx: Context, args: unknown): unknown | Promise<unknown>;

	messageInputRun?(ctx: Context, args: unknown): unknown | Promise<unknown>;
	// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
	autocompleteRun?(ctx: Context, args: unknown): void | Promise<void> | Promise<APIApplicationCommandOptionChoice[]>;
}
