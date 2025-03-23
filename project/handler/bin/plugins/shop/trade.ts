import { ApplicationCommandOptionType, ApplicationCommandType } from "discord-api-types/v10";

export default {
	name: "trade",
	type: ApplicationCommandType.ChatInput,
	description: "Trade items with other users",
	options: [
		{
			name: "user",
			type: ApplicationCommandOptionType.User,
			description: "The user to trade with",
			required: true,
		},
		{
			name: "item",
			type: ApplicationCommandOptionType.String,
			description: "The item to trade",
			required: true,
			autocomplete: true,
		},
	],
};
