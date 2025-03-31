import { getGuild, updateGuild } from "@riceball/db";
import { StarsWithRelationsSchema } from "@riceball/db/zod";
import { type Actions, fail } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
	// const { stars } = await getGuild(params.id);

	return {
		// form: await superValidate(stars, zod(StarsWithRelationsSchema)),
		form: await superValidate(zod(StarsWithRelationsSchema)),
	};
};

export const actions: Actions = {
	async save(event) {
		const form = await superValidate(event, zod(StarsWithRelationsSchema));

		if (!form.valid || !event.params?.id) {
			return fail(400, {
				form,
			});
		}

		// await updateGuild(event.params.id, {
		// 	stars: { ...form.data },
		// });

		return { form };
	},
};
