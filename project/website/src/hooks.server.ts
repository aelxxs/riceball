import { DISCORD_TOKEN } from "$env/static/private";
import { REST } from "@discordjs/rest";
import { Redis } from "@spectacles/brokers";
import { redirect, type Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import RedisClient from "ioredis";
import { handle as authenticationHandle } from "./auth";

const authorizationHandle: Handle = async ({ event, resolve }) => {
  if (event.url.pathname.startsWith("/manage")) {
    const session = await event.locals.auth();

    if (!session) {
      throw redirect(303, "/");
    }

    event.locals.api = new REST().setToken(DISCORD_TOKEN);
    event.locals.userApi = new REST().setToken(session.accessToken);
    event.locals.session = session;

    const redis = new RedisClient("localhost");
    const gateway = new Redis("website", redis);

    event.locals.gateway = gateway;
  }

  return resolve(event);
};

export const handle: Handle = sequence(authenticationHandle, authorizationHandle);
