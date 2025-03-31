import type { Redis } from "ioredis";
import { inject, injectable } from "tsyringe";
import type { RepositoryManager } from "../repositories/RepositoryManager.js";
import { Deps } from "../utils/constants.js";
import { GuildSettingsCache } from "./GuildSettingsCache.js";
import { MemberSettingsCache } from "./MemberSettingsCache.js";
import { UserSettingsCache } from "./UserSettingsCache.js";

@injectable()
export class SettingsCacheManager {
	public readonly guilds: GuildSettingsCache;
	public readonly users: UserSettingsCache;
	public readonly members: MemberSettingsCache;

	public constructor(@inject(Deps.Redis) redis: Redis, @inject(Deps.RepositoryManager) db: RepositoryManager) {
		this.guilds = new GuildSettingsCache(redis, db);
		this.users = new UserSettingsCache(redis, db);
		this.members = new MemberSettingsCache(redis, db);
	}
}
