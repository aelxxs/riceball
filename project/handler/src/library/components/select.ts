import {
	type APISelectMenuComponent,
	type APIStringSelectComponent,
	ChannelType,
	ComponentType,
} from "discord-api-types/v10";
import type { Component } from "library/core";

type SelectType =
	| ComponentType.StringSelect
	| ComponentType.UserSelect
	| ComponentType.ChannelSelect
	| ComponentType.RoleSelect;

export function select(args: SelectMenuOptions): APISelectMenuComponent {
	const { type = ComponentType.StringSelect, method, options, placeholder } = args;

	return {
		channel_types: [ChannelType.GuildText],
		type,
		custom_id: typeof method === "string" ? method : method.name,
		placeholder,
		options: options ?? [],
	};
}

interface SelectMenuOptions {
	type?: SelectType;
	method: Component | string;
	options?: APIStringSelectComponent["options"];
	placeholder: string;
}
