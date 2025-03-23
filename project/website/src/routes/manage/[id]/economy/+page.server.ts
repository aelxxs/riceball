import type { Actions } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import { getGuild, updateGuild } from "db";
import { EconomyWithRelationsSchema } from "db/zod";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const { economy } = await getGuild(params.id);

  return {
    form: await superValidate(economy, zod(EconomyWithRelationsSchema)),
  };
};

export const actions: Actions = {
  save: async ({ params, request }) => {
    const form = await superValidate(request, zod(EconomyWithRelationsSchema));

    if (!form.valid || !params.id) {
      return fail(400, {
        form,
      });
    }

    await updateGuild(params.id, {
      economy: { ...form.data },
    });

    return { form };
  },
};
