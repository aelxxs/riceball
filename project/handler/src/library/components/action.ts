import {
	type APIActionRowComponent,
	type APIActionRowComponentTypes,
	type APIMessageActionRowComponent,
	ButtonStyle,
	ComponentType,
} from "discord-api-types/v10";
import { makeUniqueID } from "library/core";

interface ActionRowOptions {
	command: string;
	context?: string;
	components: APIMessageActionRowComponent[];
}

export function actionRow(options: ActionRowOptions): APIActionRowComponent<APIActionRowComponentTypes> {
	const { command, context, components } = options;

	const transformedComponents = components.map((component) => {
		// @ts-ignore - This is a custom id
		component.custom_id = makeUniqueID(command, component.custom_id, context ?? "");

		if (component.type === ComponentType.Button && component.style === ButtonStyle.Link) {
			// @ts-ignore - This is a custom id
			component.custom_id = undefined;
		}

		return component;
	});

	return {
		type: ComponentType.ActionRow,
		components: transformedComponents,
	};
}
