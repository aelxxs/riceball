import { fail, type Actions } from "@sveltejs/kit";
import { getGuild, updateGuild } from "db";
import { StarsWithRelationsSchema } from "db/zod";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const { stars } = await getGuild(params.id);

  return {
    form: await superValidate(stars, zod(StarsWithRelationsSchema)),
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

    await updateGuild(event.params.id, {
      stars: { ...form.data },
    });

    return { form };
  },
};
