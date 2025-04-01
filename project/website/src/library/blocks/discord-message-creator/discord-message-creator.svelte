<script lang="ts">
import CheckIcon from "lucide-svelte/icons/check";
import PlusIcon from "lucide-svelte/icons/plus";
import Trash2 from "lucide-svelte/icons/trash-2";

import { ButtonWithConfirmation } from "$lib/blocks/button-with-confirmation";
import { Constants } from "$lib/constants";
import type { DashboardGuild } from "$lib/types";
import type { DiscordEmbedWithRelations } from "@riceball/db/zod";
import type { APIApplication } from "discord-api-types/v10";
import { slide } from "svelte/transition";
import { Button } from "../button";
import { DiscordIcon } from "../discord-icon";
import Editable from "../editable/editable.svelte";
import EmbedCreator from "../embed-creator/embed-creator.svelte";

type Props = {
	client: APIApplication;
	guild: DashboardGuild;
	content?: string | null;
	embeds?: DiscordEmbedWithRelations[] | DiscordEmbedWithRelations | null;
	withEmbed?: boolean;
	maxEmbeds?: number;
	reactions?: string[];
	noContent?: boolean;
};

let {
	guild,
	client,
	content = $bindable(),
	embeds = $bindable([]),
	withEmbed = $bindable(false),
	maxEmbeds = $bindable(1),
	reactions = $bindable([]),
	noContent = $bindable(false),
}: Props = $props();

const getTime = () => {
	return new Date().toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "numeric",
	});
};

let time = $state(getTime());

$effect(() => {
	const interval = setInterval(() => {
		time = getTime();
	}, 1000);

	if (withEmbed) {
		addEmbed();
	}

	return () => clearInterval(interval);
});

const addEmbed = () => {
	if (Array.isArray(embeds)) {
		embeds = [...embeds, Constants.EmptyEmbed];
	} else {
		embeds = Constants.EmptyEmbed;
	}
};
</script>

<div class="stack space-xs">
  <div class="cluster space-xs align-start no-wrap">
    <div class="show:md">
      <DiscordIcon
        size={2.25}
        id={client.id}
        icon={client.icon}
        name={client.name}
        type="app"
      />
    </div>
    <div class="stack space-xs message max-w-form">
      <div class="cluster space-2xs">
        <span class="fw:bold">{client.name}</span>
        <span class="badge cluster">
          <CheckIcon size="0.75rem" strokeWidth={4.75} />
          <small class="fw:bold">APP</small>
        </span>
        <small class="txt-muted">
          <span>Today at {time}</span>
        </small>
      </div>
      {#if !noContent}
        <Editable
          type="text"
          {guild}
          maxLength={2000}
          placeholder="Type your message here..."
          styled
          bind:value={content}
        />
      {/if}
      {#if Array.isArray(embeds)}
        {#each embeds as _, i}
          <div transition:slide class="max-w-form">
            <EmbedCreator
              {guild}
              bind:embed={embeds[i]}
              handleDelete={maxEmbeds === 1
                ? undefined
                : () => {
                    embeds = (embeds as DiscordEmbedWithRelations[]).filter(
                      (_, index) => index !== i,
                    );
                  }}
            />
          </div>
        {/each}
      {:else if embeds}
        <div transition:slide class="max-w-form">
          <EmbedCreator
            {guild}
            bind:embed={embeds}
            handleDelete={maxEmbeds === 1
              ? undefined
              : () => {
                  embeds = [];
                }}
          />
        </div>
      {/if}
      <div class="cluster">
        {#each reactions as reaction}
          <span class="reaction cluster">
            <p class="fw:bold">{reaction}</p>
            <p>1</p>
          </span>
        {/each}
      </div>
    </div>
  </div>
  <div class="cluster space-xs">
    {#if maxEmbeds === 1 && ((Array.isArray(embeds) && embeds.length === 1) || (!Array.isArray(embeds) && embeds))}
      <ButtonWithConfirmation
        onConfirm={() => {
          if (Array.isArray(embeds)) {
            embeds = [];
          } else {
            embeds = null;
          }
        }}
        title="Remove Embed"
        description="Are you sure you want to remove the embed?"
      >
        {#snippet button()}
          <Button variant="destructive" size="icon">
            <Trash2 size={16} />
          </Button>
        {/snippet}
      </ButtonWithConfirmation>
      <span style="color: var(--clr-theme-error);"> Remove Embed </span>
    {/if}
    {#if maxEmbeds > 1 || !embeds || (Array.isArray(embeds) && !embeds.length && embeds.length !== 10)}
      <Button variant="secondary" size="icon" onclick={addEmbed}>
        <PlusIcon size={16} strokeWidth={3.5} />
      </Button>
      <span> Add Embed </span>
    {/if}
  </div>
</div>

<style>
  .message {
    width: 100%;
  }
  .badge {
    --cluster-gap: 0.25rem;
    background-color: var(--clr-theme-2);
    color: var(--txt-bold);
    border-radius: 0.3rem;
    padding-inline: 0.3rem;
  }

  .reaction {
    --cluster-gap: 0.5rem;
    background-color: var(--clr-theme-2-trasnslucent);
    color: var(--txt-bold);
    border-radius: 0.3rem;
    padding-inline: 0.35rem;
    padding-block: 0.15rem;
    border: 1px solid var(--clr-theme-2);
  }
</style>
