import { ApplicationCommandOptionType, ApplicationCommandType } from "discord-api-types/v10";

export default {
	name: "slots",
	type: ApplicationCommandType.ChatInput,
	description: "Play a game of slots",
	options: [
		{
			name: "wager",
			description: "The amount of money you want to wager",
			type: ApplicationCommandOptionType.Integer,
			required: true,
			min_value: 1,
		},
	],
};
