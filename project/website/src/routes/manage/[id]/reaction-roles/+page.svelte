<script lang="ts">
import { DropdownMenu, Label } from "bits-ui";
import { EllipsisVerticalIcon, PlusIcon, SearchIcon, Trash2 } from "lucide-svelte";
import { Button } from "$lib/blocks/button";
import ButtonWithConfirmation from "$lib/blocks/button-with-confirmation/button-with-confirmation.svelte";
import DashboardCard from "$lib/blocks/dashboard-card/dashboard-card.svelte";
import Input from "$lib/blocks/input/input.svelte";

const { data } = $props();
const { reactionRoles } = data;

let searchQuery = $state("");
</script>

<DashboardCard
  title="Reaction Roles"
  description="Create reaction roles to allow users to assign roles to themselves."
>
  <div class="stack space-m">
    <div class="max-w-form">
      <div class="stack space-xs">
        <Label.Root for="search" class="fw:md">Search Reaction Roles</Label.Root
        >
        <Input
          type="search"
          icon={SearchIcon}
          placeholder="Search..."
          bind:value={searchQuery}
        />
      </div>
    </div>
    <div>
      <div class="stack space-xs">
        <div class="repel">
          <p class="fw:md">Reaction Roles</p>
          <small class="txt-muted">
            {reactionRoles.length} / 100 Reaction Roles
          </small>
        </div>
        <div class="grid embeds">
          <a
            href={`/manage/${data.guild.id}/reaction-roles/create`}
            class="box stack space-2xs embed skeleton"
            aria-label="Create a new embed"
          >
            <PlusIcon size="1.75em" />
            <p class="fw:md">Create a Reaction Role Message</p>
          </a>
          {#each reactionRoles as rr, i}
            {@render ReactionRole(rr)}
          {/each}
        </div>
      </div>
    </div>
  </div>
</DashboardCard>

{#snippet ReactionRole(message)}
  {@const href = `/manage/${data.guild.id}/reaction-roles/${message.id}`}
  <a class="box embed" {href} aria-label="View and Edit Embed">
    <div class="content repel">
      <div class="repel" style:--repel-vertical-alignment="flex-start">
        <div class="stack space-2xs">
          <p class="fw:md">{message.alias}</p>
          <p class="txt-muted">#{channelName(message.channelId)}</p>
        </div>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            {#snippet child({ props })}
              <Button size="icon" variant="ghost" {...props}>
                <EllipsisVerticalIcon size="1.5em" />
              </Button>
            {/snippet}
          </DropdownMenu.Trigger>
          <DropdownMenu.Content side="bottom" align="end">
            <DropdownMenu.Item>
              <a {href} class="txt-link">Edit</a>
            </DropdownMenu.Item>
            <DropdownMenu.Item>
              <ButtonWithConfirmation onConfirm={() => {}}>
                {#snippet button()}
                  <Button size="icon" variant="destructive">
                    <Trash2 size={16} />
                  </Button>
                  Delete
                {/snippet}
              </ButtonWithConfirmation>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
      <div class="cluster">
        {#if message?.pairs?.length > 0}
          {#each message?.pairs as rr, i}
            {rr.emoji}
          {/each}
        {:else}
          <p class="txt-muted">No Reactions...</p>
        {/if}
      </div>
      <div class="repel">
        <p>{formatTimestamp(message.createdAt)}</p>
        <div class="cluster status-pill">
          <small>published</small>
        </div>
      </div>
    </div>
  </a>
{/snippet}

<style>
  .embeds {
    --minimum: 35ch;
    --repeat: auto-fill;
  }

  .embed {
    --padding: var(--space-m);
    min-height: 11rem;
    --bg: var(--clr-bg-input);
    --bg: transparent;
    border: 1.5px solid var(--clr-bg-border);
    transition-property: border-color, box-shadow;
    transition-duration: var(--input-transition-duration);
    transition-timing-function: var(--input-transition-timing-function);
  }

  .embed:hover {
    /* --bg: var(--clr-bg-input-hover); */

    border-color: var(--clr-bg-border-hover);
  }

  .embed:focus-within {
    border-color: var(--clr-bg-border-hover);
    /* box-shadow: 0 0 0 0.225rem hsl(var(--clr-bg-border-hover-hsl) / 0.05); */
  }

  .embed .content {
    height: 100%;
    flex-direction: column;
  }

  .embed.skeleton {
    --bg: transparent;
    border: 2px dashed var(--clr-bg-border-strong);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--input-transition-duration)
      var(--input-transition-timing-function);
  }

  .embed.skeleton:hover {
    border: 2px dashed var(--clr-bg-border-hover);
    --bg: var(--clr-bg-input-hover);
  }

  .embed.skeleton:focus-within {
    border: 2px dashed var(--clr-bg-border-hover);
  }

  .status-pill {
    --space: 0.25rem;
    display: inline-flex;
    align-items: center;
    padding: 0.3rem 0.75rem;
    border-radius: var(--radius-full);
    color: var(--txt-themed) !important;
    background-color: var(--clr-bg-input-hover);
    outline: 0;
    border: 0;
  }
</style>
