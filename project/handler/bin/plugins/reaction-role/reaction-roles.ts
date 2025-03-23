import { ApplicationCommandType } from "discord-api-types/v10";

export default {
	name: "reaction-roles",
	type: ApplicationCommandType.ChatInput,
	description: "View your server's reaction roles",
	default_member_permissions: "0",
};
