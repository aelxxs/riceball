import { ApplicationCommandOptionType, ApplicationCommandType } from "discord-api-types/v10";

export default {
	name: "buy",
	type: ApplicationCommandType.ChatInput,
	description: "Buy an item from the shop",
	options: [
		{
			name: "item",
			description: "The item to buy",
			type: ApplicationCommandOptionType.String,
			required: true,
			autocomplete: true,
		},
	],
};
