import type { REST } from "@discordjs/rest";
import { logger } from "@riceball/logger";
import {
	type APIApplicationCommandAutocompleteInteraction,
	InteractionResponseType,
	Routes,
} from "discord-api-types/v10";
import { Deps } from "library/common";
import type { Command } from "library/core";
import { container } from "tsyringe";
import { createContext } from "./create-context";
import { getCommandName, transformInteraction } from "./utils";

export async function runAutocomplete(interaction: APIApplicationCommandAutocompleteInteraction) {
	const plugins = container.resolve<Map<string, Command>>(Deps.Plugins);
	const discord = container.resolve<REST>(Deps.Rest);

	const name = getCommandName(interaction);
	const command = plugins.get(name);

	if (!command) {
		logger.warn(`Attempted to run unknown command "${name}"`);
		return;
	}

	const runner = Reflect.get(command, "autocompleteRun") as Command["autocompleteRun"] | undefined;

	if (!runner) {
		logger.warn(`"autocompleteRun" not defined for command "${name}"`);
		return;
	}

	const options = transformInteraction(interaction);
	const context = await createContext(interaction);

	try {
		// @ts-ignore - I don't feel like casting this
		const output = await runner(context, options);

		if (output === undefined || output === null) {
			return;
		}

		return discord.post(Routes.interactionCallback(interaction.id, interaction.token), {
			body: {
				type: InteractionResponseType.ApplicationCommandAutocompleteResult,
				data: {
					choices: output,
				},
			},
		});
	} catch (error) {}
}
