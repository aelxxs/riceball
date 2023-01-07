import { APIApplicationCommandAutocompleteInteraction, Routes, InteractionResponseType } from "discord-api-types/v10";
import { Injectors } from "@lib/common";
import { logger } from "@lib/util";
import { container } from "tsyringe";
import { getCommandName, transformInteraction } from "./utils";
import { Command } from "@lib/core";
import { createContext } from "./create-context";
import { REST } from "@discordjs/rest";

export async function runAutocomplete(interaction: APIApplicationCommandAutocompleteInteraction) {
	const plugins = container.resolve<Map<string, Command>>(Injectors.Plugins);
	const discord = container.resolve<REST>(Injectors.Rest);
	// @ts-ignore - I don't feel like casting this
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

	// @ts-ignore - I don't feel like casting this
	const options = transformInteraction(interaction);
	// @ts-ignore - I don't feel like casting this

	const context = await createContext(interaction);

	console.log("lskjdlfkj");
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
