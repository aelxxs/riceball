import { Injectors, logger } from "@lib/util";
import { opendir } from "fs/promises";
import { basename, dirname, join } from "path";
import { container } from "tsyringe";
import { fileURLToPath } from "url";

export async function* walk(path: string): AsyncIterableIterator<string> {
	for await (const item of await opendir(path)) {
		const entry = join(path, item.name);

		if (item.isDirectory()) yield* walk(entry);
		if (item.isFile()) yield entry;
	}
}

async function loadActions(): Promise<[string, Action][]> {
	const actionFiles = walk(join(__dirname, "../../../", "actions"));

	const actions: [string, Action][] = [];

	for await (const file of actionFiles) {
		const action = container.resolve<Action>((await import(file)).default);

		actions.push([basename(file, ".js"), action]);
	}

	return actions;
}

const BRACKET = /\[([^}]*)\]/g;

async function loadPlugins(): Promise<[string, Command][]> {
	const pluginFiles = walk(join(__dirname, "../../../", "plugins"));

	const plugins: [string, Command][] = [];

	for await (const file of pluginFiles) {
		try {
			const pluginFile = container.resolve<Command>((await import(file)).default);

			const directory = dirname(file);

			let root = basename(directory);
			let name = basename(file, ".js");

			root = BRACKET.test(root) ? `${basename(dirname(directory))}/${root}` : root;
			name = name === "index" ? root : name;
			root = root.replace(BRACKET, (_, args) => args);
			name = name.replace(BRACKET, (_, args) => `${root}/${args}`);

			plugins.push([name, pluginFile]);
		} catch {
			console.log({ file });
			logger.error("An error occured");
		}
	}

	return plugins;
}

export async function load() {
	const actions = new Map(await loadActions());
	const plugins = new Map(await loadPlugins());

	container.register(Injectors.Actions, {
		useValue: actions,
	});
	container.register(Injectors.Plugins, {
		useValue: plugins,
	});

	return { actions, plugins };
}
