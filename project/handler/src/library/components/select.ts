import { APISelectMenuComponent, APIStringSelectComponent, ComponentType } from "discord-api-types/v10";

export function select(args: SelectMenuOptions): APISelectMenuComponent {
	const { method, options, placeholder } = args;

	return {
		type: ComponentType.StringSelect,
		custom_id: method,
		options,
		placeholder,
	};
}

interface SelectMenuOptions {
	method: string;
	options: APIStringSelectComponent["options"];
	placeholder: string;
}
