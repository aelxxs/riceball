import type { APICommandAutocompleteInteractionResponseCallbackData } from "discord-api-types/v10";
import type { MaybePromise, MessagePayload } from "../api/interactions";
import type { Context } from "./Context";

export interface Command {
	chatInputRun?(ctx: Context, args: unknown): MaybePromise<void> | MaybePromise<MessagePayload>;
	userInputRun?(ctx: Context, args: unknown): MaybePromise<unknown>;

	messageInputRun?(ctx: Context, args: unknown): MaybePromise<unknown>;
	autocompleteRun?(
		ctx: Context,
		args: unknown,
	): MaybePromise<void> | MaybePromise<APICommandAutocompleteInteractionResponseCallbackData>;
}
