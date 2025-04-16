import {
	type APIApplicationCommand,
	ApplicationCommandOptionType,
	ApplicationCommandType,
} from "discord-api-types/v10";

export default {
	name: "card",
	type: ApplicationCommandType.ChatInput,
	description: "Customize and configure your personal leveling card with various options",
	options: [
		{
			name: "background",
			type: ApplicationCommandOptionType.SubcommandGroup,
			description: "Modify the background settings of your leveling card",
			options: [
				{
					name: "image",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Set a custom background image for your leveling card",
					options: [
						{
							name: "url",
							type: ApplicationCommandOptionType.String,
							description: "Provide the URL of the image to use as the background",
						},
						{
							name: "attachment",
							type: ApplicationCommandOptionType.Attachment,
							description: "Set the image as an attachment instead of a URL",
						},
						{
							name: "reset",
							type: ApplicationCommandOptionType.Boolean,
							description: "Reset the background image to default",
						},
					],
				},
				{
					name: "opacity",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Adjust the blur or transparency of the background image",
					options: [
						{
							name: "value",
							type: ApplicationCommandOptionType.Integer,
							description: "Specify the opacity value (0 for fully transparent, 100 for fully opaque)",
							required: true,
							min_value: 0,
							max_value: 100,
						},
					],
				},
				{
					name: "color",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Set a solid color as the background for your card",
					options: [
						{
							name: "value",
							type: ApplicationCommandOptionType.String,
							description: "Provide the color value (e.g., HEX, RGB, or color name)",
							required: true,
						},
					],
				},
				{
					name: "reset",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Reset the background settings to default",
				},
			],
		},
		{
			name: "overlay",
			type: ApplicationCommandOptionType.SubcommandGroup,
			description: "Customize the overlay settings of your leveling card",
			options: [
				{
					name: "opacity",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Set the transparency level of the overlay layer",
					options: [
						{
							name: "value",
							type: ApplicationCommandOptionType.Integer,
							description: "Specify the opacity value (0 for fully transparent, 100 for fully opaque)",
							required: true,
							min_value: 0,
							max_value: 100,
						},
					],
				},
				{
					name: "color",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Choose a color for the overlay layer of your card",
					options: [
						{
							name: "value",
							type: ApplicationCommandOptionType.String,
							description: "Provide the color value (e.g., HEX, RGB, or color name)",
							required: true,
						},
					],
				},
				{
					name: "reset",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Reset the overlay settings to default",
				},
			],
		},
		{
			name: "accent",
			type: ApplicationCommandOptionType.SubcommandGroup,
			description: "Adjust the accent details of your leveling card",
			options: [
				{
					name: "opacity",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Set the transparency level of the accent elements",
					options: [
						{
							name: "value",
							type: ApplicationCommandOptionType.Integer,
							description: "Specify the opacity value (0 for fully transparent, 100 for fully opaque)",
							required: true,
							min_value: 0,
							max_value: 100,
						},
					],
				},
				{
					name: "color",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Choose a color for the accent elements of your card",
					options: [
						{
							name: "value",
							type: ApplicationCommandOptionType.String,
							description: "Provide the color value (e.g., HEX, RGB, or color name)",
							required: true,
						},
					],
				},
				{
					name: "reset",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Reset the accent settings to default",
				},
			],
		},
		{
			name: "text",
			type: ApplicationCommandOptionType.SubcommandGroup,
			description: "Configure the text appearance on your leveling card",
			options: [
				{
					name: "opacity",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Set the transparency level of the main text",
					options: [
						{
							name: "value",
							type: ApplicationCommandOptionType.Integer,
							description: "Specify the opacity value (0 for fully transparent, 100 for fully opaque)",
							required: true,
							min_value: 0,
							max_value: 100,
						},
					],
				},
				{
					name: "color",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Choose a color for the main text on your card",
					options: [
						{
							name: "value",
							type: ApplicationCommandOptionType.String,
							description: "Provide the color value (e.g., HEX, RGB, or color name)",
							required: true,
						},
					],
				},
				{
					name: "reset",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Reset the text settings to default",
				},
			],
		},
		{
			name: "subtext",
			type: ApplicationCommandOptionType.SubcommandGroup,
			description: "Customize the subtext appearance on your leveling card",
			options: [
				{
					name: "opacity",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Set the transparency level of the subtext",
					options: [
						{
							name: "value",
							type: ApplicationCommandOptionType.Integer,
							description: "Specify the opacity value (0 for fully transparent, 100 for fully opaque)",
							required: true,
							min_value: 0,
							max_value: 100,
						},
					],
				},
				{
					name: "color",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Choose a color for the subtext on your card",
					options: [
						{
							name: "value",
							type: ApplicationCommandOptionType.String,
							description: "Provide the color value (e.g., HEX, RGB, or color name)",
							required: true,
						},
					],
				},
				{
					name: "reset",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Reset the subtext settings to default",
				},
			],
		},
		{
			name: "border",
			type: ApplicationCommandOptionType.SubcommandGroup,
			description: "Configure the border appearance of your leveling card",
			options: [
				{
					name: "radius",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Set the border radius of the card",
					options: [
						{
							name: "value",
							type: ApplicationCommandOptionType.Integer,
							description: "Specify the radius value in pixels",
							required: true,
							min_value: 0,
							max_value: 100,
						},
					],
				},
				{
					name: "reset",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Reset the border settings to default",
				},
			],
		},
		{
			name: "font",
			type: ApplicationCommandOptionType.SubcommandGroup,
			description: "Customize the font style of your leveling card",
			options: [
				{
					name: "family",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Set the font family for the text on your card",
					options: [
						{
							name: "value",
							type: ApplicationCommandOptionType.String,
							description: "Provide the font family name or URL",
							required: true,
							choices: [
								{
									name: "Monospace",
									value: "MONOSPACE",
								},
								{
									name: "Sans-serif",
									value: "SANS_SERIF",
								},
								{
									name: "Serif",
									value: "SERIF",
								},
								{
									name: "Handwriting",
									value: "HANDWRITING",
								},
								{
									name: "Cursive",
									value: "CURSIVE",
								},
							],
						},
					],
				},
				{
					name: "reset",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Reset the font settings to default",
				},
			],
		},
		{
			name: "reset",
			type: ApplicationCommandOptionType.Subcommand,
			description: "Reset all card settings to default",
		},
		{
			name: "progress",
			type: ApplicationCommandOptionType.SubcommandGroup,
			description: "Customize the progress bar appearance on your leveling card",
			options: [
				{
					name: "opacity",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Set the transparency level of the progress bar",
					options: [
						{
							name: "value",
							type: ApplicationCommandOptionType.Integer,
							description: "Specify the opacity value (0 for fully transparent, 100 for fully opaque)",
							required: true,
							min_value: 0,
							max_value: 100,
						},
					],
				},
				{
					name: "color",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Choose a color for the progress bar on your card",
					options: [
						{
							name: "value",
							type: ApplicationCommandOptionType.String,
							description: "Provide the color value (e.g., HEX, RGB, or color name)",
							required: true,
						},
					],
				},
				{
					name: "reset",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Reset the progress bar settings to default",
				},
			],
		},
		{
			name: "presets",
			type: ApplicationCommandOptionType.Subcommand,
			description: "View and apply preset designs for your leveling card",
		},
		{
			name: "preset",
			type: ApplicationCommandOptionType.SubcommandGroup,
			description: "Manage preset designs for your leveling card",
			options: [
				{
					name: "save",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Save your current card design as a preset",
					options: [
						{
							name: "name",
							type: ApplicationCommandOptionType.String,
							description: "Provide a name for your preset",
							required: true,
						},
						{
							name: "description",
							type: ApplicationCommandOptionType.String,
							description: "Provide a description for your preset",
						},
						{
							name: "public",
							type: ApplicationCommandOptionType.Boolean,
							description: "Make the preset public for others to use (default: false)",
						},
					],
				},
				{
					name: "delete",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Delete a saved preset design",
					options: [
						{
							name: "name",
							type: ApplicationCommandOptionType.String,
							description: "Provide the name of the preset to delete",
							required: true,
							autocomplete: true,
						},
					],
				},
				{
					name: "use",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Apply a saved preset design to your card",
					options: [
						{
							name: "name",
							type: ApplicationCommandOptionType.String,
							description: "Provide the name of the preset to apply",
							required: true,
							autocomplete: true,
						},
					],
				},
				{
					name: "preview",
					type: ApplicationCommandOptionType.Subcommand,
					description: "Preview a saved preset design",
					options: [
						{
							name: "name",
							type: ApplicationCommandOptionType.String,
							description: "Provide the name of the preset to preview",
							required: true,
							autocomplete: true,
						},
					],
				},
			],
		},
	],
} as APIApplicationCommand;
