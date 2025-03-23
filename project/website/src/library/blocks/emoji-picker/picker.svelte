<script lang="ts">
  import { formatEmoji } from "@discordjs/formatters";
  import { CDN } from "@discordjs/rest";
  import type { APIGuild } from "discord-api-types/v10";
  import { onMount } from "svelte";

  let contentElement = $state<HTMLElement | null>(null);

  type Props = {
    value?: string;
    guild: APIGuild;
    onEmojiPick?: (emoji: any) => void;
  };

  let { guild = $bindable(), onEmojiPick }: Props = $props();

  const onEmojiSelect = (emoji: any) => {
    if (onEmojiPick) {
      onEmojiPick(emoji);
    }
  };

  let Picker: any;

  onMount(async () => {
    const EmojiMart = await import("emoji-mart");
    Picker = EmojiMart.Picker;
  });

  $effect(() => {
    const cdn = new CDN();

    if (contentElement && !contentElement.hasChildNodes()) {
      const emojis = guild.emojis.map((emoji) => ({
        id: formatEmoji(emoji.id!, emoji.animated),
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
        theme: "dark",
        previewEmoji: "rice_ball",
      });
      contentElement.appendChild(picker as unknown as Node);
    }
  });
</script>

<div bind:this={contentElement}></div>
