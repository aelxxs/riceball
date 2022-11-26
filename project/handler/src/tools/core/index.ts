export * from "./api/guilds";

export * from "./components/action";
export * from "./components/button";
export * from "./components/select";

export * from "./interactionHandler/load";
export * from "./interactionHandler/handle";

export * from "./interactionOptions/parseOptions";
export * from "./interactionOptions/parseUniqueID";

export * from "./interactionRunners/runCommand";
export * from "./interactionRunners/runComponent";
export * from "./interactionRunners/runAutocomplete";

import {
	APIApplicationCommandInteraction,
	APIChatInputApplicationCommandInteraction,
	ApplicationCommandOptionType,
	type APIApplicationCommandInteractionDataBasicOption,
	type APIApplicationCommandInteractionDataMentionableOption,
	type APIApplicationCommandInteractionDataOption,
	type APIChatInputApplicationCommandInteractionDataResolved,
	type APIInteractionDataResolvedChannel,
	type APIRole,
	type APIUser,
	ApplicationCommandType,
	APIAttachment,
} from "discord-api-types/v10";

export function getCommandName(interaction: APIApplicationCommandInteraction) {
	const command = interaction.data.name;

	let subCommand = null;

	if (interaction.data.type === ApplicationCommandType.ChatInput) {
		subCommand = getSubCommand(interaction.data.options ?? []);
	}

	return subCommand ? `${command}/${subCommand}` : command;
}

function getSubCommand(options: APIApplicationCommandInteractionDataOption[]) {
	if (options.length) {
		const [option] = options;

		if (option.type === ApplicationCommandOptionType.SubcommandGroup) {
			const [subCommand] = option.options;

			return `${option.name}/${subCommand.name}`;
		}

		if (option.type === ApplicationCommandOptionType.Subcommand) {
			return option.name;
		}
	}

	return null;
}

// eslint-disable-next-line @typescript-eslint/ban-types
type NonNullObject = {} & object;

export function transformInteraction({ data }: APIChatInputApplicationCommandInteraction) {
	return transformArguments(data.resolved ?? {}, extractOptions(data.options ?? []));
}

export function extractOptions(options: readonly APIApplicationCommandInteractionDataOption[]) {
	let [option] = options;

	if (option?.type === ApplicationCommandOptionType.SubcommandGroup) {
		[option] = option.options;

		return option.options ?? [];
	}

	if (option?.type === ApplicationCommandOptionType.Subcommand) {
		return option.options ?? [];
	}

	return options as APIApplicationCommandInteractionDataBasicOption[];
}

function transformArguments(
	resolved: APIChatInputApplicationCommandInteractionDataResolved,
	options: readonly APIApplicationCommandInteractionDataBasicOption[]
): NonNullObject {
	return Object.fromEntries(options.map((option) => [option.name, transformArgument(resolved, option)]));
}

function transformArgument(
	resolved: APIChatInputApplicationCommandInteractionDataResolved,
	option: APIApplicationCommandInteractionDataBasicOption
): TransformedArguments.Any {
	if (option.type === ApplicationCommandOptionType.User) {
		return resolved.users?.[option.value] as TransformedArguments.User;
	}

	if (option.type === ApplicationCommandOptionType.Channel) {
		return resolved.channels?.[option.value] as TransformedArguments.Channel;
	}

	if (option.type === ApplicationCommandOptionType.Role) {
		return resolved.roles?.[option.value] as TransformedArguments.Role;
	}

	if (option.type === ApplicationCommandOptionType.Mentionable) {
		return transformMentionable(resolved, option);
	}

	if (option.type === ApplicationCommandOptionType.Attachment) {
		return resolved.attachments?.[option.value] as TransformedArguments.Attachment;
	}

	return option.value;
}

function transformMentionable(
	resolved: APIChatInputApplicationCommandInteractionDataResolved,
	option: APIApplicationCommandInteractionDataMentionableOption
): TransformedArguments.Mentionable {
	const id = option.value;

	const user = resolved.users?.[id];
	if (user) return user;

	const channel = resolved.channels?.[id];
	if (channel) return { id, channel };

	const role = resolved.roles?.[id];
	if (role) return { id, role };

	return { id };
}

export namespace TransformedArguments {
	export type User = APIUser;

	export type Attachment = APIAttachment;
	export type Channel = APIInteractionDataResolvedChannel;
	export type Role = APIRole;

	export type Mentionable =
		| ({ id: string } & User) //
		| { id: string; channel: Channel }
		| { id: string; role: Role }
		| { id: string };

	export type Any = User | Channel | Role | Mentionable | number | string | boolean;
}
