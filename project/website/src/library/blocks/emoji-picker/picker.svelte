<script lang="ts">
  import {
    getActiveTheme,
    THEME_CHANGE_EVENT,
    type ThemeMode,
  } from "$lib/utility/theme";
  import { formatEmoji } from "@discordjs/formatters";
  import { CDN } from "@discordjs/rest";
  import type { APIGuild } from "discord-api-types/v10";
  import { onMount } from "svelte";

  let contentElement = $state<HTMLElement | null>(null);
  let pickerTheme = $state<ThemeMode>("dark");

  export type Emoji = {
    id: string;
    name: string;
    keywords: string[];
    native?: string;
    skins: { src: string }[];
  };

  type Props = {
    value?: string;
    guild: APIGuild;
    onEmojiPick?: (emoji: Emoji) => void;
  };

  const { guild = $bindable(), onEmojiPick }: Props = $props();

  const onEmojiSelect = (emoji: Emoji) => {
    if (onEmojiPick) {
      onEmojiPick(emoji);
    }
  };

  // biome-ignore lint/suspicious/noExplicitAny: dynamic import typing is loose here
  let Picker: any;

  onMount(async () => {
    const EmojiMart = await import("emoji-mart");
    Picker = EmojiMart.Picker;
  });

  onMount(() => {
    pickerTheme = getActiveTheme();

    const handleThemeChange = (event: Event) => {
      const nextTheme = (event as CustomEvent<{ theme: ThemeMode }>).detail
        ?.theme;
      if (!nextTheme || nextTheme === pickerTheme) {
        return;
      }

      pickerTheme = nextTheme;
      contentElement?.replaceChildren();
    };

    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);

    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    };
  });

  $effect(() => {
    const cdn = new CDN();

    if (contentElement && !contentElement.hasChildNodes()) {
      const emojis = guild.emojis.map((emoji) => ({
        id: emoji.id ? formatEmoji(emoji.id, emoji.animated) : undefined,
        name: emoji.name,
        keywords: [emoji.name],
        skins: [
          {
            src: emoji.id
              ? cdn.emoji(emoji.id, {
                  extension: emoji.animated ? "gif" : "png",
                })
              : undefined,
          },
        ],
      }));

      const picker = new Picker({
        icons: "solid",
        set: "twitter",
        onEmojiSelect,
        custom: [{ id: guild.id, name: guild.name, emojis }],
        maxFrequentRows: 0,
        categories: [
          guild.id,
          "people",
          "nature",
          "foods",
          "activity",
          "places",
          "objects",
          "symbols",
          "flags",
        ],
        emojiButtonRadius: "0.5rem",
        emojiButtonColors: ["var(--clr-bg-input-hover)"],
        skinTonePosition: "search",
        theme: pickerTheme,
        previewEmoji: "rice_ball",
      });
      contentElement.appendChild(picker as unknown as Node);
    }
  });
</script>

<div bind:this={contentElement}></div>
