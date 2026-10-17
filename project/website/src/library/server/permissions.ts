import type { REST } from "@discordjs/rest";
import { type RESTGetAPICurrentUserGuildsResult, Routes } from "discord-api-types/v10";

const ADMINISTRATOR = 1n << 3n;
const MANAGE_GUILD = 1n << 5n;
const CACHE_TTL = 60_000;

type UserGuild = RESTGetAPICurrentUserGuildsResult[number];

const cache = new Map<string, { guilds: RESTGetAPICurrentUserGuildsResult; expires: number }>();

export const canManageGuild = (guild: Pick<UserGuild, "owner" | "permissions">) => {
	const permissions = BigInt(guild.permissions);
	return guild.owner || (permissions & ADMINISTRATOR) !== 0n || (permissions & MANAGE_GUILD) !== 0n;
};

// /users/@me/guilds is tightly rate limited, and this runs on every dashboard request
export const getUserGuilds = async (userApi: REST, accessToken: string) => {
	const cached = cache.get(accessToken);
	if (cached && cached.expires > Date.now()) return cached.guilds;

	const guilds = (await userApi.get(Routes.userGuilds(), {
		authPrefix: "Bearer",
	})) as RESTGetAPICurrentUserGuildsResult;

	cache.set(accessToken, { guilds, expires: Date.now() + CACHE_TTL });

	for (const [token, entry] of cache) {
		if (entry.expires <= Date.now()) cache.delete(token);
	}

	return guilds;
};
