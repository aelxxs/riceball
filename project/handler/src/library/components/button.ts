import { type APIButtonComponent, ButtonStyle } from "discord-api-types/v10";

export function button(options: ButtonOptions): APIButtonComponent {
	const { method, label } = options;

	return {
		type: 2,
		label,
		style: ButtonStyle.Primary,
		custom_id: method,
	};
}

interface ButtonOptions {
	method: string;
	label: string;
}
