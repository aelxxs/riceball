import {
	APIActionRowComponent,
	APIMessageActionRowComponent,
	ComponentType,
	APIActionRowComponentTypes,
} from "discord-api-types/v10";
import { makeUniqueID } from "@lib/core";

export function actionRow(options: ActionRowOptions): APIActionRowComponent<APIActionRowComponentTypes> {
	const { command, context, components } = options;

	const transformedComponents = components.map((component) => {
		// @ts-ignore - This is a custom id
		component.custom_id = makeUniqueID(command, component.custom_id, context ?? "");

		return component;
	});

	return {
		type: ComponentType.ActionRow,
		components: transformedComponents,
	};
}

interface ActionRowOptions {
	command: string;
	context?: string;
	components: APIMessageActionRowComponent[];
}
