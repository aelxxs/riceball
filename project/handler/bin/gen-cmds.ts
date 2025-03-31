import { existsSync } from "node:fs";
import { mkdir, opendir, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	type APIApplicationCommandOption,
	ApplicationCommandOptionType,
	ApplicationCommandType,
} from "discord-api-types/v10";

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
	'import type { Command, Context } from "library/core";',
	'import {} from "@riceball/db";',
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

(async () => {
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
			for (const option of data.options) {
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
})();

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

interface CommandOption {
	name: string;
}

function createArguments(options: CommandOption[]): string {
	const args = options?.map(({ name }) => name).join(", ");

	return args ? `, { ${args} }: Options` : "";
}

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

function getMethodName(type: ApplicationCommandType) {
	if (type === ApplicationCommandType.ChatInput) {
		return "chatInputRun";
	}
	if (type === ApplicationCommandType.User) {
		return "userInputRun";
	}
	if (type === ApplicationCommandType.Message) {
		return "messageInputRun";
	}
	return "chatInputRun";
}

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
