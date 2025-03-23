import { ApplicationCommandType } from "discord-api-types/v10";

export default {
	type: ApplicationCommandType.ChatInput,
	name: "ping",
	description: "Health check",
};
