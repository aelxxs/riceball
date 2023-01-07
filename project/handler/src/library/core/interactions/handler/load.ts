import { opendir } from "fs/promises";
import { Injectors } from "@lib/common";
import { Command, Event } from "@lib/core";
import { logger } from "@lib/util";
import { basename, dirname, join } from "path";
import { container } from "tsyringe";

export async function* walk(path: string): AsyncIterableIterator<string> {
	for await (const item of await opendir(path)) {
		const entry = join(path, item.name);

		if (item.isDirectory()) yield* walk(entry);
		if (item.isFile()) yield entry;
	}
}

async function loadActions(): Promise<[string, Event][]> {
	const actionFiles = walk(join(__dirname, "../../../../", "events"));

	const actions: [string, Event][] = [];

	for await (const file of actionFiles) {
		const action = container.resolve<Event>((await import(file)).default);

		actions.push([basename(file, ".ts"), action]);
	}

	return actions;
}

const BRACKET = /\[([^}]*)\]/g;

async function loadPlugins(): Promise<[string, Command][]> {
	const pluginFiles = walk(join(__dirname, "../../../../", "commands"));

	const plugins: [string, Command][] = [];

	for await (const file of pluginFiles) {
		if (file.includes("__")) {
			continue;
		}

		try {
			const pluginFile = container.resolve<Command>((await import(file)).default);
			const directory = dirname(file);

			let root = basename(directory);
			let name = basename(file, ".ts");

			root = BRACKET.test(root) ? `${basename(dirname(directory))}/${root}` : root;
			name = name === "index" ? root : name;
			root = root.replace(BRACKET, (_, args) => args);
			name = name.replace(BRACKET, (_, args) => `${root}/${args}`);

			plugins.push([name, pluginFile]);
		} catch (error) {
			logger.error("An error occured while loading a plugin: \n", file);
			logger.error(error);
		}
	}

	return plugins;
}

export async function load() {
	const events = new Map(await loadActions());
	const plugins = new Map(await loadPlugins());

	container.register(Injectors.Actions, {
		useValue: events,
	});
	container.register(Injectors.Plugins, {
		useValue: plugins,
	});

	return { events, plugins };
}
