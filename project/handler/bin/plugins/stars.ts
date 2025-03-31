import { ApplicationCommandOptionType, ApplicationCommandType, PermissionFlagsBits } from "discord-api-types/v10";

export default {
	name: "stars",
	type: ApplicationCommandType.ChatInput,
	description: "Presets Plugin",
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "settings",
			description: "View your server's Starboard settings",
		},
		{
			name: "enable",
			description: "Enable the Starboard for your server",
			type: ApplicationCommandOptionType.Subcommand,
		},
		{
			name: "disable",
			description: "Disable the Starboard for your server",
			type: ApplicationCommandOptionType.Subcommand,
		},
		{
			name: "channel",
			description: "Configure where starred messages should be sent to",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "channel",
					description: "The channel to send starred messages to",
					type: ApplicationCommandOptionType.Channel,
					required: true,
					channel_types: [0],
				},
			],
		},
		{
			name: "emoji",
			description: "Configure the emoji used to star messages",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "emoji",
					description: "The emoji to use to star messages",
					type: ApplicationCommandOptionType.String,
					required: true,
				},
			],
		},
		{
			name: "threshold",
			description: "Configure the amount of reactions required for a message to be posted to the starboard",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "threshold",
					description: "The amount of reactions required for a message to be posted to the starboard",
					type: ApplicationCommandOptionType.Integer,
					required: true,
					min_value: 1,
				},
			],
		},
		{
			name: "reset",
			description: "Reset your server's Starboard settings",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "key",
					description: "The setting to reset",
					type: ApplicationCommandOptionType.String,
					choices: [
						{ name: "settings", value: "settings" },
						{ name: "channel", value: "channel" },
						{ name: "emoji", value: "emoji" },
						{ name: "threshold", value: "threshold" },
					],
				},
			],
		},
	],
};
