import {
	type APIApplicationCommandAutocompleteInteraction,
	type APIApplicationCommandInteraction,
	type APIApplicationCommandInteractionDataBasicOption,
	type APIApplicationCommandInteractionDataMentionableOption,
	type APIApplicationCommandInteractionDataOption,
	type APIAttachment,
	type APIChatInputApplicationCommandInteraction,
	type APIInteractionDataResolved,
	type APIInteractionDataResolvedChannel,
	type APIRole,
	type APIUser,
	ApplicationCommandOptionType,
	ApplicationCommandType,
} from "discord-api-types/v10";

/**
 * Retrieves the command name from an interaction, including subcommand if present.
 *
 * @param interaction - The interaction object containing command data.
 * @returns The command name, optionally including the subcommand name if it exists.
 */
export function getCommandName(
	interaction: APIApplicationCommandInteraction | APIApplicationCommandAutocompleteInteraction,
) {
	const command = interaction.data.name;

	let subCommand = null;

	if (interaction.data.type === ApplicationCommandType.ChatInput) {
		subCommand = getSubCommand(interaction.data.options ?? []);
	}

	return subCommand ? `${command}/${subCommand}` : command;
}

/**
 * Retrieves the name of the subcommand or subcommand group from the provided options.
 *
 * @param options - An array of APIApplicationCommandInteractionDataOption objects.
 * @returns The name of the subcommand or subcommand group in the format `group/subcommand` if a subcommand group is present,
 *          the name of the subcommand if a subcommand is present, or `null` if no subcommand or subcommand group is found.
 */
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

export function transformInteraction({
	data,
}: APIChatInputApplicationCommandInteraction | APIApplicationCommandAutocompleteInteraction) {
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
	resolved: APIInteractionDataResolved,
	options: readonly APIApplicationCommandInteractionDataBasicOption[],
): NonNullObject {
	return Object.fromEntries(options.map((option) => [option.name, transformArgument(resolved, option)]));
}

function transformArgument(
	resolved: APIInteractionDataResolved,
	option: APIApplicationCommandInteractionDataBasicOption,
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
	resolved: APIInteractionDataResolved,
	option: APIApplicationCommandInteractionDataMentionableOption,
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
