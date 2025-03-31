import { format, inspect } from "node:util";
import { type Color, gray, green, magenta, red, yellow } from "colorette";

function time() {
	const date = new Date();

	const hh = String(date.getHours()).padStart(2, "0");
	const mm = String(date.getMinutes()).padStart(2, "0");
	const ss = String(date.getSeconds()).padStart(2, "0");

	return `${hh}:${mm}:${ss}`;
}

type Method = "debug" | "error" | "info" | "trace" | "warn";

function log(color: Color, name: string, method: Method, value: unknown, args: readonly unknown[]) {
	const header = `${gray(time())} ${color(name)} ➜  `;
	const formatted = typeof value === "string" ? format(value, ...args) : inspect(value, { colors: true });

	return console[method](
		formatted
			.split("\n")
			.map((line) => `${header + line}`)
			.join("\n"),
	);
}

function make(color: Color, name: string, method: Method) {
	return (value: unknown, ...args: readonly unknown[]) => log(color, name, method, value, args);
}

export const logger = {
	trace: make(gray, "TRACE", "trace"),
	debug: make(magenta, "DEBUG", "debug"),
	info: make(green, "INFO", "info"),
	warn: make(yellow, "WARN ", "warn"),
	error: make(red, "ERROR", "error"),
} as const;
