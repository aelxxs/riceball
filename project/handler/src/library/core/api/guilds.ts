import { Client } from "@spectacles/proxy";
import { APIGuild, APIUser, Routes } from "discord-api-types/v10";
import { Redis } from "ioredis";
import { Injectors } from "@lib/common";
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
	if (!guild.icon) return undefined;

	return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`;
}

export function getUserAvatar(user: APIUser) {
	if (!user.avatar) return `https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator) % 5}.png`;

	return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
}
