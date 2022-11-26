import { Injectors } from "@lib/util";
import { Client } from "@spectacles/proxy";
import { APIGuild, APIUser, Routes } from "discord-api-types/v10";
import { Redis } from "ioredis";
import { container } from "tsyringe";

export async function getGuild(id: string): Promise<APIGuild> {
	const redis = container.resolve<Redis>(Injectors.Redis);
	const rest = container.resolve<Client>(Injectors.Rest);

	const cached = await redis.get(`API:guild:${id}`);

	if (cached) {
		return JSON.parse(cached) as APIGuild;
	}

	const guild = await rest.get(Routes.guild(id));
	await redis.set(`API:guild:${id}`, JSON.stringify(guild));

	return guild as APIGuild;
}

export function getGuildIcon(guild: APIGuild) {
	return guild.icon ? "" : "";
}

export function getUserAvatar(user: APIUser) {
	return user.avatar ? "" : "";
}
