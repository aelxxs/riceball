import { EconomyWithRelationsSchema } from "@riceball/db/zod";
import type { Actions } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
	const { economy } = await locals.db.getGuildSettings(params.id);

	return {
		form: await superValidate(economy, zod(EconomyWithRelationsSchema)),
	};
};

export const actions: Actions = {
	save: async ({ params, request, locals }) => {
		const form = await superValidate(request, zod(EconomyWithRelationsSchema));

		if (!form.valid || !params.id) {
			return fail(400, {
				form,
			});
		}

		await locals.db.setGuildSettings(params.id, {
			economy: form.data,
		});

		return { form };
	},
};
