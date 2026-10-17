import { ApplicationCommandOptionType, ApplicationCommandType } from "discord-api-types/v10";

export default {
	type: ApplicationCommandType.ChatInput,
	name: "help",
	description: "View Rice Ball's commands",
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: "command",
			description: "A command to view the subcommands and options of",
			autocomplete: true,
		},
	],
};
