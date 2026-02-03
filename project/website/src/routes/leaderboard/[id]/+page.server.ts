import type { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import type { PageServerLoad } from "./$types";

const LEVEL_LIMIT = 100;

async function fetchUserProfile(userId: string, rest?: REST) {
	if (!rest) {
		return {
			id: userId,
			name: `User ${userId.slice(-4)}`,
			avatar: `https://cdn.discordapp.com/embed/avatars/${Number(userId) % 5}.png`,
		};
	}

	try {
		const user = (await rest.get(Routes.user(userId))) as {
			id: string;
			username: string;
			global_name?: string;
			avatar?: string;
		};
		return {
			id: user.id,
			name: user.global_name || user.username,
			avatar: user.avatar
				? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`
				: `https://cdn.discordapp.com/embed/avatars/${Number(user.id) % 5}.png`,
		};
	} catch (error) {
		// Avoid noisy logs for placeholder/mock IDs that 404 (Unknown User).
		const code =
			typeof error === "object" && error && "code" in error ? (error as { code?: number }).code : undefined;
		if (code !== 10013) {
			console.error("Failed to fetch user profile", { userId, error });
		}
		return {
			id: userId,
			name: `User ${userId.slice(-4)}`,
			avatar: `https://cdn.discordapp.com/embed/avatars/${Number(userId) % 5}.png`,
		};
	}
}

function expToLevel(exp = 0) {
	// Simple leveling curve; adjust as needed to match production logic
	return Math.floor((exp / 50) ** 0.5) + 1;
}

export const load: PageServerLoad = async ({ params, locals }) => {
	const rest = locals.api as REST | undefined;
	const demoUserId = "406665840088317962";

	const members = await locals.db.rm.members.find(
		{ guildId: params.id },
		{ orderBy: { exp: "DESC" }, limit: LEVEL_LIMIT },
	);

	console.log({ members });

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
		const profile = profileMap.get(member.userId);
		return {
			rank: index + 1,
			userId: member.userId,
			name: profile?.name ?? `User ${member.userId.slice(-4)}`,
			avatar: profile?.avatar ?? `https://cdn.discordapp.com/embed/avatars/${Number(member.userId) % 5}.png`,
			exp: member.exp ?? 0,
			level: expToLevel(member.exp ?? 0),
		};
	});

	return {
		guildId: params.id,
		leaderboard,
	};
};
