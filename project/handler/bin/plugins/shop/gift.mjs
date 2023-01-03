import { ApplicationCommandOptionType, ApplicationCommandType } from "discord-api-types/v10";

export default {
	name: "gift",
	type: ApplicationCommandType.ChatInput,
	description: "Gift an item to another user",
	options: [
		{
			name: "item",
			description: "The item to gift",
			type: ApplicationCommandOptionType.String,
			required: true,
			autocomplete: true,
		},
		{
			name: "user",
			description: "The user to gift the item to",
			type: ApplicationCommandOptionType.User,
			required: true,
		},
	],
};
