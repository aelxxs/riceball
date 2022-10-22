import { ApplicationCommandOptionType, ApplicationCommandType } from "discord-api-types/v10";

export default {
	name: "card",
	type: ApplicationCommandType.ChatInput,
	description: "Customize your level card",
	dm_permission: false,
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "color",
			description: "Change the color of your level card",
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "color",
					description: "6-digit hexadecimal number",
					min_length: 6,
					max_length: 7,
					required: true,
				},
			],
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "theme",
			description: "Change the theme of your level card",
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "theme",
					description: "6-digit hexadecimal number",
					min_length: 6,
					max_length: 7,
					required: true,
				},
			],
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "background",
			description: "Change the background image of your level card",
			options: [
				{
					type: ApplicationCommandOptionType.Attachment,
					name: "background",
					description: "An image attachment of at least 760x224 px",
					required: true,
				},
			],
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "opacity",
			description: "Change the opacity of your level card",
			options: [
				{
					type: ApplicationCommandOptionType.Number,
					name: "opacity",
					description: "The opacity as a percentage",
					min_value: 0,
					max_value: 100,
					required: true,
				},
			],
		},
	],
};
