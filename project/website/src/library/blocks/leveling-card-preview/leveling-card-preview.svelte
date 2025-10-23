<script lang="ts">
import { abbreviateNumber, composeLevelCard } from "@riceball/colorify";

import type { CardWithRelations } from "@riceball/db/zod";
import { onMount } from "svelte";

type FontType = "Sans-serif" | "Serif" | "Monospace" | "Handwritten" | "Cursive";

type User = {
	username: string;
	greeting: string;
	level: number;
	curExp: number;
	maxExp: number;
	rank: number;
	reputation: number;
	badges: string[];
};

type Props = {
	card: CardWithRelations;
	user: User;
};

const { card = $bindable<CardWithRelations>(), user = $bindable<User>() }: Props = $props();

function parseEmoji(text: string) {
	let decodedText = text;
	if (decodedText.includes("%")) decodedText = decodeURIComponent(decodedText);
	if (!text.includes(":")) return { animated: false, name: text, id: null };
	const match = decodedText.match(/<?(?:(a):)?(\w{2,32}):(\d{17,19})?>?/);
	return match && { animated: Boolean(match[1]), name: match[2], id: match[3] };
}

const fonts = {
	MONOSPACE: "JetBrains Mono",
	SANS_SERIF: "Roboto",
	SERIF: "Lora",
	HANDWRITTEN: "Pacifico",
	CURSIVE: "Dancing Script",
};

const font: string = $derived(fonts[card?.fontFamily]);

let canvas: HTMLCanvasElement | null = $state(null);

type TextChunk = {
	type: "text";
	value: string;
	width: number;
	x: number;
};

type EmoteChunk = {
	type: "emote";
	url: string;
	x: number;
};

type BioChunk = TextChunk | EmoteChunk;

let bio: BioChunk[] = $state([]);

const measureWidth = (text: string, size: number, font: string) => {
	const context = canvas?.getContext("2d");

	if (context) {
		context.font = `${size}px ${font}`;
		return context.measureText(text).width;
	}

	return 0;
};

function parseBio(text: string): BioChunk[] {
	const EMOJI_REGEX = /(<?a?:\w{2,32}:\d{17,19}?>)/;

	const spaceWidth = measureWidth(" ", 8, font);

	let xCord = 98;
	const tokens = text
		.trim()
		.split(EMOJI_REGEX)
		.filter((s) => s);

	return tokens.map((value) => {
		if (EMOJI_REGEX.test(value)) {
			const emoji = parseEmoji(value);

			if (!emoji) return { type: "text", value, width: 0, x: xCord };

			const obj: EmoteChunk = {
				type: "emote" as const,
				url: `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? "gif" : "png"}`,
				x: xCord,
			};

			xCord += 10;

			return obj;
		}

		const width = measureWidth(value, 8, font);
		const obj: TextChunk = {
			type: "text",
			value,
			width,
			x: xCord + (xCord === 98 ? 0 : (spaceWidth ?? 0)),
		};
		xCord += width ?? 0;

		return obj;
	});
}

let lvlTextWidth = $state(0);
let xpTextWidth = $state(0);

let reputationTextWidth = $state(0);
let plusTextWidth = $state(0);
let repTextWidth = $state(0);
let reputationGroupStartX = $state(0);

let rankTextWidth = $state(0);
let hashtagTextWidth = $state(0);
let rankGroupStartX = $state(0);

let loading = $state(true);

const { username, greeting, level, curExp, maxExp, rank, reputation, badges } = user;

const initialize = () => {
	lvlTextWidth = measureWidth("Lvl.", 7.5, font) ?? 0;
	xpTextWidth = measureWidth(`/${maxExp} Exp.`, 7.5, font) ?? 0;

	rankTextWidth = measureWidth(abbreviateNumber(rank), 9, font) ?? 0;
	hashtagTextWidth = measureWidth("#", 7.5, font) ?? 0;
	rankGroupStartX = 328 - (rankTextWidth + hashtagTextWidth) / 2;

	reputationTextWidth = measureWidth(abbreviateNumber(reputation), 9, font) ?? 0;
	plusTextWidth = measureWidth("+", 7.5, font) ?? 0;
	repTextWidth = measureWidth("rep", 7.5, font) ?? 0;

	reputationGroupStartX = 328 - (plusTextWidth + reputationTextWidth + repTextWidth) / 2;

	bio = parseBio(greeting);
	loading = false;
};

$effect(() => {
	canvas = document.createElement("canvas");
});

const c = $derived(composeLevelCard(card));
const r = $derived(c.borderRadius / 2);

$effect(() => {
	if (card.fontFamily) {
		requestAnimationFrame(initialize);
	}
});

const userAvatar = "https://cdn.discordapp.com/avatars/406665840088317962/a_07d1dd47eddbaf327d591b3707bb0614.gif";
const serverIcon = "https://cdn.discordapp.com/icons/489958131472924682/46113f5c761bf754cb67feaf6d7ed3f5.webp";
</script>

{#snippet text(
  text: string,
  x: number,
  y: number,
  anchor: "start" | "middle" | "end",
  color: string = c.textColor,
  size: number = 9,
  weight: number = 600,
)}
  <text
    {x}
    {y}
    font-weight={weight}
    font-size={size}
    fill={color}
    text-anchor={anchor}
  >
    {text}
  </text>
{/snippet}

<svg
  width="380"
  height="112"
  viewBox="0 0 380 112"
  xmlns="http://www.w3.org/2000/svg"
  preserveAspectRatio="xMidYMid meet"
  class={[
    "level-card",
    {
      "font-monospace": card.fontFamily === "MONOSPACE",
      "font-serif": card.fontFamily === "SERIF",
      "font-sans": card.fontFamily === "SANS_SERIF",
      "font-cursive": card.fontFamily === "CURSIVE",
      "font-handwritten": card.fontFamily === "HANDWRITTEN",
    },
  ]}
>
  <defs>
    <clipPath id="background">
      <rect x="0" y="0" width="380" height="112" rx={r * 1.25} />
    </clipPath>

    <clipPath id="overlay">
      <rect x="8" y="8" width="364" height="96" rx={r} />
    </clipPath>

    <clipPath id="flat-progress">
      <rect x="98" y="84" width="249" height="12" rx="6" />
    </clipPath>

    <clipPath id="avatar">
      <circle cx="53" cy="45" r="29" />
    </clipPath>

    <clipPath id="server-icon">
      <circle cx="358" cy="90" r="6" />
    </clipPath>

    <clipPath id="bio">
      <!-- start of stats panel + 8 for padding -->
      <rect x="0" y="0" width="284" height="100%" />
    </clipPath>
  </defs>

  <g clip-path="url(#clip0_98_11)">
    <!-- Background -->
    <rect width="380" height="112" rx={r * 1.25} fill={c.wrapperColor} />
    <image
      href={c.wrapperImage}
      width="380"
      height="112"
      clip-path="url(#background)"
      preserveAspectRatio="xMidYMid slice"
    />

    <rect x="8" y="8" width="364" height="96" rx={r} fill={c.overlayColor} />
    <!-- Overlay -->

    <!-- Avatar container -->
    <rect
      x="16"
      y="8"
      width="74"
      height="96"
      fill={c.overlayAccentColor}
      clip-path="url(#overlay)"
    />

    <!-- User Flag (country) -->
    <rect
      x="40"
      y="80"
      width="26"
      height="16"
      rx={r * 0.75}
      fill={c.overlayColor}
    />

    <!-- User Avatar -->
    <circle cx="53" cy="45" r="29" fill={c.overlayAccentColor} />
    <image
      x="24"
      y="16"
      width="58"
      height="58"
      clip-path="url(#avatar)"
      href={userAvatar}
    />

    <!-- Avatar Frame -->

    <!-- <image
      x="14"
      y="6"
      width="78"
      height="78"
      href="https://static.wikia.nocookie.net/gensin-impact/images/3/37/HoYoLAB_Avatar_Frame_Arataki_Itto.png"
    /> -->

    <!-- User Status -->
    <circle cx="74" cy="66" r="8" fill={c.overlayAccentColor} />
    <circle cx="73.9999" cy="66" r="5.48571" fill="#6BDE9B" />

    <!-- Server Icon -->
    <circle cx="358" cy="90" r="6" fill={c.overlayAccentColor} />
    <image
      x="352"
      y="84"
      width="12"
      height="12"
      clip-path="url(#server-icon)"
      href={serverIcon}
    />

    <g>
      <rect
        x="98"
        y="49"
        width="186"
        height="20"
        rx={r * 0.75}
        fill={c.overlayAccentColor}
      />
      {#each Array(6) as _, i}
        {@const x = 98 + (186 / 6) * i + 186 / 12 - 7.5}
        {#if badges[i]}
          <image {x} y="51.5" width="15" height="15" href={badges[i]} />
        {:else}
          {@const cx = 98 + (186 / 6) * (i + 0.5)}
          <circle {cx} cy="59" r="2.5" fill={c.overlayColor} />
        {/if}
      {/each}
    </g>

    <!-- Stats -->
    <rect
      x="292"
      y="16"
      width="72"
      height="60"
      rx={r * 0.75}
      fill={c.overlayAccentColor}
    />
    <rect
      x="300"
      y="24"
      width="56"
      height="18"
      rx={r * 0.5}
      fill={c.overlayColor}
    />
    <rect
      x="300"
      y="50"
      width="56"
      height="18"
      rx={r * 0.5}
      fill={c.overlayColor}
    />

    <!-- Progress Bar -->
    <rect
      x="98"
      y="84"
      width="249"
      height="12"
      rx="6"
      fill={c.overlayAccentColor}
    />
    <rect
      x="98"
      y="84"
      width="87"
      height="12"
      fill={c.progressBarColor}
      clip-path="url(#flat-progress)"
    />

    <!-- Text Elements -->
    {#if !loading}
      <text
        x="98"
        y="30"
        font-weight="700"
        font-size="18"
        fill={c.textColor}
        clip-path="url(#bio)"
      >
        {username}
      </text>

      <g clip-path="url(#bio)">
        {#each bio as { type, ...chunk }}
          {#if type === "text"}
            <text x={chunk.x} y="43" font-size="8" fill={c.subtextColor}>
              {#if "value" in chunk}
                {chunk.value}
              {/if}
            </text>
          {:else if type === "emote"}
            {#if "url" in chunk}
              <image x={chunk.x} y="36" width="8" height="8" href={chunk.url} />
            {/if}
          {/if}
        {/each}
      </g>

      {@render text("Lvl.", 98, 79.625, "start", c.subtextColor, 7.5, 500)}
      {@render text(`${level}`, 98 + lvlTextWidth, 79.625, "start")}

      {@render text(
        `${abbreviateNumber(curExp)}`,
        284 - xpTextWidth,
        79.625,
        "end",
      )}
      {@render text(
        `/${abbreviateNumber(maxExp)} Exp.`,
        284,
        79.625,
        "end",
        c.subtextColor,
        7.5,
        500,
      )}
      {@render text(
        `#`,
        rankGroupStartX,
        36,
        "start",
        c.subtextColor,
        7.5,
        500,
      )}
      {@render text(
        abbreviateNumber(rank),
        rankGroupStartX + hashtagTextWidth,
        36,
        "start",
        c.textColor,
        9,
      )}

      {@render text(
        `+`,
        reputationGroupStartX,
        62,
        "start",
        c.subtextColor,
        7.5,
        500,
      )}
      {@render text(
        abbreviateNumber(reputation),
        reputationGroupStartX + plusTextWidth,
        62,
        "start",
        c.textColor,
        9,
      )}
      {@render text(
        `rep`,
        reputationGroupStartX + plusTextWidth + reputationTextWidth,
        62,
        "start",
        c.subtextColor,
        7.5,
        500,
      )}
    {:else}
      <!-- text skeletons -->
      <!-- username -->
      <rect
        x="98"
        y="16"
        width="75"
        height="15"
        class="animate-pulse"
        fill={c.overlayAccentColor}
        rx="3"
      />
      <!-- bio -->
      <rect
        x="98"
        y="35"
        width="100"
        height="8"
        class="animate-pulse"
        fill={c.overlayAccentColor}
        rx="3"
      />
      <!-- level -->
      <rect
        x="98"
        y="72"
        width="30"
        height="10"
        class="animate-pulse"
        fill={c.overlayAccentColor}
        rx="3"
      />
      <!-- xp -->
      <rect
        x="220"
        y="72"
        width="64"
        height="10"
        class="animate-pulse"
        fill={c.overlayAccentColor}
        rx="3"
      />
      <!-- rank -->
      <rect
        x="315.5"
        y="29"
        width="25"
        height="9"
        class="animate-pulse"
        fill={c.overlayAccentColor}
        rx="3"
      />
      <!-- reputation -->
      <rect
        x="306"
        y="55"
        width="45"
        height="9"
        class="animate-pulse"
        fill={c.overlayAccentColor}
        rx="3"
      />
    {/if}
  </g>
</svg>

<style>
  .level-card {
    width: 100%;
    height: auto;
  }

  .level-card rect {
    transition: rx 0.3s;
  }

  .animate-pulse {
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }
</style>
