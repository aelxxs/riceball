import { ReactionRole, type ReactionRoleType } from "@riceball/db";
import { type ReactionRole as ReactionRoleFormData, ReactionRoleSchema } from "@riceball/db/zod";
import type { Actions } from "@sveltejs/kit";
import { error, fail } from "@sveltejs/kit";
import { type APIMessage, Routes } from "discord-api-types/v10";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";
import { describeDiscordError, emojiKey, toReactionParam, validateReactionPairs } from "$lib/server/reaction-emoji";
import type { PageServerLoad } from "./$types";

const resolveReactionRole = async (
	em: {
		findOne: (entity: typeof ReactionRole, where: { guildId: string; _id: string }) => Promise<ReactionRole | null>;
	},
	guildId: string,
	reactionRoleId: string,
) => {
	return em.findOne(ReactionRole, { guildId, _id: reactionRoleId });
};

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!params.id || !params.reactionRoleID) {
		throw error(404, "Reaction role not found");
	}

	const database = locals.db.rm.em.fork();
	const reactionRole = await resolveReactionRole(database, params.id, params.reactionRoleID);

	if (!reactionRole) {
		throw error(404, "Reaction role not found");
	}

	const role = JSON.parse(JSON.stringify(reactionRole)) as Partial<ReactionRoleFormData>;
	const initialData: ReactionRoleFormData = {
		alias: role.alias ?? "Reaction Role",
		channelId: role.channelId ?? "",
		enabled: role.enabled ?? true,
		messageContent: role.messageContent ?? "",
		messageEmbed: role.messageEmbed ?? null,
		pairs: role.pairs ?? [{ emoji: "✅", roles: [] }],
		type: role.type ?? "TOGGLE",
	};

	return {
		form: await superValidate(initialData, zod(ReactionRoleSchema)),
	};
};

export const actions: Actions = {
	save: async ({ locals, params, request }) => {
		const form = await superValidate(request, zod(ReactionRoleSchema));

		if (!form.valid || !params.id || !params.reactionRoleID) {
			return fail(400, { form });
		}

		const database = locals.db.rm.em.fork();
		const reactionRole = await resolveReactionRole(database, params.id, params.reactionRoleID);

		if (!reactionRole) {
			throw error(404, "Reaction role not found");
		}

		const { channelId, messageContent, messageEmbed, pairs } = form.data;

		const invalid = validateReactionPairs(pairs);
		if (invalid) {
			return message(form, invalid, { status: 400 });
		}

		const body = { content: messageContent, embeds: messageEmbed ? [messageEmbed] : [] };
		const previous = { channelId: reactionRole.channelId, messageId: reactionRole.messageId };
		const moved = channelId !== previous.channelId;
		const failedReactions: string[] = [];
		let nextMessageId = previous.messageId;

		if (moved) {
			try {
				const posted = (await locals.api.post(Routes.channelMessages(channelId), { body })) as APIMessage;
				nextMessageId = posted.id;
			} catch (error) {
				return message(form, `Couldn't send the message: ${describeDiscordError(error)}`, { status: 502 });
			}

			for (const pair of pairs) {
				try {
					await locals.api.put(
						Routes.channelMessageOwnReaction(channelId, nextMessageId, toReactionParam(pair.emoji)),
					);
				} catch (error) {
					await locals.api.delete(Routes.channelMessage(channelId, nextMessageId)).catch(() => {});
					return message(form, `Couldn't react with ${pair.emoji}: ${describeDiscordError(error)}`, {
						status: 502,
					});
				}
			}
		} else {
			try {
				await locals.api.patch(Routes.channelMessage(channelId, nextMessageId), { body });
			} catch (error) {
				return message(form, `Couldn't update the message: ${describeDiscordError(error)}`, { status: 502 });
			}

			// Only drop reactions for removed emojis so members keep their reactions on unchanged pairs.
			const kept = new Set(pairs.map((pair) => emojiKey(pair.emoji)));
			for (const pair of reactionRole.pairs) {
				if (kept.has(emojiKey(pair.emoji))) continue;
				await locals.api
					.delete(Routes.channelMessageReaction(channelId, nextMessageId, toReactionParam(pair.emoji)))
					.catch(() => {});
			}

			for (const pair of pairs) {
				try {
					await locals.api.put(
						Routes.channelMessageOwnReaction(channelId, nextMessageId, toReactionParam(pair.emoji)),
					);
				} catch {
					failedReactions.push(pair.emoji);
				}
			}
		}

		reactionRole.alias = form.data.alias;
		reactionRole.channelId = channelId;
		reactionRole.enabled = form.data.enabled;
		reactionRole.messageContent = form.data.messageContent;
		reactionRole.messageEmbed = form.data.messageEmbed ?? undefined;
		reactionRole.messageId = nextMessageId;
		reactionRole.pairs = pairs;
		reactionRole.type = form.data.type as ReactionRoleType;

		await database.persist(reactionRole).flush();

		// Deleted only after the new message id is saved, so the bot's cleanup of the old message matches nothing.
		if (moved) {
			await locals.api.delete(Routes.channelMessage(previous.channelId, previous.messageId)).catch(() => {});
		}

		if (failedReactions.length) {
			return message(form, `Saved, but couldn't react with ${failedReactions.join(" ")}.`, { status: 502 });
		}

		return { form };
	},
};
