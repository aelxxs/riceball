import {
	type APIButtonComponent,
	type APIButtonComponentWithCustomId,
	type APIButtonComponentWithURL,
	ButtonStyle,
	ComponentType,
} from "discord-api-types/v10";
import type { Component } from "library/core";

type Button = APIButtonComponentWithCustomId | APIButtonComponentWithURL;

type ButtonOptions = Partial<Button> & {
	method?: Component | string;
};

export function button(options: ButtonOptions): APIButtonComponent {
	if ("url" in options && options.url) {
		return {
			type: ComponentType.Button,
			style: ButtonStyle.Link,
			label: options.label ?? "No Label",
			disabled: options.disabled ?? false,
			url: options.url,
			emoji: options.emoji,
		};
	}

	return {
		type: ComponentType.Button,
		style: options.style && options.style !== ButtonStyle.Link ? options.style : ButtonStyle.Secondary,
		label: options.label ?? "No Label",
		disabled: options.disabled ?? false,
		custom_id: options.method instanceof Function ? options.method.name : (options.method ?? ""),
		emoji: options.emoji,
	};
}
