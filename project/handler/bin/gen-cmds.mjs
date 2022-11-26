import { ApplicationCommandOptionType, ApplicationCommandType } from "discord-api-types/v10";
import { mkdir, opendir, writeFile } from "fs/promises";
import { basename, dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";

// todo: switch this out for a better solution (TBD)

async function* walk(path) {
	for await (const item of await opendir(path)) {
		const entry = join(path, item.name);

		if (item.isDirectory()) yield* walk(entry);
		if (item.isFile()) yield entry;
	}
}

const SKELETON = [
	"/**",
	" * Author: Alexis Vielma",
	" **/",
	"$IMPORT",
	"export default class implements Command {",
	"	/**",
	"	 * $META",
	"	 *",
	"	 * @param {Context} context",
	"	 * @param {Options} options",
	"	 **/",
	"	public $METHOD({ t }: Context$ARGUMENTS) {",
	'		return "Sorry, this command was registered but not implemented. Please try again later."',
	"	}",
	"}",
	"",
	"$INTERFACE",
	"",
].join("\n");

const __dirname = dirname(fileURLToPath(import.meta.url));

const METADATA_DIR = "commands";
const PLUGIN_DIR = "./src/temp";

const files = walk(join(__dirname, "commands"));

for await (const file of files) {
	const path = pathToFileURL(new URL(file, import.meta.url).href);
	const data = (await import(path)).default;

	if (!data) continue;

	const root = basename(dirname(file));

	if (root !== METADATA_DIR) {
		await mkdir(join(PLUGIN_DIR, root), {
			recursive: true,
		});
	}

	if (data.options) {
		for (const option of data?.options) {
			if (option?.type === ApplicationCommandOptionType.Subcommand) {
				await mkdir(join(PLUGIN_DIR, data.name), {
					recursive: true,
				});

				const dir = join(PLUGIN_DIR, data.name, `[${option.name}].ts`);
				await generate(dir, option);

				continue;
			}

			if (option?.type === ApplicationCommandOptionType.SubcommandGroup) {
				await mkdir(join(PLUGIN_DIR, data.name, `[${option.name}]`), {
					recursive: true,
				});

				for (const subOption of option?.options ?? []) {
					const dir = join(PLUGIN_DIR, data.name, `[${option.name}]`, `[${subOption.name}].ts`);

					await generate(dir, subOption);
				}

				continue;
			}

			const dir = join(PLUGIN_DIR, root === METADATA_DIR ? "" : root, `${data?.name}.ts`);

			generate(dir, data);
		}
	} else {
		const dir = join(PLUGIN_DIR, root === METADATA_DIR ? "" : root, `${data?.name}.ts`);

		generate(dir, data);
	}
}

function generate(location, data) {
	let command = SKELETON;

	const options = data.options ?? [];

	const cmdArguments = createArguments(options);
	const cmdInterface = createInterface(options);
	const cmdImport = createImports(options);
	const cmdMethod = getMethodName(options);

	command = command.replace("$META", data.description);
	command = command.replace("$IMPORT", cmdImport);
	command = command.replace("$METHOD", cmdMethod);
	command = command.replace("$ARGUMENTS", cmdArguments);
	command = command.replace("$INTERFACE", cmdInterface);

	return writeFile(location, command);
}

function createArguments(options) {
	const args = options?.map(({ name }) => name).join(", ");

	return args ? `, { ${args} }: Options` : "";
}

function createInterface(options) {
	const args = options
		?.map((o) => {
			return `/* ? ${o.description} */\n\t${o.name}: ${getOptionType(o.type)};`;
		})
		.join("\n\t");

	return args ? `interface Options {\n\t${args}\n}` : "";
}

function createImports(options) {
	const imports = [];

	for (const option of options) {
		const type = getOptionType(option.type);

		if (type?.includes("API")) {
			imports.push(type);
		}
	}

	return imports.length ? `\nimport { ${imports.join(", ")} } from "discord-api-types/v10";\n` : "";
}

function getMethodName(type) {
	if (type === ApplicationCommandType.ChatInput) {
		return "chatInputRun";
	} else if (type === ApplicationCommandType.User) {
		return "userInputRun";
	} else if (type === ApplicationCommandType.Message) {
		return "messageInputRun";
	}
	return "chatInputRun";
}

function getOptionType(type) {
	return {
		[ApplicationCommandOptionType.User]: "APIUser",
		[ApplicationCommandOptionType.Role]: "APIRole",
		[ApplicationCommandOptionType.Channel]: "APIPartialChannel",
		[ApplicationCommandOptionType.Attachment]: "APIAttachment",
		[ApplicationCommandOptionType.Mentionable]: "APIAttachment",
		[ApplicationCommandOptionType.String]: "string",
		[ApplicationCommandOptionType.Boolean]: "boolean",
		[ApplicationCommandOptionType.Number]: "number",
		[ApplicationCommandOptionType.Integer]: "number",
	}[type];
}
