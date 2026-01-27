import type { APILabelComponent, APIModalInteractionResponseCallbackData } from "discord-api-types/v10";
import { makeUniqueID } from "library/core";

function hasCustomId(obj: unknown): obj is { custom_id: string } {
	return (
		typeof obj === "object"
		&& obj !== null
		&& "custom_id" in obj
		&& typeof (obj as { custom_id: unknown }).custom_id === "string"
	);
}

export function modal(options: ModalOptions): { type: "modal"; data: APIModalInteractionResponseCallbackData } {
	const { command, method, title, context, components } = options;

	// Convert method to string for makeUniqueID
	const methodName = typeof method === "function" ? method.name : method;

	// Don't transform nested component custom_ids - they should remain simple identifiers
	// Only the modal's custom_id needs the full method and context for routing
	return {
		type: "modal",
		data: {
			title,
			custom_id: makeUniqueID(command, methodName, context ?? ""),
			components: components as APIModalInteractionResponseCallbackData["components"],
		},
	};
}

type ModalOptions = {
	command: string;
	method: string | ((...args: unknown[]) => unknown);
	title: string;
	context?: string;
	components: APILabelComponent[];
};
