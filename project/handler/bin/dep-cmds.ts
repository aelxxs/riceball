import { opendir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { REST } from "@discordjs/rest";
import { logger } from "@riceball/logger";
import { Routes } from "discord-api-types/v10";
import { config } from "dotenv";

config();

async function* walk(path: string): AsyncGenerator<string> {
	for await (const item of await opendir(path)) {
		const entry = join(path, item.name);

		if (item.isDirectory()) yield* walk(entry);
		if (item.isFile()) yield entry;
	}
}

(async () => {
	const rest = new REST().setToken(process.env.DISCORD_TOKEN as string);

	const __dirname = dirname(fileURLToPath(import.meta.url));

	const commands = [];
	const files = walk(join(__dirname, "plugins"));

	for await (const file of files) {
		const data = (await import(file)).default;

		if (!data) continue;

		commands.push(data);
	}

	try {
		logger.info("Publishing slash commands...");

		await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID as string), {
			body: commands,
		});
		logger.info("Published slash commands.");
	} catch (e) {
		console.error(e);
	}
})();
