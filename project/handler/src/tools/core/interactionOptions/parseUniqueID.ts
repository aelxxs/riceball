export function parseUniqueID(id: string) {
	const [, command = null, options = ""] = id.match(/^([^:]+):(.+)$/) ?? [];

	const [method = null, state = null] = options.split("|");

	return { command, method, state };
}

export function makeUniqueID(command: string, method: string, state?: string) {
	return `${command}:${method}${state && `|${state}`}`;
}
