import { APIGuild, APIInteraction, APIInteractionGuildMember, APIUser } from "discord-api-types/v10";

export interface Context {
	i: APIInteraction;
	t: (key: string, ...args: any[]) => string;
	guild: APIGuild;
	author: APIUser;
	member: APIInteractionGuildMember;
}
