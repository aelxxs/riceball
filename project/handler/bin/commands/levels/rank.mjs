import { ApplicationCommandOptionType, ApplicationCommandType } from "discord-api-types/v10";

export default {
	type: ApplicationCommandType.ChatInput,
	name: "rank",
	description: "View your or another user rank",
	options: [
		{
			type: ApplicationCommandOptionType.User,
			name: "user",
			description: "A user in this server.",
		},
	],
	dm_permission: false,
};
