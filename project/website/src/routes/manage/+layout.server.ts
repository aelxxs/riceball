import type { REST } from "@discordjs/rest";
import { type APIApplication, Routes } from "discord-api-types/v10";
import { canManageGuild, getUserGuilds } from "$lib/server/permissions";
import type { ManagedGuild } from "$lib/types";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
	const [userGuilds, client] = await Promise.all([
		getUserGuilds(locals.userApi, locals.session.accessToken),
		locals.api.get(Routes.currentApplication()) as Promise<APIApplication>,
	]);

	const guildsWithManagePerms = userGuilds.filter(canManageGuild);

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
