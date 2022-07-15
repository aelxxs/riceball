import { Tokens } from "#lib/utils";
import type { Client, GuildResolvable, UserResolvable } from "discord.js";
import { container } from "tsyringe";
import type { CacheManager } from "./settings";
import type { GuildSchema } from "./schema/Guild";
import type { MemberSchema } from "./schema/Member";
import type { UserSchema } from "./schema/User";

type Entity = UserResolvable | GuildResolvable;

type SettingsCache<T> = T extends GuildResolvable & UserResolvable
	? MemberSchema
	: T extends UserResolvable
	? UserSchema
	: T extends GuildResolvable
	? GuildSchema
	: never;

type RecursivePartial<T> = {
	[P in keyof T]?: RecursivePartial<T[P]>;
};

export function read<T extends Entity, K extends SettingsCache<T>>(entity: T): Promise<K> {
	const client = container.resolve<Client>(Tokens.Client);
	const config = container.resolve<CacheManager>(Tokens.Cache);

	const guild = client.guilds.resolveId(entity as GuildResolvable);
	const user = client.users.resolveId(entity as UserResolvable);

	if (guild && user) {
		return config.members.read(`${guild}:${user}`) as Promise<K>;
	}

	if (guild) {
		return config.guilds.read(guild) as Promise<K>;
	}

	if (user) {
		return config.users.read(user) as Promise<K>;
	}

	throw new TypeError(`Cannot resolve "entity".`);
}

export function write<T extends Entity, K extends SettingsCache<T>>(entity: T, query: RecursivePartial<K>) {
	const client = container.resolve<Client>(Tokens.Client);
	const config = container.resolve<CacheManager>(Tokens.Cache);

	const guild = client.guilds.resolveId(entity as GuildResolvable);
	const user = client.users.resolveId(entity as UserResolvable);

	if (guild && user) {
		return config.members.write(`${guild}:${user}`, query as RecursivePartial<MemberSchema>);
	}

	if (guild) {
		return config.guilds.write(guild, query as RecursivePartial<GuildSchema>);
	}

	if (user) {
		return config.users.write(user, query as RecursivePartial<UserSchema>);
	}

	throw new TypeError(`Cannot resolve "entity".`);
}
