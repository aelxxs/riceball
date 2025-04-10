import { ApplicationCommandOptionType, ApplicationCommandType } from "discord-api-types/v10";

export default {
	type: ApplicationCommandType.ChatInput,
	name: "rank",
	description: "View your or another users rank in this server",
	options: [
		{
			type: ApplicationCommandOptionType.User,
			name: "user",
			description: "A user in this server",
		},
	],
	dm_permission: false,
};
