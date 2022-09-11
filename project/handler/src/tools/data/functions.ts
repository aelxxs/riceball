import { Injectors } from "@lib/util";
import type { APIGuild, APIGuildMember, APIUser, Snowflake } from "discord-api-types/v10";
import { container } from "tsyringe";
import type { CacheManager } from "./settings";
import type { GuildSchema } from "./schema/Guild";
import type { MemberSchema } from "./schema/Member";
import type { UserSchema } from "./schema/User";

type Entity = APIGuild | APIGuildMember | APIUser;

type SettingsCache<T> = T extends APIGuildMember
	? MemberSchema
	: T extends APIUser
	? UserSchema
	: T extends APIGuild
	? GuildSchema
	: never;

type RecursivePartial<T> = {
	[P in keyof T]?: RecursivePartial<T[P]>;
};

function isGuild(entity: Entity): entity is APIGuild {
	return (entity as APIGuild).owner_id !== undefined;
}

function isGuildMember(entity: Entity): entity is APIGuildMember {
	return (entity as APIGuildMember).guild_id !== undefined;
}

function isUser(entity: Entity): entity is APIUser {
	return (entity as APIUser).username !== undefined;
}

export function read<T extends Entity, K extends SettingsCache<T>>(entity: T): K | Promise<K> {
	const config = container.resolve<CacheManager>(Injectors.Cache);

	if (isUser(entity)) {
		return config.users.read(entity.id) as K;
	}

	if (isGuildMember(entity)) {
		return config.members.read(`${entity.guild_id}:${entity.user!.id}`) as K;
	}

	if (isGuild(entity)) {
		return config.guilds.read(entity.id) as K;
	}

	throw new TypeError(`Cannot resolve "entity".`);
}

export function write<T extends Entity, K extends SettingsCache<T>>(entity: T, query: RecursivePartial<K>) {
	const config = container.resolve<CacheManager>(Injectors.Cache);

	if (isGuildMember(entity)) {
		return config.members.write(`${entity.guild_id}:${entity.user!.id}`, query as RecursivePartial<MemberSchema>);
	}

	if (isUser(entity)) {
		return config.users.write(entity.id, query as RecursivePartial<UserSchema>);
	}

	if (isGuild(entity)) {
		return config.guilds.write(entity.id, query as RecursivePartial<GuildSchema>);
	}

	throw new TypeError(`Cannot resolve "entity".`);
}
