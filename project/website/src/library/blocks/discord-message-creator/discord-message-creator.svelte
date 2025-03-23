<script lang="ts">
  import CheckIcon from "lucide-svelte/icons/check";
  import PlusIcon from "lucide-svelte/icons/plus";
  import Trash2 from "lucide-svelte/icons/trash-2";

  import { ButtonWithConfirmation } from "$lib/blocks/button-with-confirmation";
  import { Constants } from "$lib/constants";
  import type { DashboardGuild } from "$lib/types";
  import type { DiscordEmbedWithRelations } from "db/zod";
  import type { APIApplication } from "discord-api-types/v10";
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import { Button } from "../button";
  import { DiscordIcon } from "../discord-icon";
  import Editable from "../editable/editable.svelte";
  import EmbedCreator from "../embed-creator/embed-creator.svelte";

  type Props = {
    client: APIApplication;
    guild: DashboardGuild;
    content?: string | null;
    embeds?: DiscordEmbedWithRelations[];
    withEmbed?: boolean;
    maxEmbeds?: number;
  };

  let {
    guild,
    client,
    content = $bindable(),
    embeds = $bindable([]),
    withEmbed = $bindable(false),
    maxEmbeds = $bindable(1),
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
      embeds = [Constants.EmptyEmbed];
    }

    return () => clearInterval(interval);
  });

  const addEmbed = () => {
    embeds = [...embeds, Constants.EmptyEmbed];
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
      <Editable
        type="text"
        {guild}
        maxLength={2000}
        placeholder="Type your message here..."
        styled
        bind:value={content}
      />
      {#each embeds as _, i}
        <div transition:slide class="max-w-form">
          <EmbedCreator
            {guild}
            bind:embed={embeds[i]}
            handleDelete={maxEmbeds === 1
              ? undefined
              : () => {
                  embeds = embeds.filter((_, index) => index !== i);
                }}
          />
        </div>
      {/each}
    </div>
  </div>
  <div class="cluster space-xs">
    {#if maxEmbeds === 1 && embeds.length}
      <ButtonWithConfirmation
        onConfirm={() => {
          embeds = [];
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
    {#if (maxEmbeds > 1 || !embeds.length) && embeds.length !== 10}
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
</style>
