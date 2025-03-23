import { ApplicationCommandOptionType, ApplicationCommandType } from "discord-api-types/v10";

export default {
	name: "levels",
	type: ApplicationCommandType.ChatInput,
	description: "View and configure the Levels plugin",
	dm_permission: false,
	default_member_permissions: "0",
	options: [
		{
			name: "enable",
			type: ApplicationCommandOptionType.Subcommand,
			description: "Enable the levels plugin",
		},
		{
			name: "disable",
			type: ApplicationCommandOptionType.Subcommand,
			description: "Disable the levels plugin",
		},
		{
			name: "reward",
			type: ApplicationCommandOptionType.SubcommandGroup,
			description: "Configure your server's leveling rewards",
			options: [
				{
					name: "create",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Add a reward to the leveling rewards list",
					options: [
						{
							name: "level",
							type: ApplicationCommandOptionType.Integer,
							description: "The level to give the reward at",
							required: true,
							min_value: 1,
						},
						{
							name: "reward",
							type: ApplicationCommandOptionType.Role,
							description: "The reward to give",
							required: true,
						},
					],
				},
				{
					name: "delete",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Remove a reward from the leveling rewards list",
					options: [
						{
							name: "level",
							type: ApplicationCommandOptionType.Integer,
							description: "The level to remove the reward from",
							required: true,
							min_value: 1,
							autocomplete: true,
						},
					],
				},
			],
		},
		{
			name: "settings",
			type: ApplicationCommandOptionType.Subcommand,
			description: "View your server's Leveling settings",
		},
		{
			name: "notify",
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
							channel_types: [0],
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
			name: "rate",
			type: ApplicationCommandOptionType.Subcommand,
			description: "Configure the rate at which users gain experience",
			options: [
				{
					name: "type",
					type: ApplicationCommandOptionType.String,
					description: "The type of experience to set the rate for",
					required: true,
					choices: [
						{
							name: "Voice Experience Rate",
							value: "voice",
						},
						{
							name: "Message Experience Rate",
							value: "message",
						},
					],
				},
				{
					name: "rate",
					type: ApplicationCommandOptionType.Integer,
					description: "How much experience to give",
					required: true,
					min_value: 1,
				},
				{
					name: "cooldown",
					type: ApplicationCommandOptionType.Integer,
					description: "How long to wait before giving experience again (in seconds)",
					required: true,
					min_value: 25,
				},
			],
		},
	],
};
