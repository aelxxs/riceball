import { inject, injectable } from "tsyringe";
import type { Guild } from "../entities/Guild.entity.js";
import type { Member } from "../entities/Member.entity.js";
import type { User } from "../entities/User.entity.js";
import type { RepositoryManager } from "../repositories/RepositoryManager.js";
import { Deps } from "../utils/constants.js";
import type { Payload } from "../utils/types.js";
import type { SettingsCacheManager } from "./SettingsCacheManager.js";

@injectable()
export class Database {
	private readonly cache: SettingsCacheManager;
	public readonly rm: RepositoryManager;

	public constructor(
		@inject(Deps.Cache) cache: SettingsCacheManager,
		@inject(Deps.RepositoryManager) rm: RepositoryManager,
	) {
		this.rm = rm;
		this.cache = cache;
	}

	public getGuildSettings(key: string): Promise<Guild> {
		return this.cache.guilds.read(key);
	}

	public setGuildSettings(key: string, value: Payload<Guild>): Promise<void> {
		return this.cache.guilds.write(key, value);
	}

	public getUserSettings(key: string): Promise<User> {
		return this.cache.users.read(key);
	}

	public setUserSettings(key: string, value: Payload<User>): Promise<void> {
		return this.cache.users.write(key, value);
	}

	public getMemberSettings(guildId: string, memberId: string): Promise<Member> {
		return this.cache.members.read(makeKey(guildId, memberId));
	}

	public setMemberSettings(guildId: string, memberId: string, value: Payload<Member>): Promise<void> {
		return this.cache.members.write(makeKey(guildId, memberId), value);
	}
}

const makeKey = (guildId: string, memberId: string): string => {
	return `${guildId}:${memberId}`;
};
