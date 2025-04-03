<script lang="ts">
// - Icons
import CheckIcon from "lucide-svelte/icons/check";
import ChevronDown from "lucide-svelte/icons/chevron-down";
import PlusCircleIcon from "lucide-svelte/icons/plus-circle";

import { DiscordIcon } from "$lib/blocks/discord-icon";
import { Divider } from "$lib/blocks/divider";
import { type SidebarRoute, generateSidebarRoutes } from "$lib/constants";
import type { DashboardGuild, ManagedGuild } from "$lib/types";
import { layoutState } from "$lib/utility/context.svelte";
import { flyAndScale } from "$lib/utility/transitions";
import { ScrollArea, Select } from "bits-ui";

type Props = {
	guild: DashboardGuild;
	guilds: ManagedGuild[];
	plugin: SidebarRoute;
};

const { guild, guilds, plugin }: Props = $props();

const sections = generateSidebarRoutes(guild.id);

let open = $state(false);
</script>

<svelte:window
  onresize={() => {
    if (window.innerWidth > 675) {
      open = false;
    }
  }}
/>

<Select.Root type="single" bind:open value={guild.id}>
  <Select.Trigger class="header-trigger repel">
    {#snippet child({ props })}
      <div {...props}>
        <div class="cluster">
          <DiscordIcon
            size={1.75}
            id={guild.id}
            icon={guild.icon}
            name={guild.name}
            type="guild"
          />
          <h4 style="user-select: none;">{guild.name}</h4>
        </div>
        <div class="chevron" class:animate={open}>
          <ChevronDown size={18} />
        </div>
      </div>
    {/snippet}
  </Select.Trigger>
  <Select.Content
    class="content box stack space-2xs"
    forceMount
    sideOffset={layoutState.sideBarOpen ? 8 : 0}
  >
    {#snippet child({ wrapperProps, props, open })}
      {#if open}
        <div {...wrapperProps}>
          <div {...props} transition:flyAndScale>
            {#each guilds.filter((g) => g.riceball) as guild}
              <Select.Item value={guild.id} label={guild.name}>
                {#snippet child({ props, selected })}
                  <a
                    href={`/manage/${guild.id}`}
                    class="repel item"
                    data-sveltekit-reload
                    data-sveltekit-preload-data="hover"
                    {...props}
                  >
                    <div class="cluster">
                      <DiscordIcon
                        size={1.35}
                        id={guild.id}
                        icon={guild.icon}
                        name={guild.name}
                        type="guild"
                      />
                      {guild.name}
                    </div>
                    {#if selected}
                      <CheckIcon size={16} />
                    {/if}
                  </a>
                {/snippet}
              </Select.Item>
            {/each}
            <Divider />

            <Select.Item value="add" label="Add a new server">
              {#snippet child({ props })}
                <a href="/manage" class="repel item" {...props}>
                  <div class="cluster">
                    <PlusCircleIcon size="1.35rem" />
                    Add a new server
                  </div>
                </a>
              {/snippet}
            </Select.Item>
          </div>
        </div>
      {/if}
    {/snippet}
  </Select.Content>
</Select.Root>

<nav class="flow">
  {#each Object.entries(sections) as [name, items]}
    <div class="stack">
      <small class="fw-md txt-bold">{name}</small>
      <div class="stack space-2xs">
        {#each items as { link, name, icon }}
          {@const Icon = icon}
          <a
            href={link}
            class="link"
            class:active={plugin.name === name}
            data-sveltekit-preload-data
          >
            <div class="cluster space-xs">
              <Icon class="icon" size={18} />
              <p>{name}</p>
            </div>
          </a>
        {/each}
      </div>
    </div>
  {/each}
</nav>

<style>
  nav {
    padding: var(--space-m);
    overflow-y: auto;
    height: calc(100% - var(--header-height));
  }

  .header-trigger {
    position: sticky;
    top: 0;

    height: var(--header-height-lg);
    width: 100%;
    cursor: pointer;
    font-weight: var(--font-weight-normal);
    line-height: var(--line-height-body);
    letter-spacing: var(--letter-spacing-normal);
    /* border: 2px solid transparent; */
    /* border-radius: var(--border-radius); */
    color: var(--txt-main);
    transition-property: border-color, box-shadow;
    transition-duration: var(--input-transition-duration);
    transition-timing-function: var(--input-transition-timing-function);
    border-bottom: 1px solid var(--clr-bg-border);
    background-color: var(--clr-bg);
    /* border: 1px solid var(--clr-bg-border); */
    padding-inline: var(--space-m);
    /* margin-bottom: 1rem; */
    /* border-top-right-radius: 1rem; */
    z-index: 1;
  }

  .content {
    --bg: var(--clr-bg-accent-secondary);
    --padding: var(--space-xs);
    width: calc(var(--bits-select-anchor-width) - var(--padding) * 2);
    border-bottom-left-radius: var(--border-radius) !important;
    border-bottom-right-radius: var(--border-radius) !important;
    z-index: 1;
  }

  @media (max-width: 875px) {
    .header-trigger {
      height: var(--header-height);
      padding: var(--space-xs) var(--space-xs);
      background-color: var(--clr-bg-accent);
      height: auto;
      border-radius: var(--border-radius);
      border: 0;
    }

    nav {
      padding-inline: 0;
    }
  }

  .header-trigger:hover,
  .header-trigger:focus,
  .header-trigger:focus-visible,
  .header-trigger:active {
    background-color: var(--clr-bg-translucent);
  }

  .chevron {
    display: flex;
    transform: rotate(0deg);
    transition: transform 0.1s;
  }

  .animate {
    transform: rotate(-180deg);
  }

  small {
    text-transform: uppercase;
  }

  .item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-xs) var(--space-s);
    border-radius: var(--border-radius);
    transition: background-color 0.2s;
  }

  .item[data-selected] {
    background-color: var(--clr-bg-input);
    color: var(--txt-themed);
    font-weight: 500;
  }

  .item:hover {
    background-color: var(--clr-bg-input);
  }

  .link {
    position: relative;
    border: none;
    border-radius: 0.35rem;
    padding: var(--space-xs) var(--space-s);
    transition: all 0.2s;

    &:hover {
      /* transform: scale(1.005); */
      background-color: var(--clr-bg-input-active);
    }

    &:hover .icon {
      color: var(--clr-theme-2);
    }

    &.active {
      transform: scale(1.025);
      background-color: var(--clr-bg-input-active);
      color: var(--txt-themed);
    }

    &.active.secondary {
      background-color: red;
    }
  }
</style>
