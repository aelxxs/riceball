import { ApplicationCommandOptionType, ApplicationCommandType } from "discord-api-types/v10";

export default {
	name: "chohan",
	type: ApplicationCommandType.ChatInput,
	description: "Play a game of chohan",
	options: [
		{
			name: "wager",
			type: ApplicationCommandOptionType.Integer,
			description: "The amount of money to wager",
			required: true,
			min_value: 1,
		},
		{
			name: "choice",
			type: ApplicationCommandOptionType.String,
			description: "The choice to make",
			required: true,
			choices: [
				{
					name: "Even",
					value: "even",
				},
				{
					name: "Odd",
					value: "odd",
				},
			],
		},
	],
};
