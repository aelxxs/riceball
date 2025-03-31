import { logger } from "@riceball/logger";
import { isChatInputApplicationCommandInteraction } from "discord-api-types/utils/v10";
import type { APIApplicationCommandInteraction } from "discord-api-types/v10";
import { DebugMessages, Deps, ErrorMessages } from "library/common";
import { type Command, defer, edit } from "library/core";
import { container } from "tsyringe";
import { createContext } from "./create-context";
import { getCommandName, transformInteraction } from "./utils";

/**
 * Executes a command based on the provided interaction.
 *
 * @param interaction - The interaction object representing the command invocation.
 * @returns A promise that resolves when the command execution is complete.
 */
export async function runCommand(interaction: APIApplicationCommandInteraction) {
	if (!isChatInputApplicationCommandInteraction(interaction)) return;

	const plugins = container.resolve<Map<string, Command>>(Deps.Plugins);

	const commandName = getCommandName(interaction);
	const commandFile = plugins.get(commandName);

	if (!commandFile) {
		return logger.debug(ErrorMessages.UnknownCommand(commandName));
	}

	if (!commandFile.chatInputRun) {
		return logger.debug(ErrorMessages.CommandChatInputRunNotDefined(commandName));
	}

	await defer(interaction);

	const context = await createContext(interaction);
	const options = transformInteraction(interaction);

	logger.debug(DebugMessages.RunningCommand(commandName));

	const startTime = performance.now();
	try {
		const output = await commandFile.chatInputRun(context, options);

		if (output) {
			return edit(interaction, output);
		}
	} catch (error) {
		if (typeof error === "string") {
			return edit(interaction, error, { prefix: "error" });
		}

		logger.error(ErrorMessages.CommandRunFailure(commandName));
		logger.trace(error);

		return edit(interaction, ErrorMessages.CommandRunFailure(commandName), {
			prefix: "error",
			ephemeral: true,
		});
	} finally {
		const executionTime = performance.now() - startTime;
		logger.debug(DebugMessages.CommandRan(commandName, executionTime));
	}
}
