import { ApplicationCommandOptionType, ApplicationCommandType } from "discord-api-types/v10";

export default {
	name: "inventory",
	type: ApplicationCommandType.ChatInput,
	description: "View your or another user's inventory",
	options: [
		{
			name: "user",
			type: ApplicationCommandOptionType.User,
			description: "A user in this server",
		},
	],
};
