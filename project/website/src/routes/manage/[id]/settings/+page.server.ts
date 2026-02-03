import { GuildSchema } from "@riceball/db/zod";
import type { Actions } from "@sveltejs/kit";
import { fail, superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "../$types";

export const load: PageServerLoad = async ({ locals, params }) => {
	const guild = await locals.db.getGuildSettings(params.id);

	return { form: await superValidate(guild, zod(GuildSchema)) };
};

export const actions: Actions = {
	save: async ({ locals, params, request }) => {
		const form = await superValidate(request, zod(GuildSchema));

		if (!form.valid || !params.id) {
			return fail(400, { form });
		}

		await locals.db.setGuildSettings(params.id, { ...form.data });

		return { form };
	},
};
