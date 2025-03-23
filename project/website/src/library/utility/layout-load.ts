import type { DashboardGuild } from "$lib/types";
import { DiscordAPIError } from "@discordjs/rest";
import { redirect } from "@sveltejs/kit";
import { getGuild, type Guild } from "db";
import { ChannelType, Routes, type APIChannel } from "discord-api-types/v10";

export const reusableLayoutLoad = async ({ locals, params }) => {
  if (!/^\d{17,19}$/.test(params.id)) {
    throw redirect(308, "/manage");
  }

  try {
    // ! TODO: Replace this with custom cached API
    const [guild, channels, settings] = (await Promise.all([
      locals.api.get(Routes.guild(params.id)),
      locals.api.get(Routes.guildChannels(params.id)),
      getGuild(params.id),
    ])) as [DashboardGuild, APIChannel[], Guild];

    const textChannels = channels.filter((channel) => channel.type === ChannelType.GuildText);
    const categories = channels
      .filter((channel) => channel.type === ChannelType.GuildCategory)
      .map((category) => {
        console.log({ category });
        return {
          ...category,
          children: textChannels.filter(({ parent_id }) => parent_id === category.id),
        };
      });

    console.log({ categories });
    const uncategorizedTextChannels = textChannels.filter(({ parent_id }) => !parent_id);

    guild.settings = settings;
    guild.channels = channels;
    guild.itemizedChannels = [...uncategorizedTextChannels, ...categories].map((entity) => {
      if (entity.type === ChannelType.GuildCategory) {
        return {
          label: entity.name,
          items: entity.children.map((channel) => ({
            value: channel.id,
            label: channel.name ?? "Unknown",
          })),
        };
      } else {
        return { value: entity.id, label: entity.name };
      }
    });
    guild.itemizedRoles = guild.roles
      .filter((role) => role.id !== guild.id)
      .map((role) => ({ value: role.id, label: role.name, color: role.color }));

    return { guild: guild as DashboardGuild };
  } catch (error) {
    console.log({ error });
    if (error instanceof DiscordAPIError) {
      switch (error.status) {
        case 403:
          throw redirect(308, `/invite?id=${params.id}`);
      }
    }
    throw redirect(308, "/manage");
  }
};
