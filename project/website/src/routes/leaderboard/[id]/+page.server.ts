import type { REST } from "@discordjs/rest";
import { fallbackProfile, fetchUserProfile } from "$lib/server/discord-profiles";
import { getLevel } from "$lib/server/levels";
import type { PageServerLoad } from "./$types";

const LEVEL_LIMIT = 100;

export const load: PageServerLoad = async ({ params, locals }) => {
	const rest = locals.api as REST | undefined;
	const demoUserId = "406665840088317962";

	const members = await locals.db.rm.members.find(
		{ guildId: params.id },
		{ orderBy: { exp: "DESC" }, limit: LEVEL_LIMIT },
	);

	// When no data exists, provide mock users so the page has something to render.
	const seededMembers =
		members.length > 2
			? members
			: [
					{ guildId: params.id, userId: demoUserId, exp: 1800 },
					...Array.from({ length: 11 }).map((_, idx) => ({
						guildId: params.id,
						userId: `1000000000000${idx + 1}`,
						exp: 1400 - idx * 90,
					})),
				];

	const shouldUseRest = members.length > 2;

	// Fetch top 15 profiles for nicer display; fall back to placeholder names for the rest.
	const topIds = seededMembers.slice(0, 15).map((m) => m.userId);
	const profiles = await Promise.all(
		topIds.map((id) => fetchUserProfile(id, rest && (shouldUseRest || id === demoUserId) ? rest : undefined)),
	);
	const profileMap = new Map(profiles.map((p) => [p.id, p]));

	const leaderboard = seededMembers.map((member, index) => {
		const profile = profileMap.get(member.userId) ?? fallbackProfile(member.userId);
		return {
			rank: index + 1,
			userId: member.userId,
			name: profile.name,
			avatar: profile.avatar,
			exp: member.exp ?? 0,
			level: getLevel(member.exp ?? 0),
		};
	});

	return {
		guildId: params.id,
		leaderboard,
	};
};
