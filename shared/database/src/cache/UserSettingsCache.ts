import type { Redis } from "ioredis";
import { inject, injectable } from "tsyringe";
import type { User } from "../entities/User.entity.js";
import type { RepositoryManager } from "../repositories/RepositoryManager.js";
import { Deps } from "../utils/constants.js";
import type { Payload } from "../utils/types.js";
import { BaseSettingsCache } from "./BaseSettingsCache.js";

@injectable()
export class UserSettingsCache extends BaseSettingsCache<User> {
	private readonly db: RepositoryManager;

	public constructor(@inject(Deps.Redis) redis: Redis, @inject(Deps.RepositoryManager) db: RepositoryManager) {
		super(redis);
		this.db = db;
	}

	protected async load(key: string): Promise<User> {
		let user = await this.db.users.findOne({ id: key }, { populate: ["cardPresets"] });

		if (!user) {
			user = this.db.users.create({ id: key });
			await this.db.em.persistAndFlush(user);
		}

		await this.set(key, user);

		return user;
	}

	protected async save(key: string, payload: Payload<User>): Promise<void> {
		const user = await this.load(key);

		if (payload) {
			this.db.users.assign(user, payload);
			return this.db.em.flush();
		}
	}
}
