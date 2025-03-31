<script lang="ts">
import { Dashboard } from "$lib/layout/dashboard";
import { layoutState, setGuild, setGuilds } from "$lib/utility/context.svelte";
import { CDN } from "@discordjs/rest";
import { type Snippet, onMount, setContext } from "svelte";
import type { PageProps } from "./$types";

const { data, children }: PageProps & { children: Snippet } = $props();

data.guild.client = data.client;
setGuild(data.guild);
setGuilds(data.guilds);
setContext("shake", false);

onMount(async () => {
	const cdn = new CDN();
	const { init } = await import("emoji-mart");

	const guild = data.guild;

	const emojis = guild.emojis.map((emoji) => ({
		// id: formatEmoji(emoji.id!, emoji.animated),
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

	init({
		set: "twitter",
		previewPosition: "none",
		custom: [{ id: guild.id, name: guild.name, emojis }],
		categoryIcons: {
			[guild.id]: {
				src: guild.icon ? cdn.icon(guild.id, guild.icon) : undefined,
			},
		},
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
	});

	// setup websocket connection to listen for:
	// - guild updates: name, icon, roles, channels, emojis
	// - channel updates: name, permissions, type
	// - role updates: name, permissions, color, hoist, mentionable
	// - emoji updates: name, image
	// - guild database updates for everything
});

layoutState.showControlsInHeader = false;
</script>

<Dashboard>
  {@render children()}
</Dashboard>
