import { DebugMessages, Deps, ErrorMessages } from "@lib/common";
import { modal, update, type Command, type Component } from "@lib/core";
import { logger } from "@riceball/logger";
import type { APIMessageComponentInteraction, APIModalSubmitInteraction } from "discord-api-types/v10";
import { container } from "tsyringe";
import { parseUniqueID } from "../options/parse-unique-id";
import { createContext } from "./create-context";

export async function runComponent(interaction: APIMessageComponentInteraction | APIModalSubmitInteraction) {
	const plugins = container.resolve<Map<string, Command>>(Deps.Plugins);

	const customId = interaction.data.custom_id;
	const { name, method, state } = parseUniqueID(customId);

	if (!name || !method) {
		return logger.debug(ErrorMessages.InvalidComponentId(customId));
	}

	const command = plugins.get(name);

	if (!command) {
		return logger.debug(ErrorMessages.InvalidComponentCommand(name));
	}

	const runner = Reflect.get(command, method) as Component | undefined;

	if (runner === undefined) {
		return logger.debug(ErrorMessages.InvalidComponentMethod(name, method));
	} else if (typeof runner !== "function") {
		return logger.debug(ErrorMessages.InvalidComponentMethodType(name, method));
	}

	const context = await createContext(interaction);
	const options = "values" in interaction.data ? [...interaction.data.values, state] : [state];

	logger.debug(DebugMessages.RunningComponent(name, method));
	const startTime = performance.now();

	try {
		const output = await runner(context, options as unknown as string);

		if (output) {
			if (output.type === "modal") {
				return modal(interaction, output.data);
			}
			console.log("updating interaction");
			return update(interaction, output);
		}
	} catch (error) {
		logger.trace(error);
		logger.error(ErrorMessages.ComponentExecutionFailure(name, method));
	} finally {
		const executionTime = performance.now() - startTime;
		logger.debug(DebugMessages.ComponentRan(name, method, executionTime));
	}
}
