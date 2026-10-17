import { type Actions, fail } from "@sveltejs/kit";
import { getLeaderboardPage } from "$lib/server/leaderboard";
import type { PageServerLoad } from "./$types";

const PAGE_SIZE = 25;

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const page = Number(url.searchParams.get("page") ?? 1);

	return {
		leaderboard: await getLeaderboardPage(locals.db, params.id, {
			page,
			pageSize: PAGE_SIZE,
			rest: locals.api,
		}),
	};
};

export const actions: Actions = {
	resetExp: async ({ locals, params, request }) => {
		const userId = (await request.formData()).get("userId");

		if (!params.id || typeof userId !== "string" || !/^\d{17,20}$/.test(userId)) {
			return fail(400, { message: "Invalid member." });
		}

		await locals.db.setMemberSettings(params.id, userId, { exp: 0 });

		return { userId };
	},
};
