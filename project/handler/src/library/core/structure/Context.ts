import type { APIGuild, APIInteraction, APIInteractionGuildMember, APIUser } from "discord-api-types/v10";

export interface Context {
	i: APIInteraction;
	t: (key: string, ...args: unknown[]) => string;
	guild: APIGuild;
	author: APIUser;
	member: APIInteractionGuildMember;
}
