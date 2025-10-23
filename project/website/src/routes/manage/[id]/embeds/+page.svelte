<script lang="ts">
import { Label } from "bits-ui";
import { EllipsisVerticalIcon, PlusIcon, SearchIcon } from "lucide-svelte";
import { DashboardCard } from "$lib/blocks/dashboard-card";
import { Input } from "$lib/blocks/input";

const { data } = $props();

const embeds = [
	{
		id: "1",
		name: "Terms of Service",
		description: "This is the terms of service for our community.",
		channel: "rules",
		status: "published",
		date: "2021-10-01",
	},
	{
		id: "2",
		name: "Privacy Policy",
		description: "This is the privacy policy for our community.",
		channel: "rules",
		status: "published",
		date: "2021-10-02",
	},
	{
		id: "3",
		name: "Community Guidelines",
		description: "This is the community guidelines for our community.",
		channel: "rules",
		status: "draft",
		date: "2021-10-03",
	},
	{
		id: "4",
		name: "About Us",
		description: "This is information about our community.",
		channel: "about",
		status: "published",
		date: "2021-10-04",
	},
	{
		id: "5",
		name: "Contact Us",
		description: "This is how you can contact us.",
		channel: "about",
		status: "draft",
		date: "2021-10-05",
	},
];

let searchQuery = $state("");

const filteredEmbeds = $derived.by(() => {
	if (!searchQuery) return embeds;
	return embeds.filter((embed) => {
		return embed.name.toLowerCase().includes(searchQuery.toLowerCase());
	});
});
</script>

<div class="stack">
  <DashboardCard
    title="Your Embeds"
    description="This is a list of all the embeds you have created."
  >
    <div class="stack space-m">
      <div class="max-w-form">
        <div class="stack space-xs">
          <Label.Root for="search" class="fw:md">Search Embeds</Label.Root>
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
            <p class="fw:md">Message Embeds</p>
            <small class="txt-muted">
              {embeds.length} / 100 Embeds
            </small>
          </div>
          <div class="grid embeds">
            <a
              href={`/manage/${data.guild.id}/embeds/create`}
              class="box stack space-2xs embed skeleton"
              aria-label="Create a new embed"
            >
              <PlusIcon size="1.75em" />
              <p class="fw:md">Create a new embed</p>
            </a>
            {#each filteredEmbeds as embed, i (embed.id)}
              {@render embedSnippet(embed)}
            {/each}
          </div>
        </div>
      </div>
    </div>
  </DashboardCard>
</div>

{#snippet embedSnippet(embed: any)}
  {@const href = `/manage/${data.guild.id}/embeds/${embed.id}`}
  <a class="box embed" {href} aria-label="View and Edit Embed">
    <div class="content repel">
      <div class="repel" style:--repel-vertical-alignment="flex-start">
        <div class="stack space-2xs">
          <p class="fw:md">{embed.name}</p>
          <p class="txt-muted">#{embed.channel}</p>
        </div>
        <!-- this will be a button -->
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
    border: 1.5px solid transparent;
    transition-property: border-color, box-shadow;
    transition-duration: var(--input-transition-duration);
    transition-timing-function: var(--input-transition-timing-function);
  }

  .embed:hover {
    border-color: var(--clr-bg-border-hover);
  }

  .embed:focus-within {
    border-color: var(--clr-bg-border-hover);
    box-shadow: 0 0 0 0.225rem hsl(var(--clr-bg-border-hover-hsl) / 0.05);
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
