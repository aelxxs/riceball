import { Injectors } from "@lib/common";
import { reply, send } from "@lib/core";
import { Command } from "@lib/core/structure";
import { logger } from "@lib/util";
import { ApplicationCommandType, type APIApplicationCommandInteraction } from "discord-api-types/v10";
import { container } from "tsyringe";
import { createContext } from "./create-context";
import { getCommandName, transformInteraction } from "./utils";

export async function runCommand(interaction: APIApplicationCommandInteraction) {
	const plugins = container.resolve<Map<string, Command>>(Injectors.Plugins);

	const name = getCommandName(interaction);
	const command = plugins.get(name);

	if (!command) {
		logger.warn(`Attempted to run unknown command "${name}"`);
		return;
	}

	switch (interaction.data.type) {
		case ApplicationCommandType.ChatInput: {
			if (!command.chatInputRun) {
				logger.warn(`"chatInputRun" not defined for command "${name}"`);
				return;
			}

			// @ts-ignore - I don't feel like casting this
			const options = transformInteraction(interaction);
			const context = await createContext(interaction);

			try {
				const output = await command.chatInputRun(context, options);

				if (output === undefined || output === null) {
					return;
				}

				return reply(interaction, output);
			} catch (error) {
				if (typeof error === "string") {
					return reply(interaction, error, true);
				}

				logger.error(`Error running command "${name}"`);
				logger.error(error);

				return send(interaction, `An unexpected error occurred while running command \`${name}\`.`, true);
			}
		}
		case ApplicationCommandType.User: {
		}
		case ApplicationCommandType.Message: {
		}
	}
}
