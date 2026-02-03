import { Message } from "@riceball/db";
import type { Actions } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import { type APIWebhook, Routes } from "discord-api-types/v10";
import { superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";
import { z } from "zod/v4";
import type { PageServerLoad } from "./$types";

const MessageSchema = z.object({
	channelId: z.string(),
	content: z.string(),
	embeds: z.array(
		z.object({
			author: z.object({ icon_url: z.string(), name: z.string(), url: z.string() }),
			color: z.number(),
			description: z.string(),
			fields: z.array(z.object({ inline: z.boolean(), name: z.string(), value: z.string() })),
			footer: z.object({ icon_url: z.string(), text: z.string() }),
			image: z.object({ url: z.string() }),
			thumbnail: z.object({ url: z.string() }),
			timestamp: z.string(),
			title: z.string(),
			url: z.string(),
		}),
	),
	label: z.string(),
	webhook: z.object({ avatar: z.string().optional(), name: z.string().min(1).max(80).optional() }),
});

export const load: PageServerLoad = async ({ locals, params }) => {
	return {
		form: await superValidate(zod(MessageSchema)),
		webhooks: (await locals.api.get(Routes.guildWebhooks(params.id))) as APIWebhook[],
	};
};

export const actions: Actions = {
	save: async ({ params, request, locals }) => {
		const form = await superValidate(request, MessageSchema);

		if (!params.id || !form.valid) {
			return fail(400, { form });
		}

		const { webhook, channelId, content, embeds } = form.data;

		if (webhook.name) {
			const createdWebhook = (await locals.api.post(Routes.channelWebhooks(channelId), {
				body: { avatar: webhook.avatar, name: webhook.name },
			})) as APIWebhook;

			await locals.api.post(Routes.webhook(createdWebhook.id, createdWebhook.token), {
				body: { content, embeds },
			});
		} else {
			await locals.api.post(Routes.channelMessages(channelId), { body: { content, embeds } });
		}

		// const message = locals.db.em.create(Message, {
		//   content,
		//   embeds,
		//   guildId: params.id,
		//   channelId,
		//   messageId: "",
		// });

		return { form };
	},
};
