import { REST } from "@discordjs/rest";
import {
	APIApplicationCommandInteraction,
	APIEmbed,
	APIInteractionResponseCallbackData,
	InteractionResponseType,
	MessageFlags,
	Routes,
} from "discord-api-types/v10";
import { Injectors } from "@lib/common";
import { container } from "tsyringe";

export const transformContent = (
	content: string | APIEmbed | APIEmbed[] | APIInteractionResponseCallbackData,
	error = false
) => {
	if (typeof content === "string") {
		return {
			embeds: [
				{
					color: error ? 0xff0000 : 0x00ff00,
					description: content,
				},
			],
		};
	}

	if (Array.isArray(content)) {
		content = content.map((embed) => {
			embed.color = error ? 0xff0000 : 0x00ff00;
			return embed;
		});

		return { embeds: content };
	}

	if (typeof content === "object") {
		return content;
	}
};

export const reply = (
	interaction: APIApplicationCommandInteraction,
	content: string | APIEmbed | APIEmbed[] | APIInteractionResponseCallbackData,
	error = false
) => {
	const rest = container.resolve<REST>(Injectors.Rest);

	void rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
		body: {
			data: {
				...transformContent(content, error),
			},
			type: InteractionResponseType.ChannelMessageWithSource,
			flags: error ? MessageFlags.Ephemeral : undefined,
		},
	});
};

export const edit = (interaction: APIApplicationCommandInteraction, content: any, error = false) => {
	const rest = container.resolve<REST>(Injectors.Rest);

	void rest.patch(Routes.webhookMessage(interaction.application_id, interaction.token), {
		...transformContent(content, error),
		body: {
			...transformContent(content, error),
			flags: error ? MessageFlags.Ephemeral : undefined,
		},
	});
};

export const defer = async (interaction: APIApplicationCommandInteraction) => {
	const rest = container.resolve<REST>(Injectors.Rest);

	return rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
		body: {
			type: InteractionResponseType.DeferredChannelMessageWithSource,
		},
	});
};

export const send = (interaction: APIApplicationCommandInteraction, content: any, error = false) => {
	const rest = container.resolve<REST>(Injectors.Rest);

	void rest.post(Routes.channelMessages(interaction.channel_id), {
		body: {
			...transformContent(content, error),
		},
	});
};
