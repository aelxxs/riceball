import {
	APIApplicationCommandOption,
	ApplicationCommandOptionType,
	ApplicationCommandType,
} from "discord-api-types/v10";
import { existsSync } from "fs";
import { mkdir, opendir, writeFile } from "fs/promises";
import { basename, dirname, join } from "path";
import { fileURLToPath } from "url";

/**
 * Asynchronously walks through a directory and its subdirectories, yielding file paths.
 *
 * @param {string} path - The path of the directory to walk through.
 * @returns {AsyncGenerator<string>} An async generator that yields file paths.
 */
async function* walk(path: string): AsyncGenerator<string> {
	for await (const item of await opendir(path)) {
		const entry = join(path, item.name);

		if (item.isDirectory()) yield* walk(entry);
		if (item.isFile()) yield entry;
	}
}

const SKELETON = [
	"/**",
	" * This file is part of the Rice Ball (https://github.com/aelxxs/riceball).",
	" * Copyright (c) 2023 Alexis Vielma.",
	" *",
	" * This program is free software: you can redistribute it and/or modify",
	" * it under the terms of the GNU Affero General Public License as published by",
	" * the Free Software Foundation, either version 3 of the License, or",
	" * (at your option) any later version.",
	" *",
	" * This program is distributed in the hope that it will be useful, but",
	" * WITHOUT ANY WARRANTY; without even the implied warranty of",
	" * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU",
	" * General Affero Public License for more details.",
	" *",
	" * You should have received a copy of the GNU General Public License",
	" * along with this program. If not, see <http://www.gnu.org/licenses/>.",
	" **/",
	"",
	'import type { Command, Context } from "@lib/core";',
	'import {} from "db";',
	"$IMPORT",

	"export default class implements Command {",
	"$AUTO_COMPLETE",
	"	/**",
	"	 * $META",
	"	 *",
	"	 * @param {Context} context - The context of the command",
	"	 * @param {Options} options - The options of the command",
	"	 **/",
	"	public $METHOD({ }: Context$ARGUMENTS) {",
	'		return "Sorry, this command was registered but not implemented. Please try again later."',
	"	}",
	"}",
	"",
	"$INTERFACE",
	"",
].join("\n");

const __dirname = dirname(fileURLToPath(import.meta.url));

const METADATA_DIR = "plugins";
const PLUGIN_DIR = "./src/commands";

const files = walk(join(__dirname, METADATA_DIR));

for await (const file of files) {
	const data = (await import(file)).default;

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

/**
 * Generates a command file based on the provided location and data.
 *
 * @param {string} location - The file path where the command file will be generated.
 * @param {Object} data - The data used to generate the command file.
 * @param {string} data.description - The description of the command.
 * @param {Array<import("discord-api-types/v10").APIApplicationCommandOption>} [data.options] - The options for the command.
 * @param {import("discord-api-types/v10").APIApplicationCommandOption} data.options - The options for the command.
 * @param {object} data.options - The options for the command.
 * @param {boolean} [data.options[].autocomplete] - Indicates if the option supports autocomplete.
 * @returns {void} A promise that resolves when the command file has been generated.
 */
function generate(location: string, data) {
	let command = SKELETON;

	const options = data.options ?? [];

	const cmdArguments = createArguments(options);
	const cmdInterface = createInterface(options);
	const cmdImport = createImports(options);
	const cmdMethod = getMethodName(options);

	if (options.some((o) => o.autocomplete)) {
		const autocomplete = [
			"	/**",
			"	 * Autocomplete for the command",
			"	 *",
			"	 * @param {Context} context - The context of the command",
			"	 * @param {string} input - The input of the user",
			"	 **/",
			"	public autocompleteRun({ }: Context, input: string) {}",
			"",
		].join("\n");

		command = command.replace("$AUTO_COMPLETE", autocomplete);
	} else {
		command = command.replace("$AUTO_COMPLETE", "");
	}

	command = command.replace("$META", data.description);
	command = command.replace("$IMPORT", cmdImport);
	command = command.replace("$METHOD", cmdMethod);
	command = command.replace("$ARGUMENTS", cmdArguments);
	command = command.replace("$INTERFACE", cmdInterface);

	// don't write the file if it already exists
	if (!existsSync(location)) {
		return writeFile(location, command);
	}
}

/**
 * Generates a string of argument names from an array of options.
 *
 * @param {Array<{name: string}>} options - An array of objects, each containing a `name` property.
 * @returns {string} A string of argument names joined by commas, formatted as part of an options object if arguments exist.
 */
function createArguments(options) {
	const args = options?.map(({ name }) => name).join(", ");

	return args ? `, { ${args} }: Options` : "";
}

/**
 * Generates a TypeScript interface definition string based on the provided options.
 *
 * @param {Array<import("discord.js").ApplicationCommandOption>} options - An array of option objects.
 * @param {object} options - An array of option objects.
 * @param {string} options[].name - The name of the option.
 * @param {string} options[].description - A description of the option.
 * @param {string} [options[].type] - The type of the option (if no choices are provided).
 * @param {Array<{ value: string }>} [options[].choices] - An array of choice objects for the option.
 * @param {object} options[].choices - An array of choice objects for the option.
 * @param {string} options[].choices[].value - The value of a choice.
 * @returns {string} A string representing the TypeScript interface definition.
 */
function createInterface(options: APIApplicationCommandOption[]) {
	const args = options
		?.map((o) => {
			if (o.choices) {
				return `/* ${o.description} */\n\t${o.name}: ${o.choices
					.map(({ value }) => `"${value}"`)
					.join(" | ")};`;
			}
			return `/* ${o.description} */\n\t${o.name}: ${getOptionType(o.type)};`;
		})
		.join("\n\t");

	return args ? `interface Options {\n\t${args}\n}` : "";
}

/**
 * Generates import statements for the specified options.
 *
 * @param {Array<import("discord.js").ApplicationCommandOption>} options - An array of option objects.
 * @param {object} options - An array of option objects.
 * @param {string} options[].type - The type of the option.
 * @returns {string} The import statement string if there are any API types, otherwise an empty string.
 */
function createImports(options: APIApplicationCommandOption[]) {
	const imports = [];

	for (const option of options) {
		const type = getOptionType(option.type);

		if (type?.includes("API")) {
			imports.push(type);
		}
	}

	return imports.length ? `import type { ${imports.join(", ")} } from "discord-api-types/v10";\n` : "";
}

/**
 * Returns the method name corresponding to the given application command type.
 *
 * @param {ApplicationCommandType} type - The type of the application command.
 * @returns {string} The method name corresponding to the given command type.
 */
function getMethodName(type: ApplicationCommandType) {
	if (type === ApplicationCommandType.ChatInput) {
		return "chatInputRun";
	} else if (type === ApplicationCommandType.User) {
		return "userInputRun";
	} else if (type === ApplicationCommandType.Message) {
		return "messageInputRun";
	}
	return "chatInputRun";
}

/**
 * Returns the corresponding API type or primitive type for a given application command option type.
 *
 * @param {ApplicationCommandOptionType} type - The type of the application command option.
 * @returns {string} The corresponding API type or primitive type as a string.
 */
function getOptionType(type: ApplicationCommandOptionType) {
	return (
		{
			[ApplicationCommandOptionType.User]: "APIUser",
			[ApplicationCommandOptionType.Role]: "APIRole",
			[ApplicationCommandOptionType.Channel]: "APIPartialChannel",
			[ApplicationCommandOptionType.Attachment]: "APIAttachment",
			[ApplicationCommandOptionType.Mentionable]: "APIAttachment",
			[ApplicationCommandOptionType.String]: "string",
			[ApplicationCommandOptionType.Boolean]: "boolean",
			[ApplicationCommandOptionType.Number]: "number",
			[ApplicationCommandOptionType.Integer]: "number",
			[ApplicationCommandOptionType.Subcommand]: "Subcommand",
			[ApplicationCommandOptionType.SubcommandGroup]: "SubcommandGroup",
		}[type] ?? "string"
	);
}
