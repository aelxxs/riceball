import "dotenv/config";

import { existsSync, readFileSync } from "node:fs";
import { GeneratedCacheAdapter, type Options, defineConfig } from "@mikro-orm/mongodb";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import { entities } from "./entities/index.js";

const options = {} as Options;

if (process.env.NODE_ENV === "production" && existsSync("./temp/metadata.json")) {
	options.metadataCache = {
		enabled: true,
		adapter: GeneratedCacheAdapter,
		options: {
			// temp/metadata.json can be generated via `pnpm exec mikro-orm-esm cache:generate --combine`
			data: JSON.parse(readFileSync("./temp/metadata.json", { encoding: "utf8" })),
		},
	};
} else {
	options.metadataProvider = (await import("@mikro-orm/reflection")).TsMorphMetadataProvider;
}

export default defineConfig({
	strict: true,
	entities: [...entities],
	// entitiesTs: ["src/**/*.entity.ts"],
	discovery: {
		disableDynamicFileAccess: true,
	},
	dbName: process.env.PRODUCTION ? "production" : "development",
	clientUrl: process.env.DATABASE_URL,
	metadataProvider: TsMorphMetadataProvider,
	allowGlobalContext: true,
	// debug: true,
	...options,
});
