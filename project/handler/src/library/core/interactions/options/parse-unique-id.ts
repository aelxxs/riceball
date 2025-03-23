export function parseUniqueID(id: string) {
	const [, name = null, options = ""] = id.match(/^([^:]+):(.+)$/) ?? [];

	const [method = null, state = null] = options.split("|");

	return { name, method, state };
}

export function makeUniqueID(command: string, method: string, state = "") {
	return `${command}:${method}${state && `|${state}`}`;
}
