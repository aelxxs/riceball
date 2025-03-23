import { ApplicationCommandOptionType, ApplicationCommandType } from "discord-api-types/v10";

export default {
	name: "coinflip",
	type: ApplicationCommandType.ChatInput,
	description: "Flip a coin",
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
					name: "Heads",
					value: "heads",
				},
				{
					name: "Tails",
					value: "tails",
				},
			],
		},
	],
};
