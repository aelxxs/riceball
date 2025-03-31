import { isGuildInteraction } from "discord-api-types/utils/v10";
import type { APIInteraction } from "discord-api-types/v10";
import { type Context, getGuild } from "library/core";

/**
 * Creates a context object for a given interaction.
 *
 * @param interaction - The interaction to create the context for.
 * @returns A promise that resolves to a Context object.
 * @throws Will throw an error if the interaction does not have a guild_id or member.
 */
export async function createContext(interaction: APIInteraction): Promise<Context> {
	if (!isGuildInteraction(interaction)) {
		throw new Error("Interaction does not have guild_id or member");
	}

	const guild = await getGuild(interaction.guild_id);

	// TODO: Implement translation function
	const translation = (key: string, ...args: unknown[]) => {
		return key; // i18n.t(key, ...args);
	};

	return {
		i: interaction,
		t: translation,
		guild,
		member: interaction.member,
		author: interaction.member.user,
	};
}
