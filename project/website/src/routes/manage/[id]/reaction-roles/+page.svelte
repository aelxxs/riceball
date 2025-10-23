<script lang="ts">
import { Label } from "bits-ui";
import { EllipsisVerticalIcon, PlusIcon, SearchIcon } from "lucide-svelte";
import { Button } from "$lib/blocks/button";
import DashboardCard from "$lib/blocks/dashboard-card/dashboard-card.svelte";
import Input from "$lib/blocks/input/input.svelte";

// const { data } = $props();

// const { reactionRoles } = data;

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
    <!-- <div>
      <div class="stack space-xs">
        <div class="repel">
          <p class="fw:md">Reaction Roles</p>
          <small class="txt-muted">
            {reactionRoles.length} / 100 Reaction Roles
          </small>
        </div>
        <div class="grid embeds">
          <a
            href={`/manage/${data.guild.id}/embeds/create`}
            class="box stack space-2xs embed skeleton"
            aria-label="Create a new embed"
          >
            <PlusIcon size="1.75em" />
            <p class="fw:md">Create a Reaction Role Message</p>
          </a>
          {#each reactionRoles as rr, i (rr._id)}
            {@render ReactionRole(rr)}
          {/each}
        </div>
      </div>
    </div> -->
  </div>
</DashboardCard>

<!-- {#snippet ReactionRole(message: ReactionRole)}
  {@const href = `/manage/${data.guild.id}/messages/${message._id}`}
  <a class="box embed" {href} aria-label="View and Edit Embed">
    <div class="content repel">
      <div class="repel" style:--repel-vertical-alignment="flex-start">
        <div class="stack space-2xs">
          <p class="fw:md">{message.alias}</p>
          <p class="txt-muted">#{message.channelId}</p>
        </div>
        <EllipsisVerticalIcon size="1.25em" />
      </div>
      <div class="repel">
        <p>{embed.date}</p>
        <div class="cluster status-pill">
          <small>{embed.status}</small>
        </div>
      </div>
    </div>
  </a>
{/snippet} -->
