import { REST } from "@discordjs/rest";
import { logger } from "@riceball/logger";
import { Routes } from "discord-api-types/v10";
import { config } from "dotenv";
import { opendir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

config({ path: "../../.env" });

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

const rest = new REST().setToken(process.env.DISCORD_TOKEN || "");

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

	await rest.put(Routes.applicationCommands("525810495786057758"), {
		body: commands,
	});
	logger.info("Published slash commands.");
} catch (e) {
	console.error(e);
}
