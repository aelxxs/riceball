import { ApplicationCommandOptionType, ApplicationCommandType } from "discord-api-types/v10";

export default {
	name: "stars",
	type: ApplicationCommandType.ChatInput,
	description: "Presets Plugin",
	dm_permission: false,
	default_member_permissions: "0",
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "config",
			description: "View your server's Starboard settings",
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "channel",
			description: "Configure where starred messages should be sent to",
			options: [
				{
					type: ApplicationCommandOptionType.Channel,
					name: "channel",
					description: "The channel to send starred messages to",
					required: true,
					channel_types: 0,
				},
			],
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "emoji",
			description: "Create a preset",
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "name",
					description: "The name of the preset",
					required: true,
				},
			],
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "threshold",
			description: "Configure the amount of reactions required for a message to be posted to the starboard",
			options: [
				{
					type: ApplicationCommandOptionType.Integer,
					name: "threshold",
					description: "A number between 1 and Infinity",
					min_value: 1,
				},
			],
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: "blacklist",
			description: "Add or remove roles, users, and channels from the Starboard blacklist",
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "role",
					description: "Add or remove a role from the Starboard blacklist",
					options: [
						{
							type: ApplicationCommandOptionType.Role,
							name: "role",
							description: "The role to blacklist",
							required: true,
						},
					],
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "user",
					description: "Add or remove a user from the Starboard blacklist",
					options: [
						{
							type: ApplicationCommandOptionType.User,
							name: "user",
							description: "The user to blacklist",
							required: true,
						},
					],
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "channel",
					description: "Add or remove a channel from the Starboard blacklist",
					options: [
						{
							type: ApplicationCommandOptionType.Channel,
							name: "channel",
							description: "The channel to blacklist",
							channel_types: 0,
							required: true,
						},
					],
				},
			],
		},
	],
};
