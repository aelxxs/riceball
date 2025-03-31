import "reflect-metadata";

import { env } from "$env/dynamic/private";
import { REST } from "@discordjs/rest";
import { Database, container, setupDatabase } from "@riceball/db";
import { type Handle, redirect } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { handle as authenticationHandle } from "./auth.js";

const authorizationHandle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith("/manage")) {
		await setupDatabase({
			mongoUrl: env.MONGO_URL,
			redisUrl: env.REDIS_URL,
		});

		const session = await event.locals.auth();

		if (!session) {
			throw redirect(303, "/");
		}

		event.locals.api = new REST().setToken(env.DISCORD_TOKEN);
		event.locals.userApi = new REST().setToken(session.accessToken);
		event.locals.session = session;
		event.locals.db = container.resolve(Database);

		// const redis = new RedisClient("localhost");
		// const gateway = new Redis("website", redis);

		// event.locals.gateway = gateway;
	}

	return resolve(event);
};

export const handle: Handle = sequence(authenticationHandle, authorizationHandle);
