import { APIApplicationCommandInteraction } from "discord-api-types/v10";
import { getGuild } from "../../api/guilds";
import { Context } from "../../structure";

export async function createContext(interaction: APIApplicationCommandInteraction): Promise<Context> {
	const guild = await getGuild(interaction.guild_id!);

	interaction.member!.guild_id = guild.id;

	return {
		i: interaction,
		guild,
		member: interaction.member!,
		user: interaction.member!.user,
		t: (s: string) => s,
	};
}
