import { logger } from "@riceball/logger";
import type {
	APILabelComponent,
	APIMessageComponentInteraction,
	APIModalSubmitInteraction,
} from "discord-api-types/v10";
import { ComponentType } from "discord-api-types/v10";
import { DebugMessages, Deps, ErrorMessages } from "library/common";
import { type Command, type Component, modal, update } from "library/core";
import { container } from "tsyringe";
import { parseUniqueID } from "../options/parse-unique-id";
import { createContext } from "./create-context";

// Type for modal submission response - extends APILabelComponent with actual values from Discord
interface LabelComponentSubmission extends Omit<APILabelComponent, "id" | "component"> {
	id: number; // Always present in submission
	component: {
		type: number;
		id: number;
		custom_id: string;
		value?: string; // For TextInput
		values?: string[]; // For Select menus
	};
}

function isLabelComponent(component: unknown): component is LabelComponentSubmission {
	return (
		typeof component === "object"
		&& component !== null
		&& "type" in component
		&& component.type === ComponentType.Label
	);
}

function hasModalReturnType(output: unknown): output is { type: "modal"; data: Record<string, unknown> } {
	return (
		typeof output === "object" && output !== null && "type" in output && output.type === "modal" && "data" in output
	);
}

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
	}
	if (typeof runner !== "function") {
		return logger.debug(ErrorMessages.InvalidComponentMethodType(name, method));
	}

	const context = await createContext(interaction);

	// Extract values from interaction data
	let options: (string | null)[] = [state];

	if ("values" in interaction.data) {
		// For select menus and other components with values array
		options = [...interaction.data.values, state];
	} else if ("components" in interaction.data) {
		// For modal submissions with Label components (Components V2)
		const values: string[] = [];

		for (const component of interaction.data.components as unknown as LabelComponentSubmission[]) {
			if (isLabelComponent(component)) {
				const nestedComponent = component.component;
				if (nestedComponent.value !== undefined) {
					values.push(nestedComponent.value);
				} else if (nestedComponent.values !== undefined) {
					// For select menus within labels
					values.push(...nestedComponent.values);
				}
			}
		}

		options = [...values, state];
	}

	logger.debug(DebugMessages.RunningComponent(name, method));
	const startTime = performance.now();

	try {
		const output = await runner(context, ...options.filter((opt): opt is string => opt !== null));

		if (output) {
			if (hasModalReturnType(output)) {
				return modal(interaction, output.data);
			}
			console.log("updating interaction");
			return update(interaction, output);
		}
	} catch (error) {
		logger.trace(error);
		logger.error(ErrorMessages.ComponentExecutionFailure(name, method));

		// Send error message to user
		const errorMessage =
			typeof error === "string"
				? error
				: error instanceof Error
					? error.message
					: "Something went wrong. Please try again.";
		return update(interaction, errorMessage, { prefix: "error", ephemeral: true });
	} finally {
		const executionTime = performance.now() - startTime;
		logger.debug(DebugMessages.ComponentRan(name, method, executionTime));
	}
}
