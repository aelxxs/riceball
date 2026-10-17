import { ReactionRole, type ReactionRoleType } from "@riceball/db";
import { ReactionRoleSchema } from "@riceball/db/zod";
import type { Actions } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import { type APIMessage, Routes } from "discord-api-types/v10";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";
import { describeDiscordError, toReactionParam, validateReactionPairs } from "$lib/server/reaction-emoji";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(
			{
				alias: "New Reaction Role",
				enabled: true,
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

		const { alias, channelId, messageContent, messageEmbed, pairs, type } = form.data;

		const invalid = validateReactionPairs(pairs);
		if (invalid) {
			return message(form, invalid, { status: 400 });
		}

		let posted: APIMessage;
		try {
			posted = (await locals.api.post(Routes.channelMessages(channelId), {
				body: { content: messageContent, embeds: messageEmbed ? [messageEmbed] : [] },
			})) as APIMessage;
		} catch (error) {
			return message(form, `Couldn't send the message: ${describeDiscordError(error)}`, { status: 502 });
		}

		// Sequential so the reactions appear in the same order as the pairs.
		for (const pair of pairs) {
			try {
				await locals.api.put(Routes.channelMessageOwnReaction(channelId, posted.id, toReactionParam(pair.emoji)));
			} catch (error) {
				await locals.api.delete(Routes.channelMessage(channelId, posted.id)).catch(() => {});
				return message(form, `Couldn't react with ${pair.emoji}: ${describeDiscordError(error)}`, {
					status: 502,
				});
			}
		}

		const database = locals.db.rm.em.fork();
		const reactionRole = database.create(ReactionRole, {
			alias,
			channelId,
			enabled: true,
			guildId: params.id,
			messageContent,
			messageEmbed: messageEmbed || null,
			messageId: posted.id,
			pairs,
			type: type as ReactionRoleType,
		});

		await database.persist(reactionRole).flush();

		return { form };
	},
};
