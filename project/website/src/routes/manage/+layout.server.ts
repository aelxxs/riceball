import type { REST } from "@discordjs/rest";
import { type APIApplication, type RESTGetAPICurrentUserGuildsResult, Routes } from "discord-api-types/v10";
import type { ManagedGuild } from "$lib/types";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
	const [userGuilds, client] = await Promise.all([
		locals.userApi.get(Routes.userGuilds(), {
			authPrefix: "Bearer",
		}) as Promise<RESTGetAPICurrentUserGuildsResult>,
		locals.api.get(Routes.currentApplication()) as Promise<APIApplication>,
	]);

	// Filter guilds with manage permissions first
	const guildsWithManagePerms = userGuilds.filter((guild) => {
		return BigInt(guild.permissions) & BigInt(1 << 5);
	});

	// Check bot presence in all managed guilds in parallel
	const riceballChecks = await Promise.all(guildsWithManagePerms.map((guild) => botInGuild(locals.api, guild.id)));

	// Combine results
	const managedGuilds: ManagedGuild[] = guildsWithManagePerms.map((guild, index) => ({
		...guild,
		riceball: riceballChecks[index],
	}));

	return {
		guilds: managedGuilds,
		client,
	};
};

async function botInGuild(api: REST, id: string) {
	try {
		await api.get(Routes.guild(id));
		return true;
	} catch (e) {
		return false;
	}
}
