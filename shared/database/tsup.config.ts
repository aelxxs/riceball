import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/**/*.ts"],
	format: ["esm"],
	dts: true,
	splitting: false,
	external: [
		"@mikro-orm/better-sqlite",
		"@mikro-orm/migrations",
		"@mikro-orm/entity-generator",
		"@mikro-orm/postgresql",
		"@mikro-orm/mariadb",
		// "@mikro-orm/mongodb",
		"@mikro-orm/mysql",
		"@mikro-orm/mssql",
		"@mikro-orm/seeder",
		"@mikro-orm/sqlite",
		"@mikro-orm/libsql",
		"@vscode/sqlite3",
		"sqlite3",
		"better-sqlite3",
		"mysql",
		"mysql2",
		"oracledb",
		"pg-native",
		"pg-query-stream",
		"tedious",
	],
	banner: {
		js: "import 'reflect-metadata';",
	},
});
