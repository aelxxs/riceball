import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { opendir } from "fs/promises";
import { join } from "path";

export async function* walk(path: string): AsyncIterableIterator<string> {
	for await (const item of await opendir(path)) {
		const entry = join(path, item.name);

		if (item.isDirectory()) {
			yield* walk(entry);
		}

		if (item.isFile()) {
			yield entry;
		}
	}
}

export function transformInteraction(interaction: CommandInteraction) {
	return {
		root: interaction.commandName,
		args: transformOptions(interaction.options.data),
	};
}

export function transformOptions(options: any): Record<string, any> {
	const opts: any = {};

	for (const top of options) {
		switch (top.type) {
			case ApplicationCommandOptionType.Subcommand:
			case ApplicationCommandOptionType.SubcommandGroup:
				opts[top.name] = transformOptions(top.options ? [...top.options] : []);
				break;
			case ApplicationCommandOptionType.User:
				opts[top.name] = { user: top.user, member: top.member };
				break;
			case ApplicationCommandOptionType.Channel:
				opts[top.name] = top.channel;
				break;
			case ApplicationCommandOptionType.Role:
				opts[top.name] = top.role;
				break;
			case ApplicationCommandOptionType.Mentionable:
				opts[top.name] = top.user ? { user: top.user, member: top.member } : top.role;
				break;
			case ApplicationCommandOptionType.Number:
			case ApplicationCommandOptionType.Integer:
			case ApplicationCommandOptionType.String:
			case ApplicationCommandOptionType.Boolean:
				opts[top.name] = top.value;
				break;
			case ApplicationCommandOptionType.Attachment:
				opts[top.name] = top.attachment;
				break;
			default:
				break;
		}
	}

	return opts;
}
