import type { Redis } from "ioredis";
import { inject, injectable } from "tsyringe";
import type { Guild } from "../entities/Guild.entity.js";
import type { RepositoryManager } from "../repositories/RepositoryManager.js";
import { Deps } from "../utils/constants.js";
import type { Payload } from "../utils/types.js";
import { BaseSettingsCache } from "./BaseSettingsCache.js";

@injectable()
export class GuildSettingsCache extends BaseSettingsCache<Guild> {
	private readonly db: RepositoryManager;

	public constructor(@inject(Deps.Redis) redis: Redis, @inject(Deps.RepositoryManager) db: RepositoryManager) {
		super(redis);
		this.db = db;
	}

	protected async load(key: string): Promise<Guild> {
		let guild = await this.db.guilds.findOne({ id: key });

		if (!guild) {
			guild = this.db.guilds.create({ id: key });
			await this.db.em.persistAndFlush(guild);
		}

		await this.set(key, guild);

		return guild;
	}

	protected async save(key: string, payload: Payload<Guild>): Promise<void> {
		const guild = await this.load(key);

		console.log({ payload });

		if (payload) {
			this.db.guilds.assign(guild, payload);
			return this.db.em.flush();
		}
	}
}
