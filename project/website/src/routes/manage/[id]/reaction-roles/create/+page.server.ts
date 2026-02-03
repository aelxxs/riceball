import { container, ReactionRole, ReactionRoleType, RepositoryManager } from "@riceball/db";
import { ReactionRoleSchema } from "@riceball/db/zod";
import type { Actions } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import { type APIMessage, Routes } from "discord-api-types/v10";
import { superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(
			{
				alias: "New Reaction Role",
				messageContent: "React to this message to get your roles!",
				pairs: [{ emoji: "✅", roles: [] }],
				type: "TOGGLE",
			},
			zod(ReactionRoleSchema),
		),
	};
};

export const actions: Actions = {
	save: async ({ params, request, locals }) => {
		const form = await superValidate(request, zod(ReactionRoleSchema));

		if (!form.valid || !params.id) {
			return fail(400, { form });
		}

		const { channelId, messageContent, messageEmbed } = form.data;

		const db = container.resolve(RepositoryManager);

		const reactionRoleRepository = db.em.getRepository(ReactionRole);

		const message = (await locals.api.post(Routes.channelMessages(channelId), {
			body: { content: messageContent, embeds: messageEmbed ? [messageEmbed] : [] },
		})) as APIMessage;

		await Promise.all(
			form.data.pairs.map((pair) =>
				locals.api.put(Routes.channelMessageOwnReaction(channelId, message.id, encodeURIComponent(pair.emoji))),
			),
		);

		const reactionRole = reactionRoleRepository.create({
			...form.data,
			guildId: params.id,
			messageContent,
			messageEmbed: messageEmbed || null,
			messageId: message.id,
			type: ReactionRoleType.TOGGLE,
		});

		console.log("creating reaction role", {
			...form.data,
			guildId: params.id,
			messageContent,
			messageEmbed: messageEmbed || null,
			messageId: message.id,
			type: ReactionRoleType.TOGGLE,
		});

		await db.em.persistAndFlush(reactionRole);

		return { form };
	},
};
