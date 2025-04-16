import type { EntityManager, EntityRepository } from "@mikro-orm/mongodb";
import { inject, injectable } from "tsyringe";
import { CardPreset } from "../entities/CardPreset.entity.js";
import { Guild } from "../entities/Guild.entity.js";
import { Member } from "../entities/Member.entity.js";
import { User } from "../entities/User.entity.js";
import { Deps } from "../utils/constants.js";

@injectable()
export class RepositoryManager {
	public readonly em: EntityManager;

	// -- Repositories
	public readonly guilds: EntityRepository<Guild>;
	public readonly users: EntityRepository<User>;
	public readonly members: EntityRepository<Member>;
	public readonly cardPresets: EntityRepository<CardPreset>;

	public constructor(@inject(Deps.EntityManager) em: EntityManager) {
		this.em = em.fork();

		this.guilds = this.em.getRepository(Guild);
		this.users = this.em.getRepository(User);
		this.members = this.em.getRepository(Member);
		this.cardPresets = this.em.getRepository(CardPreset);
	}
}
