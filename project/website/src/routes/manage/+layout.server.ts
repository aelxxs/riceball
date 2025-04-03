import type { ManagedGuild } from "$lib/types";
import type { REST } from "@discordjs/rest";
import { type APIApplication, type RESTGetAPICurrentUserGuildsResult, Routes } from "discord-api-types/v10";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
	const [userGuilds, client] = await Promise.all([
		locals.userApi.get(Routes.userGuilds(), {
			authPrefix: "Bearer",
		}) as Promise<RESTGetAPICurrentUserGuildsResult>,
		locals.api.get(Routes.currentApplication()) as Promise<APIApplication>,
	]);

	const managedGuilds = (await Promise.all(
		userGuilds.map(async (guild) => {
			const hasManagePermissions = BigInt(guild.permissions) & BigInt(1 << 5);
			const riceball = hasManagePermissions ? await botInGuild(locals.api, guild.id) : false;

			return hasManagePermissions ? { ...guild, riceball } : null;
		}),
	)) as ManagedGuild[];

	return { guilds: managedGuilds.filter(Boolean), client };
};

async function botInGuild(api: REST, id: string) {
	try {
		await api.get(Routes.guild(id));
		return true;
	} catch (e) {
		return false;
	}
}
