import type { REST } from "@discordjs/rest";
import { logger } from "@riceball/logger";
import {
	type APIApplicationCommandAutocompleteInteraction,
	InteractionResponseType,
	Routes,
} from "discord-api-types/v10";
import { Deps, ErrorMessages } from "library/common";
import type { Command } from "library/core";
import { container } from "tsyringe";
import { createContext } from "./create-context";
import { getCommandName, transformInteraction } from "./utils";

export async function runAutocomplete(interaction: APIApplicationCommandAutocompleteInteraction) {
	const plugins = container.resolve<Map<string, Command>>(Deps.Plugins);
	const discord = container.resolve<REST>(Deps.Rest);

	const commandName = getCommandName(interaction);
	const commandFile = plugins.get(commandName);

	if (!commandFile) {
		return logger.warn(ErrorMessages.UnknownCommand(commandName));
	}

	if (!commandFile.autocompleteRun) {
		return logger.warn(ErrorMessages.AutocompleteRunNotDefined(commandName));
	}

	const options = transformInteraction(interaction);
	const context = await createContext(interaction);

	try {
		const output = await commandFile.autocompleteRun(context, options);

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
	} catch (error) {
		logger.error(ErrorMessages.AutocompleteRunFailure(commandName));
		logger.trace(error);
	}
}
