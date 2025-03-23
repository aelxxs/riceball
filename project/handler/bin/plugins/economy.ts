import { ApplicationCommandOptionType, ApplicationCommandType } from "discord-api-types/v10";

export default {
	name: "economy",
	type: ApplicationCommandType.ChatInput,
	description: "View and configure the Economy plugin",
	dm_permission: false,
	default_member_permissions: "0",
	options: [
		{
			name: "settings",
			type: ApplicationCommandOptionType.Subcommand,
			description: "View your server's Economy settings",
		},
		{
			name: "enable",
			type: ApplicationCommandOptionType.Subcommand,
			description: "Enable the economy plugin",
		},
		{
			name: "disable",
			type: ApplicationCommandOptionType.Subcommand,
			description: "Disable the economy plugin",
		},
		{
			name: "currency",
			type: ApplicationCommandOptionType.SubcommandGroup,
			description: "Configure your server's currency",
			options: [
				{
					name: "name",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Set the name of your server's currency",
					options: [
						{
							name: "name",
							type: ApplicationCommandOptionType.String,
							description: "The name of your server's currency",
							required: true,
						},
					],
				},
				{
					name: "icon",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Set the icon of your server's currency",
					options: [
						{
							name: "icon",
							type: ApplicationCommandOptionType.String,
							description: "The icon of your server's currency",
							required: true,
						},
					],
				},
			],
		},
		{
			name: "wager",
			type: ApplicationCommandOptionType.SubcommandGroup,
			description: "Configure your server's wager system",
			options: [
				{
					name: "min",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Set the minimum wager amount",
					options: [
						{
							name: "amount",
							type: ApplicationCommandOptionType.Integer,
							description: "The minimum wager amount",
							required: true,
							min_value: 1,
						},
					],
				},
				{
					name: "max",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Set the maximum wager amount",
					options: [
						{
							name: "amount",
							type: ApplicationCommandOptionType.Integer,
							description: "The maximum wager amount",
							required: true,
							min_value: 1,
						},
					],
				},
			],
		},
		{
			name: "daily",
			type: ApplicationCommandOptionType.SubcommandGroup,
			description: "Configure your server's daily system",
			options: [
				{
					name: "min",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Set the minimum daily amount",
					options: [
						{
							name: "amount",
							type: ApplicationCommandOptionType.Integer,
							description: "The minimum daily amount",
							required: true,
							min_value: 1,
						},
					],
				},
				{
					name: "max",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Set the maximum daily amount",
					options: [
						{
							name: "amount",
							type: ApplicationCommandOptionType.Integer,
							description: "The maximum daily amount",
							required: true,
						},
					],
				},
				{
					name: "cooldown",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Set the daily cooldown",
					options: [
						{
							name: "cooldown",
							type: ApplicationCommandOptionType.String,
							description: "The daily cooldown",
							required: true,
						},
					],
				},
			],
		},
		{
			name: "shop",
			type: ApplicationCommandOptionType.SubcommandGroup,
			description: "Configure your server's shop",
			options: [
				{
					name: "create",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Create a shop item",
				},
				{
					name: "delete",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Delete a shop item",
					options: [
						{
							name: "item",
							type: ApplicationCommandOptionType.String,
							description: "The shop item to delete",
							required: true,
							autocomplete: true,
						},
					],
				},
				{
					name: "update",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Update a shop item",
				},
				{
					name: "archive",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Archive a shop item",
					options: [
						{
							name: "item",
							type: ApplicationCommandOptionType.String,
							description: "The shop item to archive",
							required: true,
							autocomplete: true,
						},
					],
				},
				{
					name: "unarchive",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Unarchive a shop item",
					options: [
						{
							name: "item",
							type: ApplicationCommandOptionType.String,
							description: "The shop item to unarchive",
							required: true,
							autocomplete: true,
						},
					],
				},
				{
					name: "destroy",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Destroy a shop item",
					options: [
						{
							name: "item",
							type: ApplicationCommandOptionType.String,
							description: "The shop item to destroy",
							required: true,
							autocomplete: true,
						},
					],
				},
				{
					name: "info",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Display information about a shop item",
					options: [
						{
							name: "item",
							type: ApplicationCommandOptionType.String,
							description: "The shop item to display information about",
							required: true,
							autocomplete: true,
						},
					],
				},
			],
		},
		{
			name: "debug",
			type: ApplicationCommandOptionType.Subcommand,
			description: "Display advanced information about your server's shop",
		},
	],
};
