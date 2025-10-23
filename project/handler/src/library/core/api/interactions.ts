import { type RawFile, REST } from "@discordjs/rest";
import type Client from "@spectacles/proxy";
import {
	type APIApplicationCommandInteraction,
	type APIEmbed,
	type APIInteraction,
	type APIInteractionResponseCallbackData,
	type APIMessage,
	type APIModalInteractionResponseCallbackData,
	InteractionResponseType,
	MessageFlags,
	Routes,
	type Snowflake,
} from "discord-api-types/v10";
import { Constants, Deps } from "library/common";
import { container } from "tsyringe";

export type MessagePayload =
	| string
	| APIModalInteractionResponseCallbackData
	| APIInteractionResponseCallbackData
	| APIEmbed;

// | (APIInteractionResponseCallbackData & { files?: RawFile[] });

type TransformContentOptions = {
	prefix?: "error" | "success" | string | null;
	suffix?: string;
	embedded?: boolean;
	ephemeral?: boolean;
	resetComponents?: boolean;
};

export type MaybePromise<T> = T | Promise<T>;

/**
 * Determines if the provided object is an APIEmbed.
 *
 * @param obj - The object to check.
 * @returns True if the object is an APIEmbed, otherwise false.
 */
function isEmbed(obj: unknown): obj is APIEmbed {
	return typeof obj === "object" && obj !== null && "description" in obj;
}

/**
 * Determines if the provided object is a string.
 *
 * @param obj - The object to check.
 * @returns True if the object is a string, otherwise false.
 */
function isString(obj: unknown): obj is string {
	return typeof obj === "string";
}

/**
 * Checks if the given object is of type `APIInteractionResponseCallbackData`.
 *
 * This function determines if the object has any of the properties `embeds`, `content`, or `components`.
 *
 * @param obj - The object to check.
 * @returns `true` if the object is of type `APIInteractionResponseCallbackData`, otherwise `false`.
 */
function isInteractionResponseCallbackData(obj: unknown): obj is APIInteractionResponseCallbackData {
	return typeof obj === "object" && obj !== null && ("embeds" in obj || "content" in obj || "components" in obj);
}

/**
 * Transforms the given payload into an API interaction response callback data.
 *
 * @param payload - The message payload to transform. It can be a string, an embed, or an interaction response callback data.
 * @param options - Optional settings to customize the transformation.
 * @param options.prefix - A prefix to determine the type of message (e.g., "success", "error"). Default is "success".
 * @param options.embedded - Whether to embed the content in an embed object. Default is true.
 * @param options.ephemeral - Whether the message should be ephemeral. Default is false.
 * @param options.suffix - A suffix to append to the message content. Default is an empty string.
 * @returns The transformed API interaction response callback data.
 */
const transformContent = (payload: MessagePayload, options: TransformContentOptions = {}) => {
	const { prefix = "success", embedded = true, ephemeral = false, suffix = "", resetComponents = false } = options;

	const color = prefix === "error" ? 16276837 : 9042682;
	const emoji =
		prefix === "error" ? Constants.Emoji.Error : prefix === "success" ? Constants.Emoji.Success : prefix || "";

	const flags = ephemeral || prefix === "error" ? MessageFlags.Ephemeral : undefined;

	const addPrefixAndSuffix = (text?: string) => `${emoji} ${text}${suffix}`.trim();

	if (isString(payload)) {
		const content = addPrefixAndSuffix(payload);
		return embedded ? { embeds: [{ color, description: content }], flags } : { content, flags };
	}

	if (isEmbed(payload)) {
		const embed: APIEmbed = {
			...payload,
			color,
		};
		return { embeds: [embed], flags };
	}

	if (isInteractionResponseCallbackData(payload)) {
		if (payload.embeds) {
			payload.embeds = payload.embeds.map((embed) => ({
				...embed,
				color,
			}));
		}

		if (resetComponents) {
			payload.components = [];
		}

		return payload;
	}

	return { embeds: [{ color, description: "Unknown error" }], flags };
};

/**
 * Sends a reply to a given interaction.
 *
 * @param interaction - The interaction to reply to.
 * @param content - The content of the message to send.
 * @param options - Optional transformation options for the content.
 * @returns A promise that resolves when the reply has been sent.
 */
export const reply = (interaction: APIInteraction, content: MessagePayload, options: TransformContentOptions = {}) => {
	const rest = container.resolve<Client>(Deps.Rest);
	const transformedContent = transformContent(content, options);

	return rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
		type: InteractionResponseType.ChannelMessageWithSource,
		...transformedContent,
	});
};

/**
 * Updates an interaction with new content.
 *
 * @param interaction - The interaction to update.
 * @param content - The new content to send in the interaction.
 * @param options - Optional transformation options for the content.
 * @returns A promise that resolves when the interaction has been updated.
 */
export const update = (interaction: APIInteraction, content: MessagePayload, options: TransformContentOptions = {}) => {
	const rest = container.resolve<Client>(Deps.Rest);
	const transformedContent = transformContent(content, {
		...options,
		ephemeral: true,
	});

	return rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
		type: InteractionResponseType.UpdateMessage,
		data: transformedContent,
	});
};

/**
 * Edits an existing interaction message with the provided content and options.
 *
 * @param interaction - The interaction object containing details about the command interaction.
 * @param content - The new content to update the interaction message with.
 * @param options - Optional transformation options to apply to the content.
 * @returns A promise that resolves with the response from the REST API.
 */
export const edit = (interaction: APIInteraction, content: MessagePayload, options: TransformContentOptions = {}) => {
	// const rest = container.resolve<Client>(Deps.Rest);

	const rest = new REST().setToken(process.env.DISCORD_TOKEN as string);
	const transformedContent = transformContent(content, {
		...options,
		ephemeral: true,
	});

	// @ts-expect-error
	const files = transformedContent.files;

	return rest.patch(Routes.webhookMessage(interaction.application_id, interaction.token), {
		...transformedContent,
		files,
		body: {
			...transformedContent,
			files,
		},
	});
};

/**
 * Defers the response to an interaction by sending a deferred message response.
 * This is useful when you need more time to process the interaction and want to acknowledge it immediately.
 *
 * @param interaction - The interaction to defer, which contains the interaction ID and token.
 * @returns A promise that resolves when the deferred response has been sent.
 */
export const defer = (interaction: APIInteraction) => {
	// const rest = container.resolve<Client>(Deps.Rest);

	const rest = new REST().setToken(process.env.DISCORD_TOKEN as string);

	return rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
		body: {
			type: InteractionResponseType.DeferredChannelMessageWithSource,
		},
	});
};

/**
 * Sends a modal interaction response.
 *
 * @param interaction - The interaction object containing the command interaction details.
 * @param content - The message payload to be transformed and sent in the response.
 * @param options - Optional transformation options for the content.
 * @returns A promise that resolves to the response of the REST API call.
 */
export const modal = (interaction: APIInteraction, content: MessagePayload, options: TransformContentOptions = {}) => {
	const rest = container.resolve<Client>(Deps.Rest);
	const transformedContent = transformContent(content, options);

	return rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
		type: InteractionResponseType.Modal,
		data: transformedContent,
	});
};

/**
 * Sends a message in response to an interaction.
 *
 * @param interaction - The interaction object containing details about the command.
 * @param content - The message payload to be sent.
 * @param options - Optional transformation options for the content.
 * @returns A promise that resolves to the response of the REST API call.
 */
export const send = (
	interactionOrId: APIApplicationCommandInteraction | Snowflake,
	content: MessagePayload,
	options: TransformContentOptions = {},
) => {
	const rest = container.resolve<Client>(Deps.Rest);
	const transformedContent = transformContent(content, options);

	const destination = typeof interactionOrId === "string" ? interactionOrId : interactionOrId.channel_id;

	return rest.post(Routes.channelMessages(destination), {
		...transformedContent,
	}) as Promise<APIMessage>;
};

export function sendMessage(
	guildId: Snowflake,
	channelId: Snowflake,
	messageId: Snowflake,
	content: MessagePayload,
	options?: TransformContentOptions,
): Promise<APIMessage>;

export function sendMessage(
	interactionOrChannelId: APIApplicationCommandInteraction | Snowflake,
	content: MessagePayload,
	options?: TransformContentOptions,
): Promise<APIMessage>;

export function sendMessage(
	guildOrInteractionId: Snowflake | APIApplicationCommandInteraction,
	channelOrContent: Snowflake | MessagePayload,
	messageOrContent?: Snowflake | MessagePayload | TransformContentOptions,
	contentOrOptions?: MessagePayload | TransformContentOptions,
	maybeOptions?: TransformContentOptions,
): Promise<APIMessage> {
	const rest = container.resolve<Client>(Deps.Rest);

	let destination: Snowflake;
	let content: MessagePayload;
	let options: TransformContentOptions = {};
	let messageReference:
		| {
				guild_id: Snowflake;
				channel_id: Snowflake;
				message_id: Snowflake;
				fail_if_not_exists: boolean;
		  }
		| undefined;

	// Handle different call signatures
	if (
		typeof guildOrInteractionId === "string"
		&& typeof channelOrContent === "string"
		&& typeof messageOrContent === "string"
	) {
		// Guild ID, Channel ID, and Message ID provided
		destination = channelOrContent;
		content = contentOrOptions as MessagePayload;
		options = maybeOptions || {};
		messageReference = {
			guild_id: guildOrInteractionId,
			channel_id: channelOrContent,
			message_id: messageOrContent,
			fail_if_not_exists: false,
		};
	} else {
		// Original interaction/channel ID logic
		destination = typeof guildOrInteractionId === "string" ? guildOrInteractionId : guildOrInteractionId.channel_id;

		content = channelOrContent as MessagePayload;
		options = (messageOrContent as TransformContentOptions) || {};
	}

	const transformedContent = transformContent(content, options);
	if (messageReference) {
		// @ts-expect-error
		transformedContent.message_reference = messageReference;
	}

	return rest.post(Routes.channelMessages(destination), {
		...transformedContent,
	}) as Promise<APIMessage>;
}

export const editMessage = (
	channelId: Snowflake,
	messageId: Snowflake,
	content: MessagePayload,
	options: TransformContentOptions = {},
) => {
	const rest = container.resolve<Client>(Deps.Rest);
	const transformedContent = transformContent(content, options);

	return rest.patch(Routes.channelMessage(channelId, messageId), {
		...transformedContent,
	}) as Promise<APIMessage>;
};

export const deleteMessage = (channelId: Snowflake, messageId: Snowflake) => {
	const rest = container.resolve<REST>(Deps.Rest);

	return rest.delete(Routes.channelMessage(channelId, messageId));
};
