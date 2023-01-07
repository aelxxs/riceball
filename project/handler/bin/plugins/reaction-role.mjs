import { ApplicationCommandOptionType, ApplicationCommandType } from "discord-api-types/v10";

export default {
	name: "reaction-role",
	type: ApplicationCommandType.ChatInput,
	description: "Configure reaction roles",
	options: [
		{
			name: "add",
			type: ApplicationCommandOptionType.Subcommand,
			description: "Add a reaction role",
			options: [
				{
					name: "message",
					type: ApplicationCommandOptionType.String,
					description: "The message to add the reaction role to",
					required: true,
				},
				{
					name: "emoji",
					type: ApplicationCommandOptionType.String,
					description: "The emoji to add to the message",
					required: true,
				},
				{
					name: "role",
					type: ApplicationCommandOptionType.Role,
					description: "The role to add to the user",
					required: true,
				},
			],
		},
		{
			name: "remove",
			type: ApplicationCommandOptionType.Subcommand,
			description: "Remove a reaction role",
			options: [
				{
					name: "message",
					type: ApplicationCommandOptionType.String,
					description: "The message to remove the reaction role from",
					required: true,
				},
				{
					name: "emoji",
					type: ApplicationCommandOptionType.String,
					description: "The emoji to remove from the message",
					required: true,
				},
			],
		},
		{
			name: "create",
			type: ApplicationCommandOptionType.Subcommand,
			description: "Create a reaction role message",
		},
		{
			name: "delete",
			type: ApplicationCommandOptionType.Subcommand,
			description: "Delete a reaction role message",
			options: [
				{
					name: "message",
					type: ApplicationCommandOptionType.String,
					description: "The message to delete",
					required: true,
				},
			],
		},
	],
};
