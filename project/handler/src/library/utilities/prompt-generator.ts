import { logger } from "@riceball/logger";
import type { APIEmbed, Snowflake } from "discord-api-types/v10";
import { Constants } from "library/common";
import type { MessagePayload } from "library/core";
import { type Context, editMessage } from "library/core";
import { prompt, Validators } from "./prompt";

export interface PromptStep<T = any> {
	content: MessagePayload;
	validator: (input: string) => { success: boolean; value?: T; error?: string };
	onRetry?: (attempt: number, error: string) => MessagePayload;
	timeout?: number;
	retries?: number;
}

export interface PromptStepOptions {
	content: MessagePayload;
	onRetry?: (attempt: number, error: string) => MessagePayload;
	timeout?: number;
	retries?: number;
}

/**
 * Default retry message formatter
 */
const defaultRetryMessage = (attempt: number, error: string) =>
	`${Constants.Emoji.Error} ${error}\n\nPlease try again (${attempt}/3)`;

/**
 * Helper to create a string prompt step
 */
export function promptString(options: PromptStepOptions): PromptStep<string> {
	return {
		...options,
		onRetry: options.onRetry ?? defaultRetryMessage,
		validator: (input: string) => ({ success: true, value: input }),
	};
}

/**
 * Helper to create a number prompt step
 */
export function promptNumber(options: PromptStepOptions): PromptStep<number> {
	return {
		...options,
		onRetry: options.onRetry ?? defaultRetryMessage,
		validator: Validators.number,
	};
}

/**
 * Helper to create a number or unlimited prompt step
 */
export function promptNumberOrUnlimited(options: PromptStepOptions): PromptStep<number> {
	return {
		...options,
		onRetry: options.onRetry ?? defaultRetryMessage,
		validator: Validators.numberOrUnlimited,
	};
}

/**
 * Helper to create a boolean prompt step
 */
export function promptBoolean(options: PromptStepOptions): PromptStep<boolean> {
	return {
		...options,
		onRetry: options.onRetry ?? defaultRetryMessage,
		validator: Validators.boolean,
	};
}

/**
 * Helper to create an optional string prompt step
 */
export function promptOptional(
	options: PromptStepOptions & {
		validator?: (input: string) => { success: boolean; value?: string; error?: string };
	},
): PromptStep<string | undefined> {
	return {
		...options,
		onRetry: options.onRetry ?? defaultRetryMessage,
		validator: Validators.optional(options.validator || ((input: string) => ({ success: true, value: input }))),
	};
}

/**
 * Helper to create a custom typed prompt step
 */
export function promptCustom<T>(
	options: PromptStepOptions & {
		validator: (input: string) => { success: boolean; value?: T; error?: string };
	},
): PromptStep<T> {
	return {
		...options,
		onRetry: options.onRetry ?? defaultRetryMessage,
	};
}

export interface PromptGeneratorOptions {
	userId: Snowflake;
	channelId: Snowflake;
	guildId: Snowflake;
	messageId: Snowflake;
	embed: APIEmbed;
	onFieldAdd?: (field: { name: string; value: string; inline?: boolean }) => void;
}

/**
 * Run a generator-based prompt flow
 *
 * Example usage:
 * ```ts
 * async *promptFlow() {
 *   const name = yield {
 *     content: "What's the name?",
 *     validator: (input) => ({ success: true, value: input }),
 *     onRetry: (attempt, error) => `Error: ${error}. Try again (${attempt}/3)`
 *   };
 *
 *   const price = yield {
 *     content: "What's the price?",
 *     validator: Validators.number,
 *     onRetry: (attempt, error) => `Error: ${error}. Try again (${attempt}/3)`
 *   };
 *
 *   return { name, price };
 * }
 *
 * const result = await runPromptGenerator(promptFlow(), options);
 * ```
 */
export async function runPromptGenerator<T>(
	generator: AsyncGenerator<PromptStep, T, any>,
	options: PromptGeneratorOptions,
): Promise<T | null> {
	const { userId, channelId, guildId, messageId, embed } = options;

	try {
		let step = await generator.next();

		while (!step.done) {
			const promptStep = step.value;

			// Update the message with the current step's content
			if (typeof promptStep.content === "string") {
				await editMessage(channelId, messageId, {
					content: promptStep.content,
					embeds: [embed],
					components: [],
				});
			} else {
				await editMessage(channelId, messageId, promptStep.content);
			}

			// Run the prompt
			const result = await prompt({
				userId,
				channelId,
				guildId,
				timeout: promptStep.timeout || 60000,
				retries: promptStep.retries || 3,
				validator: promptStep.validator,
				onRetry: promptStep.onRetry,
			});

			// Handle cancellation or failure
			if (!result.success) {
				if (result.error === "cancelled") {
					await editMessage(channelId, messageId, {
						content: `${Constants.Emoji.Error} Operation cancelled.`,
						embeds: [],
						components: [],
					});
					return null;
				}

				await editMessage(channelId, messageId, {
					content: `${Constants.Emoji.Error} ${result.error}`,
					embeds: [],
					components: [],
				});
				return null;
			}

			// Pass the result to the generator and get the next step
			step = await generator.next(result.value);
		}

		// Generator finished successfully
		return step.value;
	} catch (error) {
		logger.error("Prompt generator error:", error);
		await editMessage(channelId, messageId, {
			content: `${Constants.Emoji.Error} An error occurred: ${error}`,
			embeds: [],
			components: [],
		});
		return null;
	}
}

/**
 * Simplified prompt runner that extracts context from the interaction
 *
 * Example usage:
 * ```ts
 * const result = await runPrompts(ctx, async function* () {
 *   const name = yield promptString({ content: "What's the name?" });
 *   const price = yield promptNumber({ content: "What's the price?" });
 *   return { name, price };
 * });
 * ```
 */
export async function runPrompts<T>(
	ctx: Context,
	generatorFn: () => AsyncGenerator<PromptStep, T, any>,
	embed?: APIEmbed,
): Promise<T | null> {
	const { i } = ctx;
	const channelId = i.channel!.id;
	const userId = i.user?.id ?? i.member!.user.id;
	const guildId = i.guild_id!;
	const messageId = i.message!.id;

	const defaultEmbed: APIEmbed = embed ?? {
		title: "Prompt",
		description: "Please answer the questions below",
		fields: [],
		footer: {
			text: "Type 'cancel' to abort",
		},
		color: 0x5865f2,
	};

	return runPromptGenerator(generatorFn(), {
		userId,
		channelId,
		guildId,
		messageId,
		embed: defaultEmbed,
	});
}
