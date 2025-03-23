// src/stores/emojiPickerStore.ts
import { CDN } from "@discordjs/rest";
import type { APIGuild } from "discord-api-types/v10";
import type { Picker } from "emoji-mart";
import { writable } from "svelte/store";

let globalPicker: Picker | null = null;
export const emojiPicker = writable<Picker | null>(null);
const cdn = new CDN();

export async function initializeEmojiPicker(onEmojiSelect: (emoji: any) => void, guild: APIGuild) {
  if (!globalPicker) {
    const EmojiMart = await import("emoji-mart");

    const emojis = guild.emojis.map((emoji) => ({
      id: emoji.id,
      name: emoji.name,
      keywords: [emoji.name],
      skins: [
        {
          src: cdn.emoji(emoji.id!, {
            extension: emoji.animated ? "gif" : "png",
          }),
        },
      ],
    }));

    globalPicker = new EmojiMart.Picker({
      icons: "solid",
      set: "twitter",
      onEmojiSelect,
      custom: [{ id: guild.id, name: guild.name, emojis }],
      maxFrequentRows: 0,
      categories: [guild.id, "people", "nature", "foods", "activity", "places", "objects", "symbols", "flags"],
      emojiButtonRadius: "0.5rem",
      emojiButtonColors: ["var(--clr-bg-input-hover)"],
      skinTonePosition: "search",
      theme: "dark",
    });

    emojiPicker.set(globalPicker);
  }
  return globalPicker;
}
