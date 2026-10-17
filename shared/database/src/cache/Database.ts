import { type EntityManager, wrap } from "@mikro-orm/mongodb";
import { inject, injectable } from "tsyringe";
import type { Card } from "../entities/Card.entity.js";
import { CardPreset } from "../entities/CardPreset.entity.js";
import type { Guild } from "../entities/Guild.entity.js";
import type { Member } from "../entities/Member.entity.js";
import { User } from "../entities/User.entity.js";
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

	/**
	 * Drop cached settings for members whose documents were changed outside the cache, e.g. by a bulk update.
	 */
	public invalidateMemberSettings(guildId: string, memberIds: string[]): Promise<void> {
		return this.cache.members.delete(memberIds.map((memberId) => makeKey(guildId, memberId)));
	}

	// Presets are a relation on User, so they never appear in the cached user settings
	public async getCardPresets(userId: string) {
		const presets = await this.em.fork().find(CardPreset, { user: userId }, { orderBy: { createdAt: "asc" } });
		return presets.map((preset) => wrap(preset).toObject());
	}

	public async createCardPreset(
		userId: string,
		data: { name: string; description?: string | null; public?: boolean; card: Card },
	) {
		await this.getUserSettings(userId);

		const em = this.em.fork();
		const preset = em.create(CardPreset, {
			name: data.name,
			description: data.description ?? undefined,
			public: data.public ?? false,
			card: data.card,
			user: em.getReference(User, userId),
		});

		await em.persist(preset).flush();
		return wrap(preset).toObject();
	}

	public async deleteCardPreset(userId: string, presetId: string) {
		const em = this.em.fork();
		const preset = await em.findOne(CardPreset, { id: presetId, user: userId });
		if (!preset) return null;

		const removed = wrap(preset).toObject();
		await em.remove(preset).flush();
		return removed;
	}
}

const makeKey = (guildId: string, memberId: string): string => {
	return `${guildId}:${memberId}`;
};
