import { Deps } from "@lib/common";
import { Command, Event } from "@lib/core";
import { logger } from "@riceball/logger";
import { opendir } from "fs/promises";
import { basename, dirname, join } from "path";
import { container } from "tsyringe";

export async function* walk(path: string): AsyncIterableIterator<string> {
	for await (const item of await opendir(path)) {
		const entry = join(path, item.name);

		if (item.isDirectory()) yield* walk(entry);
		if (item.isFile()) yield entry;
	}
}

async function loadEvents(): Promise<[string, Event][]> {
	logger.debug("Loading events");
	const eventFiles = walk(join(__dirname, "../../../../", "events"));

	const events: [string, Event][] = [];

	for await (const file of eventFiles) {
		const event = container.resolve<Event>((await import(file)).default);

		events.push([basename(file, ".ts"), event]);
	}

	return events;
}

const BRACKET = /\[([^}]*)\]/g;

async function loadCommands(): Promise<[string, Command][]> {
	logger.debug("Loading commands");
	const commandFiles = walk(join(__dirname, "../../../../", "commands"));

	const commands: [string, Command][] = [];

	for await (const file of commandFiles) {
		if (file.includes("__")) {
			continue;
		}

		try {
			const commandFile = container.resolve<Command>((await import(file)).default);
			const directory = dirname(file);

			let root = basename(directory);
			let name = basename(file, ".ts");

			root = BRACKET.test(root) ? `${basename(dirname(directory))}/${root}` : root;
			name = name === "index" ? root : name;
			root = root.replace(BRACKET, (_, args) => args);
			name = name.replace(BRACKET, (_, args) => `${root}/${args}`);

			commands.push([name, commandFile]);
		} catch (error) {
			logger.error("An error occured while loading a plugin: \n", file);
			logger.error(error);
		}
	}

	return commands;
}

export async function load() {
	const events = new Map(await loadEvents());
	const plugins = new Map(await loadCommands());

	container.register(Deps.Actions, {
		useValue: events,
	});
	container.register(Deps.Plugins, {
		useValue: plugins,
	});

	return { events, plugins };
}
