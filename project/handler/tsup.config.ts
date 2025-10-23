import { defineConfig, type Options } from "tsup";

export default defineConfig((options: Options) => ({
	entryPoints: ["src/**/*.ts"],
	// splitting: false, // don't need to chunk server code
	clean: true,
	format: ["esm"],
	banner: {
		js: "import 'reflect-metadata';",
	},
	silent: true,
	...options,
}));
