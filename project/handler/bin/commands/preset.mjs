import { ApplicationCommandOptionType, ApplicationCommandType } from "discord-api-types/v10";

export default {
	name: "preset",
	type: ApplicationCommandType.ChatInput,
	description: "View and configure the Presets plugin",
	dm_permission: false,
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "list",
			description: "List all of your saved presets",
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "delete",
			description: "Delete an existing preset",
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "name",
					description: "The name of the preset",
					autocomplete: true,
					required: true,
				},
			],
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "create",
			description: "Create a new preset",
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "name",
					description: "The name of the preset",
					required: true,
				},
			],
		},
	],
};
