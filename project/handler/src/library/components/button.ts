import { type APIButtonComponent, type APIMessageComponentEmoji, ButtonStyle } from "discord-api-types/v10";

export function button(options: ButtonOptions): APIButtonComponent {
	const { method, label, style = ButtonStyle.Secondary, disabled = false, url = "", emoji } = options;

	return {
		type: 2,
		label,
		style: url ? ButtonStyle.Link : style,
		disabled,
		url,
		emoji,
		custom_id: url ? "" : method instanceof Function ? method.name : method,
	};
}

interface ButtonOptions {
	// name of method or a function
	method?: string | ((...args: unknown[]) => unknown);
	label: string;
	style?: ButtonStyle;
	disabled?: boolean;
	url?: string;
	emoji?: APIMessageComponentEmoji;
}
