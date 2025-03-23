import type { Actions } from "@sveltejs/kit";
import { getGuild, updateGuild } from "db";
import { LevelsWithRelationsSchema } from "db/custom";
import { fail, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const { levels } = await getGuild(params.id);

  return {
    form: await superValidate(levels, zod(LevelsWithRelationsSchema)),
  };
};

export const actions: Actions = {
  save: async ({ params, request }) => {
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

    delete form.data.rankCardWrapperImage;

    await updateGuild(params.id, {
      levels: { ...form.data },
    });

    return { form };
  },
};

// upload image to bunny cdn
const uploadImage = async (image: string, filename: string, guildId: string) => {};
