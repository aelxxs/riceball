import type { REST } from "@discordjs/rest";
import type { Database } from "@riceball/db";
import { fetchMemberProfile } from "./discord-profiles";
import { getLevelProgress } from "./levels";

export type LeaderboardEntry = {
	rank: number;
	userId: string;
	name: string;
	avatar: string;
	inGuild: boolean;
	exp: number;
	level: number;
	progress: number;
	required: number;
};

export type LeaderboardPage = {
	entries: LeaderboardEntry[];
	page: number;
	pageSize: number;
	pageCount: number;
	total: number;
};

export async function getLeaderboardPage(
	db: Database,
	guildId: string,
	{ page = 1, pageSize = 25, rest }: { page?: number; pageSize?: number; rest?: REST } = {},
): Promise<LeaderboardPage> {
	const where = { guildId, exp: { $gt: 0 } };
	const total = await db.rm.members.count(where);
	const pageCount = Math.max(1, Math.ceil(total / pageSize));
	const current = Math.min(Math.max(1, Math.floor(page) || 1), pageCount);
	const offset = (current - 1) * pageSize;

	const members = total
		? await db.rm.members.find(where, {
				orderBy: { exp: "DESC", userId: "ASC" },
				limit: pageSize,
				offset,
			})
		: [];

	const profiles = await Promise.all(members.map((m) => fetchMemberProfile(guildId, m.userId, rest)));

	const entries = members.map((member, index) => {
		const exp = member.exp ?? 0;
		const profile = profiles[index];
		return {
			rank: offset + index + 1,
			userId: member.userId,
			name: profile.name,
			avatar: profile.avatar,
			inGuild: profile.inGuild ?? true,
			exp,
			...getLevelProgress(exp),
		};
	});

	return { entries, page: current, pageSize, pageCount, total };
}
