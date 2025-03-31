import { MessageWithRelationsSchema } from "@riceball/db/zod";
import type { Actions } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { z } from "zod";
import type { PageServerLoad } from "./$types";

const MessageSchema = z.object({
	label: z.string(),
	content: z.string(),
	channelId: z.string(),
	embeds: z.array(
		z.object({
			title: z.string(),
			description: z.string(),
			fields: z.array(
				z.object({
					name: z.string(),
					value: z.string(),
					inline: z.boolean(),
				}),
			),
			image: z.object({
				url: z.string(),
			}),
			thumbnail: z.object({
				url: z.string(),
			}),
			footer: z.object({
				text: z.string(),
				icon_url: z.string(),
			}),
		}),
	),
});

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(MessageSchema)),
	};
};

export const actions: Actions = {
	save: async ({ params, request, locals }) => {
		const form = await superValidate(request, zod(MessageSchema));

		if (!params.id || !form.valid) {
			return fail(400, { form });
		}

		// send message to discord and get message id
		// gateway.emit()

		// create reaction role in db

		return { form };
	},
};
