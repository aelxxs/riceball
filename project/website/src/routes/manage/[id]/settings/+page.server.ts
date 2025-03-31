import { getGuild, updateGuild } from "@riceball/db";
import { GuildSchema, GuildWithRelationsSchema } from "@riceball/db/zod";
import type { Actions } from "@sveltejs/kit";
import { fail, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "../$types";

export const load: PageServerLoad = async ({ locals, params }) => {
	const guild = await locals.db.getGuildSettings(params.id);

	return {
		// form: await superValidate(guild, zod(GuildWithRelationsSchema)),
		form: await superValidate(zod(GuildWithRelationsSchema)),
	};
};

export const actions: Actions = {
	save: async ({ params, request }) => {
		const form = await superValidate(request, zod(GuildWithRelationsSchema));

		if (!form.valid || !params.id) {
			return fail(400, {
				form,
			});
		}

		// await updateGuild(params.id, {
		// 	...form.data,
		// });

		return { form };
	},
};
