import { ReactionRoleSchema } from "@riceball/db/zod";
import type { Actions } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(
			{
				type: "NORMAL",
				pairs: [{ emoji: "🍙", roles: [] }],
				messageContent: "React to this message to get your roles!",
				alias: "New Reaction Role",
			},
			zod(ReactionRoleSchema),
		),
	};
};

export const actions: Actions = {
	save: async ({ params, request, locals }) => {
		const form = await superValidate(request, zod(ReactionRoleSchema));

		locals.gateway.publish("SEND_MESSAGE", {
			channelId: "1335328915803209821",
		});

		if (!form.valid || !params.id) {
			return fail(400, {
				form,
			});
		}

		const { channelId } = form.data;
		// send message to discord and get message id
		// gateway.emit()

		// create reaction role in db

		return { form };
	},
};
