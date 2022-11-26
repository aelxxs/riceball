import { ApplicationCommandOptionType, ApplicationCommandType } from "discord-api-types/v10";

export default {
	name: "badge",
	type: ApplicationCommandType.ChatInput,
	description: "View and configure your badges",
	dm_permission: false,
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "list",
			description: "List all of your badges",
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "equip",
			description: "Equip a badge to your level card",
			options: [
				{
					type: ApplicationCommandOptionType.Number,
					name: "slot",
					description: "The slot of the preset",
					required: true,
					min_value: 1,
					max_value: 6,
				},
				{
					type: ApplicationCommandOptionType.String,
					name: "name",
					description: "The name of the badge",
					autocomplete: true,
					required: true,
				},
			],
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "clear",
			description: "Unequip a badge from your level card",
			options: [
				{
					type: ApplicationCommandOptionType.Number,
					name: "slot",
					description: "The badge slot to clear",
					required: true,
					min_value: 1,
					max_value: 6,
				},
			],
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "reset",
			description: "Unequip all badges from your level card",
		},
	],
};
