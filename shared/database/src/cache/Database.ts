import type { EntityManager } from "@mikro-orm/mongodb";
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
	public readonly em: EntityManager;

	public constructor(
		@inject(Deps.Cache) cache: SettingsCacheManager,
		@inject(Deps.RepositoryManager) rm: RepositoryManager,
		@inject(Deps.EntityManager) em: EntityManager,
	) {
		this.rm = rm;
		this.cache = cache;
		this.em = em.fork();
	}

	public async getGuildSettings(key: string): Promise<Guild> {
		const settings = await this.cache.guilds.read(key);
		return JSON.parse(JSON.stringify(settings));
	}

	public setGuildSettings(key: string, value: Payload<Guild>): Promise<void> {
		return this.cache.guilds.write(key, value);
	}

	public async getUserSettings(key: string): Promise<User> {
		const settings = await this.cache.users.read(key);
		return JSON.parse(JSON.stringify(settings));
	}

	public setUserSettings(key: string, value: Payload<User>): Promise<void> {
		return this.cache.users.write(key, value);
	}

	public async getMemberSettings(guildId: string, memberId: string): Promise<Member> {
		const settings = await this.cache.members.read(makeKey(guildId, memberId));
		return JSON.parse(JSON.stringify(settings));
	}

	public setMemberSettings(guildId: string, memberId: string, value: Payload<Member>): Promise<void> {
		return this.cache.members.write(makeKey(guildId, memberId), value);
	}
}

const makeKey = (guildId: string, memberId: string): string => {
	return `${guildId}:${memberId}`;
};
