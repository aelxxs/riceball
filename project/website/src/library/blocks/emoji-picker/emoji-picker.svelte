<script lang="ts">
import { flyAndScale } from "$lib/utility/transitions";
import { CDN } from "@discordjs/rest";
import { Popover } from "bits-ui";
import type { APIGuild } from "discord-api-types/v10";
import { onMount } from "svelte";
import type { Emoji } from "./picker.svelte";

let contentElement = $state<HTMLElement | null>(null);

type Props = {
	open?: boolean;
	value?: string;
	guild: APIGuild;
	onEmojiPick?: (emoji: Emoji) => void;
	showSelected?: boolean;
	hideAfterPick?: boolean;
};

let {
	open = $bindable(false),
	value = $bindable(),
	guild = $bindable(),
	onEmojiPick,
	showSelected = false,
	hideAfterPick = true,
}: Props = $props();
const cdn = new CDN();

const onEmojiSelect = (emoji: Emoji) => {
	value = emoji.native ?? emoji.id;
	if (onEmojiPick) {
		onEmojiPick(emoji);
	}
	if (hideAfterPick) {
		open = false;
	}
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
let Picker: any;

onMount(async () => {
	const EmojiMart = await import("emoji-mart");
	Picker = EmojiMart.Picker;
});

$effect(() => {
	if (contentElement && !contentElement.hasChildNodes()) {
		const emojis = guild.emojis.map((emoji) => ({
			id: emoji.animated
				? `<a:${emoji.name}:${emoji.id}>`
				: `<:${emoji.name}:${emoji.id}>`,
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
			theme: "dark",
			previewEmoji: "rice_ball",
		});
		contentElement.appendChild(picker as unknown as Node);
	}
});

const getRandomFaceEmoji = () => {
	const faces = [
		"😀",
		"😃",
		"😄",
		"😁",
		"😆",
		"😅",
		"🤣",
		"😂",
		"🙂",
		"🙃",
		"😉",
		"😊",
		"😇",
		"🥰",
		"😍",
		"🤩",
		"😘",
		"😗",
		"☺️",
		"😚",
		"😙",
		"🥲",
		"😋",
		"😛",
		"😜",
		"🤪",
		"😝",
		"🤑",
		"🤗",
		"🤭",
		"🤫",
		"🤔",
		"🤐",
		"🤨",
		"😐",
		"😑",
		"😶",
		"😏",
		"😒",
		"🙄",
		"😬",
		"🤥",
		"😌",
		"😔",
		"😪",
		"🤤",
		"😴",
		"😷",
		"🤒",
		"🤕",
		"🤢",
		"🤮",
		"🤧",
		"🥵",
		"🥶",
		"🥴",
		"😵",
		"🤯",
		"🤠",
		"🥳",
		"😎",
		"🤓",
		"🧐",
		"😕",
		"😟",
		"🙁",
		"☹️",
		"😮",
		"😯",
		"😲",
		"😳",
		"🥺",
		"😦",
		"😧",
		"😨",
		"😰",
		"😥",
		"😢",
		"😭",
		"😱",
		"😖",
		"😣",
		"😞",
		"😓",
		"😩",
		"😫",
		"🥱",
		"😤",
		"😡",
		"😠",
		"🤬",
		"😈",
		"👿",
		"💩",
		"🤡",
		"👹",
		"👺",
		"👻",
		"👽",
		"🤖",
		"😺",
		"😸",
		"😹",
		"😻",
		"😼",
		"😽",
		"🙀",
		"😿",
		"😾",
	];
	return faces[Math.floor(Math.random() * faces.length)];
};

const currentEmoji = $state(getRandomFaceEmoji());

const handleMouseEnter = () => {
	// currentEmoji = getRandomFaceEmoji();
};
</script>

<Popover.Root bind:open onOpenChange={(newOpen) => (open = newOpen)}>
  <Popover.Trigger>
    {#snippet child({ props })}
      <button
        type="button"
        class="emoji-picker-trigger"
        style="padding-top: 0.25rem;"
        onclick={(e) => {
          console.log("click");
          e.preventDefault();
          e.stopPropagation();
          open = !open;
        }}
        {...props}
      >
        {#if value && showSelected}
          <em-emoji id={value} size="1.45rem" set="twitter"></em-emoji>
        {:else}
          {#key currentEmoji}
            <em-emoji
              class="random-emoji"
              class:open
              native={currentEmoji}
              size="1.45rem"
              set="twitter"
            ></em-emoji>
          {/key}
        {/if}
      </button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Portal>
    <Popover.Content class="content" sideOffset={10} align="start" forceMount>
      {#snippet child({ wrapperProps, props, open })}
        <div {...wrapperProps}>
          {#if open}
            <div {...props} transition:flyAndScale>
              <div bind:this={contentElement}></div>
            </div>
          {/if}
        </div>
      {/snippet}
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>

<style>
  .emoji-picker-trigger {
    cursor: pointer;
    outline: 0;
    border: 0;
    background: none;
  }

  .content {
    outline: 0;
    border: 0;
    /* z-index: 1000; */
  }

  :global(.emoji-mart-emoji) {
    display: flex;
  }

  :global(.emoji-picker-trigger .random-emoji) {
    display: block;
    filter: grayscale(100%);
    transition: all 0.3s ease;
  }

  :global(.emoji-picker-trigger .random-emoji:hover),
  :global(.emoji-picker-trigger .random-emoji.open) {
    filter: grayscale(0%);
    transform: scale(1.125);
  }
</style>
