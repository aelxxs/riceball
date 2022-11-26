import { ApplicationCommandOptionType, ApplicationCommandType } from "discord-api-types/v10";

export default {
	name: "levels",
	type: ApplicationCommandType.ChatInput,
	description: "View and configure the Levels plugin",
	dm_permission: false,
	default_member_permissions: "0",
	options: [
		{
			name: "config",
			type: ApplicationCommandOptionType.Subcommand,
			description: "View your server's Leveling settings",
		},
		{
			name: "announcement",
			type: ApplicationCommandOptionType.SubcommandGroup,
			description: "Customize the announcment made when a user levels up",
			options: [
				{
					name: "message",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Configure what is sent when a user levels up",
					options: [
						{
							name: "message",
							type: ApplicationCommandOptionType.String,
							description: "The message to send",
							required: true,
						},
					],
				},
				{
					name: "channel",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Configure which channel the announcement message is sent to",
					options: [
						{
							name: "channel",
							type: ApplicationCommandOptionType.Channel,
							description: "The channel to send the message to",
							channel_types: 0,
							required: true,
						},
					],
				},
				{
					name: "disable",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Disable level up announcements",
				},
				{
					name: "enable",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Enable level up announcements",
				},
			],
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: "blacklist",
			description: "Add or remove roles, users, and channels from the Levels blacklist",
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "role",
					description: "Add or remove a role from the Levels blacklist",
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
					description: "Add or remove a user from the Levels blacklist",
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
					description: "Add or remove a channel from the Levels blacklist",
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
