import { makeUniqueID } from "@lib/core";
import {
	APIActionRowComponent,
	APIActionRowComponentTypes,
	APIMessageActionRowComponent,
	ButtonStyle,
	ComponentType,
} from "discord-api-types/v10";

export function actionRow(options: any): APIActionRowComponent<APIActionRowComponentTypes> {
	const { command, context, components } = options;

	const transformedComponents = components.map((component) => {
		// @ts-ignore - This is a custom id
		component.custom_id = makeUniqueID(command, component.custom_id, context ?? "");

		if (component.type === ComponentType.Button && component.style === ButtonStyle.Link) {
			// @ts-ignore - This is a custom id
			delete component?.custom_id;
		}

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
	components: any[];
}
