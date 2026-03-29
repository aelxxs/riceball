import "dotenv/config";

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, GeneratedCacheAdapter, type Options } from "@mikro-orm/mongodb";
import { entities } from "./entities/index.js";

const options: Partial<Options> = {};

const metadataPath = join(fileURLToPath(import.meta.url), "../../temp/metadata.json");

if (existsSync(metadataPath)) {
	options.metadataCache = {
		enabled: true,
		adapter: GeneratedCacheAdapter,
		options: {
			// temp/metadata.json can be generated via `pnpm exec mikro-orm cache:generate --combined`
			data: JSON.parse(readFileSync(metadataPath, { encoding: "utf8" })),
		},
	};
} else {
	options.metadataProvider = (await import("@mikro-orm/reflection")).TsMorphMetadataProvider;
}

export default defineConfig({
	entities: [...entities],
	dbName: process.env.PRODUCTION ? "production" : "development",
	clientUrl: process.env.DATABASE_URL,
	...options,
});
