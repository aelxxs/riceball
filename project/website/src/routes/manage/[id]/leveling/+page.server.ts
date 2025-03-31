import { getGuild, updateGuild } from "@riceball/db";
import { LevelsWithRelationsSchema } from "@riceball/db/custom";
import type { Actions } from "@sveltejs/kit";
import { fail, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, params }) => {
	const { levels } = await locals.db.getGuildSettings(params.id);

	return {
		form: await superValidate(levels, zod(LevelsWithRelationsSchema)),
		// form: await superValidate(zod(LevelsWithRelationsSchema)),
	};
};

export const actions: Actions = {
	save: async ({ locals, params, request }) => {
		const form = await superValidate(request, zod(LevelsWithRelationsSchema));

		if (!form.valid || !params.id) {
			return fail(400, {
				form,
			});
		}

		const wrapperImage = form.data.rankCard.wrapperImage;
		const isDataURL = wrapperImage?.startsWith("data:");

		if (wrapperImage && isDataURL) {
		}

		await locals.db.setGuildSettings(params.id, {
			levels: { ...form.data },
		});

		return { form };
	},
};

// upload image to bunny cdn
const uploadImage = async (image: string, filename: string, guildId: string) => {};
