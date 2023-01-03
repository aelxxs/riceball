import { ApplicationCommandOptionType, ApplicationCommandType } from "discord-api-types/v10";

export default {
	name: "badge",
	type: ApplicationCommandType.ChatInput,
	description: "View and configure the Badge plugin",
	options: [
		{
			name: "set",
			type: ApplicationCommandOptionType.Subcommand,
			description: "Set a badge on your level card",
			options: [
				{
					name: "badge",
					type: ApplicationCommandOptionType.String,
					description: "The badge to set",
					required: true,
					autocomplete: true,
				},
				{
					name: "slot",
					type: ApplicationCommandOptionType.Integer,
					description: "The slot to set the badge in",
					required: true,
					min_value: 1,
					max_value: 6,
				},
			],
		},
		{
			name: "clear",
			type: ApplicationCommandOptionType.Subcommand,
			description: "Clear a badge from your level card",
			options: [
				{
					name: "slot",
					type: ApplicationCommandOptionType.Integer,
					description: "The slot to clear the badge from",
					required: true,
					min_value: 1,
					max_value: 6,
				},
			],
		},
		{
			name: "reset",
			type: ApplicationCommandOptionType.Subcommand,
			description: "Clear all badges from your level card",
		},
	],
};
