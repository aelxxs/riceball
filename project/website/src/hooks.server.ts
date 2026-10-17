import "reflect-metadata";

import { REST } from "@discordjs/rest";
import { container, Database, setupDatabase } from "@riceball/db";
import { error, type Handle, redirect } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { env } from "$env/dynamic/private";
import { canManageGuild, getUserGuilds } from "$lib/server/permissions";
import { handle as authenticationHandle } from "./auth";

const authorizationHandle: Handle = async ({ event, resolve }) => {
	const pathname = event.url.pathname;
	const needsDb =
		pathname.startsWith("/manage") || pathname.startsWith("/leaderboard") || pathname.startsWith("/profile");

	if (needsDb) {
		await setupDatabase({
			mongoUrl: env.MONGO_URL,
			redisUrl: env.REDIS_URL,
		});

		event.locals.api = new REST().setToken(env.DISCORD_TOKEN);
		event.locals.db = container.resolve(Database);
	}

	if (pathname.startsWith("/manage") || pathname.startsWith("/profile")) {
		const session = await event.locals.auth();

		if (!session) {
			throw redirect(303, "/");
		}

		event.locals.userApi = new REST().setToken(session.accessToken);
		event.locals.session = session;

		const guildId = pathname.match(/^\/manage\/(\d{17,20})(?:\/|$)/)?.[1];

		if (guildId) {
			const guilds = await getUserGuilds(event.locals.userApi, session.accessToken);
			const guild = guilds.find(({ id }) => id === guildId);

			if (!guild || !canManageGuild(guild)) {
				error(403, "You don't have permission to manage this server.");
			}
		}
	}

	return resolve(event);
};

export const handle: Handle = sequence(authenticationHandle, authorizationHandle);
