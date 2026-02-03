import type { APIMessage, Snowflake } from "discord-api-types/v10";
import type { MessagePayload } from "library/core";
import { deleteMessage, send } from "library/core";
import { MessageCollector } from "library/core/collectors/MessageCollector";

export interface PromptOptions {
	userId: Snowflake;
	channelId: Snowflake;
	guildId: Snowflake;
	timeout?: number;
	retries?: number;
	validator?: (input: string) => PromptResult;
	onRetry?: (attempt: number, error: string) => MessagePayload;
	/** Whether to delete the user's input message after validation */
	deleteInput?: boolean;
}

export interface PromptResult {
	value?: unknown;
	error?: string;
	success: boolean;
}

/**
 * Wait for a user to respond in a channel with validation
 */
export async function prompt(options: PromptOptions): Promise<PromptResult> {
	const {
		userId,
		channelId,
		guildId,
		timeout = 60000,
		retries = 3,
		validator = (input: string) => ({ success: true, value: input }),
		onRetry,
		deleteInput = true,
	} = options;

	const collector = new MessageCollector(
		guildId,
		channelId,
		(msg: APIMessage) => msg.author?.id === userId && !msg.author.bot,
		{ timeout },
	);

	return new Promise((resolve) => {
		let attempts = 0;
		let lastErrorMessageId: Snowflake | undefined;

		collector.on("collect", async (message: APIMessage) => {
			const result = validator(message.content);

			if (result.success) {
				// Valid input - cleanup and resolve
				if (deleteInput) {
					setTimeout(() => deleteMessage(message.channel_id, message.id).catch(() => {}), 2000);
				}

				if (lastErrorMessageId) {
					deleteMessage(message.channel_id, lastErrorMessageId).catch(() => {});
				}

				collector.stop("success");
				resolve({ success: true, value: result.value });
			} else {
				// Invalid input
				attempts++;

				if (deleteInput) {
					setTimeout(() => deleteMessage(message.channel_id, message.id).catch(() => {}), 2000);
				}

				if (attempts >= retries) {
					// Max retries exceeded
					if (lastErrorMessageId) {
						deleteMessage(message.channel_id, lastErrorMessageId).catch(() => {});
					}

					collector.stop("maxRetries");
					resolve({ success: false, error: result.error || "Maximum retries exceeded" });
				} else {
					// Send retry message
					if (lastErrorMessageId) {
						deleteMessage(message.channel_id, lastErrorMessageId).catch(() => {});
					}

					if (onRetry) {
						const retryMessage = onRetry(attempts, result.error || "Invalid input");
						const errorMsg = await send(message.channel_id, retryMessage);
						lastErrorMessageId = errorMsg.id;
					}
				}
			}
		});

		collector.on("end", (_collected, reason) => {
			if (reason === "time") {
				if (lastErrorMessageId) {
					deleteMessage(channelId, lastErrorMessageId).catch(() => {});
				}
				resolve({ success: false, error: "Response timeout exceeded" });
			}
		});
	});
}

// Helper functions for validator results
export const PromptResponse = {
	success: <T>(value: T): PromptResult => ({ success: true, value }),
	error: (error: string): PromptResult => ({ success: false, error }),
	cancel: (): PromptResult => ({ success: false, error: "cancelled" }),
};

/**
 * Wraps a validator to automatically handle "cancel" input
 */
export function cancelable<T>(validator: (input: string) => PromptResult): (input: string) => PromptResult {
	return (input: string) => {
		if (input.toLowerCase() === "cancel") {
			return PromptResponse.cancel();
		}
		return validator(input);
	};
}

// Built-in validators
export const Validators = {
	string: (input: string): PromptResult => ({
		success: true,
		value: input,
	}),

	number: (input: string): PromptResult => {
		const match = input.match(/\d+/);
		const num = match ? Number.parseInt(match[0], 10) : NaN;

		if (Number.isNaN(num) || num <= 0) {
			return { success: false, error: `"${input}" is not a valid number greater than 0` };
		}

		return { success: true, value: num };
	},

	numberOrUnlimited: (input: string): PromptResult => {
		const lower = input.toLowerCase().trim();

		if (lower.includes("unlimited") || lower.includes("infinite")) {
			return { success: true, value: -1 };
		}

		return Validators.number(input);
	},

	boolean: (input: string): PromptResult => {
		const lower = input.toLowerCase().trim();

		if (["yes", "y", "true", "1", "on", "enable", "enabled"].includes(lower)) {
			return { success: true, value: true };
		}

		if (["no", "n", "false", "0", "off", "disable", "disabled"].includes(lower)) {
			return { success: true, value: false };
		}

		return { success: false, error: `"${input}" is not a valid yes/no response` };
	},

	optional: (validator: (input: string) => PromptResult) => {
		return (input: string): PromptResult => {
			const lower = input.toLowerCase().trim();

			if (lower === "none" || lower === "skip" || lower === "n/a") {
				return { success: true, value: undefined };
			}

			return validator(input);
		};
	},
};
