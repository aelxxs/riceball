import { StarsSchema } from "@riceball/db/zod";
import { type Actions, fail } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, params }) => {
	const { stars } = await locals.db.getGuildSettings(params.id);

	return {
		form: await superValidate(stars, zod(StarsSchema)),
	};
};

export const actions: Actions = {
	async save({ locals, request, params }) {
		const form = await superValidate(request, zod(StarsSchema));

		if (!form.valid || !params.id) {
			return fail(400, { form });
		}

		await locals.db.setGuildSettings(params.id, {
			stars: form.data,
		});

		return { form };
	},
};
