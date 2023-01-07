import { logger } from "@lib/util";
import { APIMessageComponentInteraction, APIModalSubmitInteraction } from "discord-api-types/v10";
import { container } from "tsyringe";
import { createContext } from "./create-context";
import { Injectors } from "@lib/common";
import { Command, Component } from "@lib/core/structure";
import { parseUniqueID } from "../options/parseUniqueID";

export async function runComponent(interaction: APIMessageComponentInteraction | APIModalSubmitInteraction) {
	const plugins = container.resolve<Map<string, Command>>(Injectors.Plugins);

	const { name, method, state } = parseUniqueID(interaction.data.custom_id);

	if (!name || !method) {
		logger.debug(`Attempted to run component with invalid unique ID: ${interaction.data.custom_id}`);
		return;
	}

	const command = plugins.get(name);

	if (!command) {
		logger.debug(`Attempted to run unknown component from an unkown command: ${name}`);
		return;
	}

	const runner = Reflect.get(command, method) as Component | undefined;

	if (!runner) {
		logger.debug(`Attempted to run unknown component from command ${name}: ${method}`);
		return;
	}

	// @ts-ignore - <3 (temporary)
	const context = await createContext(interaction);
	// @ts-ignore - <3 (temporary)
	const options = interaction.data.values ?? [state];

	try {
		const output = await runner(context, options);

		if (output === undefined || output === null) {
			return;
		}

		// @ts-ignore - <3 (temporary)
		return send(interaction, output);
	} catch (error) {}
}
