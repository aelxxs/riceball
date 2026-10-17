/**
 * This file is part of the Rice Ball (https://github.com/aelxxs/riceball).
 * Copyright (c) 2023 Alexis Vielma.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Affero Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 **/

import { basename, extname, join, relative, sep } from "node:path";
import { chatInputApplicationCommandMention, inlineCode } from "@discordjs/formatters";
import type { REST } from "@discordjs/rest";
import {
	type APIApplicationCommand,
	type APIApplicationCommandOption,
	type APIEmbedField,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	PermissionFlagsBits,
	Routes,
	type Snowflake,
} from "discord-api-types/v10";
import { Deps } from "library/common";
import { actionRow, button } from "library/components";
import { type Command, type Component, type Context, type MessagePayload, walk } from "library/core";
import { inject, injectable } from "tsyringe";

const CACHE_TTL = 10 * 60 * 1000;
const PAGE_CHARACTERS = 4000;
const PAGE_FIELDS = 12;
const FIELD_VALUE_LIMIT = 1024;
const OTHER_PLUGIN = "Other";

const OPTION_TYPES: Partial<Record<ApplicationCommandOptionType, string>> = {
	[ApplicationCommandOptionType.String]: "text",
	[ApplicationCommandOptionType.Integer]: "integer",
	[ApplicationCommandOptionType.Number]: "number",
	[ApplicationCommandOptionType.Boolean]: "true/false",
	[ApplicationCommandOptionType.User]: "user",
	[ApplicationCommandOptionType.Channel]: "channel",
	[ApplicationCommandOptionType.Role]: "role",
	[ApplicationCommandOptionType.Mentionable]: "user or role",
	[ApplicationCommandOptionType.Attachment]: "file",
};

let registered: { commands: APIApplicationCommand[]; expires: number } | null = null;
let plugins: Promise<Map<string, string>> | null = null;

@injectable()
export default class implements Command {
	public constructor(@inject(Deps.Rest) private rest: REST) {}

	public async autocompleteRun(ctx: Context, { command = "" }: Partial<Options>) {
		const query = command.trim().toLowerCase();
		const commands = await this.getVisibleCommands(ctx);

		return commands
			.filter(({ name }) => name.includes(query))
			.slice(0, 25)
			.map(({ name, description }) => ({ name: truncate(`/${name} – ${description}`, 100), value: name }));
	}

	/**
	 * View Rice Ball's commands
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public chatInputRun(ctx: Context, { command }: Options) {
		return this.renderPage(ctx, 1, command?.trim().toLowerCase());
	}

	public showPage: Component = (ctx, state) => {
		const [page, command] = state.split(",");
		return this.renderPage(ctx, Number(page) || 1, command || undefined);
	};

	private async renderPage(ctx: Context, page: number, commandName?: string): Promise<MessagePayload> {
		const commands = await this.getVisibleCommands(ctx);

		let title = "Rice Ball Commands";
		let description = "Use `/help command:<name>` to view a command's subcommands and options.";
		let fields: APIEmbedField[];

		if (commandName) {
			const command = commands.find(({ name }) => name === commandName);

			if (!command) {
				throw `There is no command named ${inlineCode(commandName)}.`;
			}

			title = `/${command.name}`;
			description = command.description;
			fields = this.describeCommand(command);
		} else {
			fields = await this.describePlugins(commands);
		}

		const pages = paginate(fields);
		const current = Math.min(Math.max(1, Math.trunc(page)), pages.length);
		const state = commandName ?? "";

		return {
			embeds: [
				{
					title,
					description,
					fields: pages[current - 1],
					footer: pages.length > 1 ? { text: `Page ${current}/${pages.length}` } : undefined,
				},
			],
			components:
				pages.length > 1
					? [
							actionRow({
								command: "help",
								components: [
									button({
										method: `showPage|${current - 1},${state}`,
										label: "Previous",
										disabled: current <= 1,
									}),
									button({
										method: `showPage|${current + 1},${state}`,
										label: "Next",
										disabled: current >= pages.length,
									}),
								],
							}),
						]
					: [],
		};
	}

	private async describePlugins(commands: APIApplicationCommand[]) {
		const pluginOf = await getPluginNames();
		const groups = new Map<string, string[]>();

		for (const command of commands) {
			const plugin = pluginOf.get(command.name) ?? OTHER_PLUGIN;
			const hasSubcommands = command.options?.some(isSubcommandLike);
			const name = hasSubcommands ? inlineCode(`/${command.name}`) : mention(command.name, command.id);
			const restricted = command.default_member_permissions != null ? " 🔒" : "";

			groups.set(plugin, [...(groups.get(plugin) ?? []), `${name}${restricted} – ${command.description}`]);
		}

		const order = [...groups.keys()].sort((a, b) =>
			a === OTHER_PLUGIN ? 1 : b === OTHER_PLUGIN ? -1 : a.localeCompare(b),
		);

		return order.flatMap((plugin) => toFields(plugin, groups.get(plugin) ?? []));
	}

	private describeCommand(command: APIApplicationCommand) {
		const options = command.options ?? [];

		if (!options.some(isSubcommandLike)) {
			return toFields(mention(command.name, command.id), options.map(describeOption));
		}

		return options.flatMap((option): APIEmbedField[] => {
			if (option.type === ApplicationCommandOptionType.SubcommandGroup) {
				return (option.options ?? []).map((subcommand) =>
					describeSubcommand(command, `${option.name} ${subcommand.name}`, subcommand),
				);
			}

			if (option.type === ApplicationCommandOptionType.Subcommand) {
				return [describeSubcommand(command, option.name, option)];
			}

			return [];
		});
	}

	private async getVisibleCommands({ i, member }: Context) {
		if (!registered || registered.expires < Date.now()) {
			const commands = (await this.rest.get(
				Routes.applicationCommands(i.application_id),
			)) as APIApplicationCommand[];

			registered = {
				commands: commands
					.filter(({ type }) => type === ApplicationCommandType.ChatInput)
					.sort((a, b) => a.name.localeCompare(b.name)),
				expires: Date.now() + CACHE_TTL,
			};
		}

		const permissions = BigInt(member.permissions);

		return registered.commands.filter((command) => canUse(command, permissions));
	}
}

/**
 * Whether a member's permissions satisfy a command's default permissions. Per-server command
 * permission overrides aren't visible to the bot, so this can't account for them.
 */
function canUse(command: APIApplicationCommand, permissions: bigint) {
	if (command.default_member_permissions == null) return true;
	if ((permissions & PermissionFlagsBits.Administrator) === PermissionFlagsBits.Administrator) return true;

	const required = BigInt(command.default_member_permissions);

	// "0" restricts a command to administrators
	return required !== BigInt(0) && (permissions & required) === required;
}

function isSubcommandLike({ type }: APIApplicationCommandOption) {
	return type === ApplicationCommandOptionType.Subcommand || type === ApplicationCommandOptionType.SubcommandGroup;
}

function describeSubcommand(command: APIApplicationCommand, path: string, subcommand: APIApplicationCommandOption) {
	const options = "options" in subcommand && subcommand.options ? subcommand.options : [];

	return {
		name: truncate(`/${command.name} ${path}`, 256),
		value: truncate([subcommand.description, ...options.map(describeOption)].join("\n"), FIELD_VALUE_LIMIT),
	};
}

function describeOption(option: APIApplicationCommandOption) {
	const type = OPTION_TYPES[option.type] ?? "value";
	const required = "required" in option && option.required ? ", required" : "";

	return `- ${inlineCode(option.name)} (${type}${required}) – ${option.description}`;
}

function mention(name: string, id: Snowflake) {
	return chatInputApplicationCommandMention(name, id);
}

/**
 * Lines grouped under one heading, split across fields so none exceeds Discord's value limit.
 */
function toFields(name: string, lines: string[]) {
	const fields: APIEmbedField[] = [];
	let value = "";

	for (const line of lines.map((line) => truncate(line, FIELD_VALUE_LIMIT))) {
		if (value && value.length + line.length + 1 > FIELD_VALUE_LIMIT) {
			fields.push({ name: fields.length ? `${name} (cont.)` : name, value });
			value = "";
		}

		value = value ? `${value}\n${line}` : line;
	}

	if (value || !fields.length) {
		fields.push({ name: fields.length ? `${name} (cont.)` : name, value: value || "No options." });
	}

	return fields;
}

/**
 * Splits fields into pages that stay within Discord's 6000 character embed limit.
 */
function paginate(fields: APIEmbedField[]) {
	const pages: APIEmbedField[][] = [[]];
	let size = 0;

	for (const field of fields) {
		const length = field.name.length + field.value.length;
		const page = pages[pages.length - 1];

		if (page.length && (page.length >= PAGE_FIELDS || size + length > PAGE_CHARACTERS)) {
			pages.push([field]);
			size = length;
		} else {
			page.push(field);
			size += length;
		}
	}

	return pages;
}

function truncate(text: string, length: number) {
	return text.length > length ? `${text.slice(0, length - 1)}…` : text;
}

/**
 * Maps each top-level command to the plugin folder its implementation lives in.
 */
function getPluginNames() {
	plugins ??= (async () => {
		const root = join(import.meta.dirname, "..");
		const names = new Map<string, string>();

		for await (const file of walk(root)) {
			if (file.includes("__") || ![".js", ".ts"].includes(extname(file))) continue;

			const [plugin, entry] = relative(root, file).split(sep);
			if (!entry) continue;

			const command = entry.startsWith("[") ? plugin : basename(entry, extname(entry));
			names.set(command, formatPluginName(plugin));
		}

		return names;
	})().catch(() => new Map());

	return plugins;
}

function formatPluginName(plugin: string) {
	return plugin
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

interface Options {
	/* A command to view the subcommands and options of */
	command?: string;
}
