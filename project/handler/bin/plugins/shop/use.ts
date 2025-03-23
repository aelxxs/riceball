import { ApplicationCommandOptionType, ApplicationCommandType } from "discord-api-types/v10";

export default {
	name: "use",
	type: ApplicationCommandType.ChatInput,
	description: "Use an item from your inventory",
	options: [
		{
			name: "item",
			type: ApplicationCommandOptionType.String,
			description: "The item to use",
			required: true,
			autocomplete: true,
		},
	],
};
