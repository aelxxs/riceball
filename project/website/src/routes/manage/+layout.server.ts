import type { ManagedGuild } from "$lib/types";
import type { REST } from "@discordjs/rest";
import { type APIApplication, type RESTGetAPICurrentUserGuildsResult, Routes } from "discord-api-types/v10";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
	const userGuilds = (await locals.userApi.get(Routes.userGuilds(), {
		authPrefix: "Bearer",
	})) as RESTGetAPICurrentUserGuildsResult;
	const client = (await locals.api.get(Routes.currentApplication())) as APIApplication;

	const managedGuilds = (await Promise.all(
		userGuilds
			.filter(({ permissions }) => {
				return BigInt(permissions) & BigInt(1 << 5);
			})
			.map(async (guild) => {
				return {
					...guild,
					riceball: await botInGuild(locals.api, guild.id),
				};
			}),
	)) as ManagedGuild[];

	return { guilds: managedGuilds, client };
};

async function botInGuild(api: REST, id: string) {
	try {
		await api.get(Routes.guild(id));
		return true;
	} catch (e) {
		return false;
	}
}
