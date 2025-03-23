import { type APIButtonComponent, ButtonStyle } from "discord-api-types/v10";
import { PartialEmoji } from "discord.js";

export function button(options: ButtonOptions): APIButtonComponent {
	const { method, label, style = ButtonStyle.Secondary, disabled = false, url = "", emoji } = options;

	return {
		type: 2,
		label,
		style,
		disabled,
		url,
		emoji,
		custom_id: url ? "" : method instanceof Function ? method.name : method,
	};
}

interface ButtonOptions {
	// name of method or a function
	method?: string | Function;
	label: string;
	style?: any;
	disabled?: boolean;
	url?: string;
	emoji?: PartialEmoji;
}
