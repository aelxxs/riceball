import { APIApplicationCommandInteraction, APIGuild, APIGuildMember, APIUser } from "discord-api-types/v10";

export interface Context {
	i: APIApplicationCommandInteraction;
	t: (s: string, args?: Record<string, string>) => string;
	guild: APIGuild;
	user: APIUser;
	member: APIGuildMember;
}
