import { container, ReactionRole, ReactionRoleType, RepositoryManager } from "@riceball/db";
import { ReactionRoleSchema } from "@riceball/db/zod";
import type { Actions } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import { type APIMessage, Routes } from "discord-api-types/v10";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(
			{
				type: "TOGGLE",
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

		// locals.gateway.publish("SEND_MESSAGE", {
		// 	channelId: "1335328915803209821",
		// });

		if (!form.valid || !params.id) {
			return fail(400, {
				form,
			});
		}

		const { channelId } = form.data;

		const db = container.resolve(RepositoryManager);

		const reactionRoleRepository = db.em.getRepository(ReactionRole);

		const message = (await locals.api.post(Routes.channelMessages(channelId), {
			body: {
				content: form.data.messageContent,
			},
		})) as APIMessage;

		console.log({ messageId: message.id });

		for (const pair of form.data.pairs) {
			await locals.api.put(
				Routes.channelMessageOwnReaction(channelId, message.id, encodeURIComponent(pair.emoji)),
			);
		}
		// create the reaction role

		const reactionRole = reactionRoleRepository.create({
			...form.data,
			guildId: params.id,
			messageId: message.id,
			pairs: form.data.pairs,
		});

		await db.em.persistAndFlush(reactionRole);

		// react to the message

		return { form };
	},
};
