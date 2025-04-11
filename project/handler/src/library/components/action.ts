import { type APIActionRowComponent, type APIMessageActionRowComponent, ComponentType } from "discord-api-types/v10";
import { makeUniqueID } from "library/core";

type ActionRowOptions = Omit<APIActionRowComponent<APIMessageActionRowComponent>, "type"> & {
	command: string;
	context?: string;
};

export function actionRow(options: ActionRowOptions): APIActionRowComponent<APIMessageActionRowComponent> {
	let { command, context, components } = options;

	components = components.map((component) => {
		if ("custom_id" in component && component.custom_id) {
			component.custom_id = makeUniqueID(command, component.custom_id, context ?? "");
		}
		return component;
	});

	return {
		type: ComponentType.ActionRow,
		components,
	};
}
