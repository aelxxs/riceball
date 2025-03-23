import { ApplicationCommandOptionType, ApplicationCommandType } from "discord-api-types/v10";

export default {
	name: "balance",
	type: ApplicationCommandType.ChatInput,
	description: "View your or another user's balance",
	options: [
		{
			name: "user",
			type: ApplicationCommandOptionType.User,
			description: "A user in this server",
		},
	],
};
