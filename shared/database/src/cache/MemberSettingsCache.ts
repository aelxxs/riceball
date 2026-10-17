import type { Redis } from "ioredis";
import { inject, injectable } from "tsyringe";
import { Guild } from "../entities/Guild.entity.js";
import type { Member } from "../entities/Member.entity.js";
import type { RepositoryManager } from "../repositories/RepositoryManager.js";
import { Deps } from "../utils/constants.js";
import type { Payload } from "../utils/types.js";
import { BaseSettingsCache } from "./BaseSettingsCache.js";

@injectable()
export class MemberSettingsCache extends BaseSettingsCache<Member> {
	private readonly db: RepositoryManager;

	public constructor(@inject(Deps.Redis) redis: Redis, @inject(Deps.RepositoryManager) db: RepositoryManager) {
		super(redis);
		this.db = db;
	}

	protected async load(key: string): Promise<Member> {
		const { userId, guildId } = this.parseKey(key);

		let member = await this.db.members.findOne({ userId, guildId });

		if (!member) {
			const guild = await this.db.em.findOne(Guild, { id: guildId }, { disableIdentityMap: true });
			member = this.db.members.create({ userId, guildId, bal: guild?.economy?.defaultBalance ?? 0 });
			await this.db.em.persist(member).flush();
		}

		await this.set(key, member);

		return member;
	}

	protected async save(key: string, payload: Payload<Member>): Promise<void> {
		const member = await this.load(key);

		if (payload) {
			this.db.members.assign(member, payload);
			return this.db.em.flush();
		}
	}

	private parseKey(key: string) {
		const [guildId, userId] = key.split(":");
		return { userId, guildId };
	}
}
