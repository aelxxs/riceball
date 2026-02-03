import "reflect-metadata";

import { REST } from "@discordjs/rest";
import { container, Database, setupDatabase } from "@riceball/db";
import { type Handle, redirect } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { env } from "$env/dynamic/private";
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
	}

	return resolve(event);
};

export const handle: Handle = sequence(authenticationHandle, authorizationHandle);
