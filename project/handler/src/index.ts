import "dotenv/config";
import "reflect-metadata";

import { CacheManager } from "#lib/db";
import { transformInteraction, walk } from "#lib/funcs";
import { Tokens } from "#lib/utils";
import { Client, CommandInteraction, GatewayIntentBits, GuildMember, InteractionType, Partials } from "discord.js";
import { basename, join } from "path";
import postgres from "postgres";
import { container } from "tsyringe";

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildMessageReactions,
	],
	partials: [
		//
		Partials.Message,
		Partials.Reaction,
		Partials.User,
		Partials.GuildMember,
	],
});

const plugins = new Map<string, Command>();
const pluginFiles = walk(join(__dirname, "/plugins"));

container.register(Tokens.Client, { useValue: client });
container.register(Tokens.SQL, { useFactory: () => postgres() });
container.register(Tokens.Cache, { useValue: container.resolve(CacheManager) });
container.register(Tokens.Plugins, { useValue: plugins });

(async () => {
	for await (const file of pluginFiles) {
		const plugin = container.resolve<Command>((await import(file)).default);

		let name = plugin.name ?? basename(file, ".js");

		if (plugin.base) {
			name = `${plugin.base}/${name}`;
		}

		plugins.set(name, plugin);
	}

	client.on("interactionCreate", async (interaction) => {
		if (!interaction.inCachedGuild()) return;

		const notACommand = interaction.type !== InteractionType.ApplicationCommand;
		const notAutocomplete = interaction.type !== InteractionType.ApplicationCommandAutocomplete;

		if (notACommand && notAutocomplete) {
			return;
		}

		let { root, args } = transformInteraction(interaction as CommandInteraction);

		let command = plugins.get(root);

		if (!command) {
			const [[subCommandName, subCommandArgs]] = Object.entries(args);

			command = plugins.get(`${root}/${subCommandName}`);
			args = subCommandArgs;
		}

		if (!command) return;

		const ctx: Context = {
			t: (s) => s,
			member: interaction.member as GuildMember,
			user: interaction.user,
			guild: interaction.guild,
			client,
		};

		if (interaction.type === InteractionType.ApplicationCommand) {
			const response = await command.exec(ctx, args);

			if (response) {
				interaction.reply(response as string);
			}
		} else if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
			if (!command.feed) return;

			const response = await command.feed(ctx, args);

			if (response) {
				interaction.respond(response);
			}
		}
	});

	await client.login();

	console.info("Logged in.");
})();
