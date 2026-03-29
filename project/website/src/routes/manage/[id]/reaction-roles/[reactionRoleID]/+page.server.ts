import { ReactionRole, type ReactionRoleType } from "@riceball/db";
import { type ReactionRole as ReactionRoleFormData, ReactionRoleSchema } from "@riceball/db/zod";
import type { Actions } from "@sveltejs/kit";
import { error, fail } from "@sveltejs/kit";
import { type APIMessage, Routes } from "discord-api-types/v10";
import { superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";
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

    const { channelId, messageContent, messageEmbed } = form.data;
    let nextChannelId = reactionRole.channelId;
    let nextMessageId = reactionRole.messageId;

    if (channelId !== reactionRole.channelId) {
      const message = (await locals.api.post(Routes.channelMessages(channelId), {
        body: {
          content: messageContent,
          embeds: messageEmbed ? [messageEmbed] : [],
        },
      })) as APIMessage;

      nextChannelId = channelId;
      nextMessageId = message.id;

      try {
        await locals.api.delete(Routes.channelMessage(reactionRole.channelId, reactionRole.messageId));
      } catch {
        // Ignore failures deleting old message so save can continue.
      }
    } else {
      await locals.api.patch(Routes.channelMessage(reactionRole.channelId, reactionRole.messageId), {
        body: {
          content: messageContent,
          embeds: messageEmbed ? [messageEmbed] : [],
        },
      });
    }

    try {
      await locals.api.delete(Routes.channelMessageAllReactions(nextChannelId, nextMessageId));
    } catch {
      // It's fine if there were no previous reactions.
    }

    const emojis = form.data.pairs.map((pair) => pair.emoji).filter((emoji) => emoji.length > 0);
    await Promise.all(
      emojis.map((emoji) =>
        locals.api.put(Routes.channelMessageOwnReaction(nextChannelId, nextMessageId, encodeURIComponent(emoji))),
      ),
    );

    reactionRole.alias = form.data.alias;
    reactionRole.channelId = nextChannelId;
    reactionRole.enabled = form.data.enabled;
    reactionRole.messageContent = form.data.messageContent;
    reactionRole.messageEmbed = form.data.messageEmbed ?? undefined;
    reactionRole.messageId = nextMessageId;
    reactionRole.pairs = form.data.pairs;
    reactionRole.type = form.data.type as ReactionRoleType;

    await database.persist(reactionRole).flush();

    return { form };
  },
};
