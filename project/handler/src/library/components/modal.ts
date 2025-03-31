import type { APIActionRowComponent, APIModalActionRowComponent } from "discord-api-types/v10";
import { makeUniqueID } from "library/core";

export function modal(options: ModalOptions) {
	const { command, method, title, context, components } = options;

	const transformedComponents = components.map((component) => {
		// @ts-ignore - This is a custom id
		component.custom_id = makeUniqueID(method, component.custom_id, context ?? "");

		return component;
	});

	return {
		type: "modal",
		data: {
			title,
			custom_id: makeUniqueID(command, typeof method === "function" ? method.name : method, context ?? ""),
			components: transformedComponents,
		},
	};
}

type ModalOptions = {
	command: string;
	method: string | ((...args: unknown[]) => unknown);
	title: string;
	context?: string;
	components: APIActionRowComponent<APIModalActionRowComponent>[];
};
