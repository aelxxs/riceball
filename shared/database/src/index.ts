import { MikroORM } from "@mikro-orm/mongodb";
import { Redis } from "ioredis";
import { container } from "tsyringe";
import { SettingsCacheManager } from "./cache/SettingsCacheManager.js";
import mikroOrmConfig from "./mikro-orm.config.js";
import { RepositoryManager } from "./repositories/RepositoryManager.js";
import { Deps } from "./utils/constants.js";

type SetupDatabaseOptions = {
	mongoUrl: string;
	redisUrl: string;
};

export async function setupDatabase({ mongoUrl, redisUrl }: SetupDatabaseOptions) {
	if (!mongoUrl) {
		throw new Error("MongoDB URL is not defined");
	}

	if (!redisUrl) {
		throw new Error("Redis URL is not defined");
	}

	const orm = await MikroORM.init({
		...mikroOrmConfig,
		clientUrl: mongoUrl,
	});
	const redis = new Redis(redisUrl);

	container.register(Deps.Redis, { useValue: redis });
	container.register(Deps.EntityManager, { useValue: orm.em });
	container.register(Deps.RepositoryManager, { useClass: RepositoryManager });
	container.register(Deps.Cache, { useClass: SettingsCacheManager });

	return orm;
}

export * from "./cache/Database.js";
export * from "./cache/SettingsCacheManager.js";
export * from "./entities";
export * from "./repositories/RepositoryManager.js";
export * from "./utils/constants.js";
export * from "./utils/types.js";

export { container };

export const getGuild = () => {};
export const updateGuild = () => {};
export const getMember = () => {};
export const updateMember = () => {};
