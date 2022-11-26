import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { opendir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";

async function* walk(path) {
	for await (const item of await opendir(path)) {
		const entry = join(path, item.name);

		if (item.isDirectory()) yield* walk(entry);
		if (item.isFile()) yield entry;
	}
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

const __dirname = dirname(fileURLToPath(import.meta.url));

const commands = [];
const files = walk(join(__dirname, "commands"));

for await (const file of files) {
	const path = pathToFileURL(new URL(file, import.meta.url).href);
	const data = (await import(path)).default;

	if (!data) continue;

	commands.push(data);
}

try {
	console.log("Publishing slash commands...");

	await rest.put(Routes.applicationCommands("525810495786057758"), {
		body: commands,
	});
	console.log("Complete.");
} catch (e) {
	console.error(e);
}
