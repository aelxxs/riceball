import { ApplicationCommandOptionType, ApplicationCommandType } from "discord-api-types/v10";

const sections = [
	{ name: "The Bio Section", value: "showBio" },
	{ name: "The Stats Box", value: "showStatsBox" },
	{ name: "The Stats Bar", value: "showStatsBar" },
	{ name: "The Badges Section", value: "showBadges" },
	{ name: "The Server Icon", value: "showIcon" },
	{ name: "Your Country Flah", value: "showFlag" },
];

export default {
	name: "card",
	type: ApplicationCommandType.ChatInput,
	description: "Configure your leveling card",
	options: [
		{
			name: "show",
			type: ApplicationCommandOptionType.Subcommand,
			description: "Show specific sections of your card",
			options: [
				{
					name: "key",
					type: ApplicationCommandOptionType.String,
					description: "The key of the section you want to show",
					required: true,
					choices: sections,
				},
			],
		},
		{
			name: "hide",
			type: ApplicationCommandOptionType.Subcommand,
			description: "Hide specific sections of your card",
			options: [
				{
					name: "key",
					type: ApplicationCommandOptionType.String,
					description: "The key of the section you want to hide",
					required: true,
					choices: sections,
				},
			],
		},
		{
			name: "opacity",
			type: ApplicationCommandOptionType.SubcommandGroup,
			description: "Set the opacity of various parts of your level card",
			options: [
				{
					name: "primary",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Set the opacity of the primary background",
					options: [
						{
							name: "value",
							type: ApplicationCommandOptionType.Integer,
							description: "The opacity value",
							required: true,
							min_value: 0,
							max_value: 100,
						},
					],
				},
				{
					name: "accent",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Set the opacity of the accent background",
					options: [
						{
							name: "value",
							type: ApplicationCommandOptionType.Integer,
							description: "The opacity value",
							required: true,
							min_value: 0,
							max_value: 100,
						},
					],
				},
				{
					name: "progress",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Set the opacity of the progress bar",
					options: [
						{
							name: "value",
							type: ApplicationCommandOptionType.Integer,
							description: "The opacity value",
							required: true,
							min_value: 0,
							max_value: 100,
						},
					],
				},
			],
		},
		{
			name: "border",
			type: ApplicationCommandOptionType.SubcommandGroup,
			description: "Set the border radius of your card",
			options: [
				{
					name: "radius",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Set the border radius of your card",
					options: [
						{
							name: "value",
							type: ApplicationCommandOptionType.Integer,
							description: "The border radius value",
							required: true,
							min_value: 0,
							max_value: 100,
						},
					],
				},
			],
		},
		{
			name: "color",
			type: ApplicationCommandOptionType.SubcommandGroup,
			description: "Set the color of various parts of your level card",
			options: [
				{
					name: "primary",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Set the color of the primary background",
					options: [
						{
							name: "value",
							type: ApplicationCommandOptionType.String,
							description: "The color value",
							required: true,
						},
					],
				},
				{
					name: "accent",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Set the color of the accent background",
					options: [
						{
							name: "value",
							type: ApplicationCommandOptionType.String,
							description: "The color value",
							required: true,
						},
					],
				},
				{
					name: "progress",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Set the color of the progress bar",
					options: [
						{
							name: "value",
							type: ApplicationCommandOptionType.String,
							description: "The color value",
							required: true,
						},
					],
				},
				{
					name: "text",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Set the color of the text",
					options: [
						{
							name: "value",
							type: ApplicationCommandOptionType.String,
							description: "The color value",
							required: true,
						},
					],
				},
			],
		},
		{
			name: "background",
			type: ApplicationCommandOptionType.SubcommandGroup,
			description: "Configure the background of your card",
			options: [
				{
					name: "image",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Set the background image of your card",
					options: [
						{
							name: "value",
							type: ApplicationCommandOptionType.Attachment,
							description: "The image attachment",
							required: true,
						},
					],
				},
				{
					name: "opacity",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Set the blur of the background image",
					options: [
						{
							name: "value",
							type: ApplicationCommandOptionType.Integer,
							description: "The opacity value",
							required: true,
							min_value: 0,
							max_value: 100,
						},
					],
				},
				{
					name: "color",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Set the color of the background",
					options: [
						{
							name: "value",
							type: ApplicationCommandOptionType.String,
							description: "The color value",
							required: true,
						},
					],
				},
			],
		},
	],
};
