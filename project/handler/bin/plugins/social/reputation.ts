import { ApplicationCommandOptionType, ApplicationCommandType } from "discord-api-types/v10";

export default {
	name: "reputation",
	type: ApplicationCommandType.ChatInput,
	description: "Give a user reputation",
	options: [
		{
			name: "user",
			type: ApplicationCommandOptionType.User,
			description: "A user in this server",
			required: true,
		},
	],
};
