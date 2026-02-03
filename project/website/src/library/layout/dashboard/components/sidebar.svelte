<script lang="ts">
// - Icons

import { Select, Tooltip } from "bits-ui";
import CheckIcon from "lucide-svelte/icons/check";
import ChevronDown from "lucide-svelte/icons/chevron-down";
import PlusCircleIcon from "lucide-svelte/icons/plus-circle";
import { DiscordIcon } from "$lib/blocks/discord-icon";
import { Divider } from "$lib/blocks/divider";
import { generateSidebarRoutes, type SidebarRoute } from "$lib/constants";
import type { DashboardGuild, ManagedGuild } from "$lib/types";
import { layoutState } from "$lib/utility/context.svelte";
import { flyAndScale } from "$lib/utility/transitions";

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
      <div {...props} class:open>
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

<Tooltip.Provider delayDuration={100} ignoreNonKeyboardFocus>
  <nav class="flow">
    {#each Object.entries(sections) as [name, items]}
      <div class="stack">
        <small class="fw-md txt-bold">{name}</small>
        <div class="stack space-2xs">
          {#each items as { link, name, icon, extendedInfo }}
            {@const Icon = icon}
            <Tooltip.Root>
              <Tooltip.Trigger>
                {#snippet child({ props })}
                  <a
                    href={link}
                    class="link"
                    class:active={plugin.name === name}
                    data-sveltekit-preload-data="hover"
                    {...props}
                  >
                    <div class="cluster space-xs">
                      <Icon class="icon" size={18} />
                      <p>{name}</p>
                    </div>
                  </a>
                {/snippet}
              </Tooltip.Trigger>
              <Tooltip.Content
                alignOffset={-8}
                sideOffset={8}
                side="right"
                forceMount
              >
                {#snippet child({ wrapperProps, props, open })}
                  {#if open}
                    <div {...wrapperProps}>
                      <div
                        class="box stack extended-info-content"
                        {...props}
                        transition:flyAndScale
                      >
                        <div class="cluster">
                          <div class="cluster space-xs">
                            <Icon class="icon" size={18} />
                            <p class="fw:md">{extendedInfo.title}</p>
                          </div>
                        </div>
                        <p>{extendedInfo.description}</p>
                      </div>
                    </div>
                  {/if}
                {/snippet}
              </Tooltip.Content>
            </Tooltip.Root>
          {/each}
        </div>
      </div>
    {/each}
  </nav>
</Tooltip.Provider>

<style>
  nav {
    padding: var(--space-m);
    overflow-y: auto;
    height: calc(100% - var(--header-height));
  }

  .extended-info-content {
    background: linear-gradient(
      135deg,
      var(--glass-bg-light),
      var(--glass-bg-subtle)
    );
    border: var(--glass-border-medium);
    max-width: 45ch;
    z-index: 2;
    backdrop-filter: blur(10px);
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
    color: var(--txt-main);
    transition-property: border-color, box-shadow, background-color;
    transition-duration: var(--input-transition-duration);
    transition-timing-function: var(--input-transition-timing-function);
    border-bottom: var(--glass-border-medium);
    padding-inline: var(--space-m);
    z-index: 1;
  }

  .content {
    --border-radius: 0;
    background: linear-gradient(
      135deg,
      var(--glass-bg-light),
      var(--glass-bg-subtle)
    );
    --padding: var(--space-xs);
    backdrop-filter: blur(5rem);
    width: calc(var(--bits-select-anchor-width));
    border-bottom: var(--glass-border-medium);
    z-index: 1;
  }

  .header-trigger.open,
  .header-trigger:hover,
  .header-trigger:focus,
  .header-trigger:focus-visible,
  .header-trigger:active {
    background: var(--glass-bg-subtle);
    border-bottom: var(--glass-border-strong);
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
    letter-spacing: 0.075em;
    color: var(--txt-muted) !important;
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
    background: var(--glass-bg-light);
    color: var(--clr-primary);
    font-weight: 500;
  }

  .item:hover {
    background: var(--glass-bg-subtle);
  }

  .link {
    position: relative;
    border: none;
    border-radius: var(--border-radius);
    padding: var(--space-xs) var(--space-s);
    transition: all 0.2s;

    &:hover {
      color: var(--txt-bold);
      background: var(--glass-bg-subtle);
    }

    &:hover .icon {
      color: var(--clr-primary);
    }

    &.active {
      transform: scale(1.025);
      background: linear-gradient(
        135deg,
        var(--glass-bg-light),
        var(--glass-bg-subtle)
      );
      border: var(--glass-border-medium);
      color: var(--txt-bold);
      box-shadow: 0 2px 8px
        hsl(var(--theme-hue), var(--theme-saturation-high), 60%, 0.15);
    }

    &.active.secondary {
      background-color: red;
    }
  }

  @media (max-width: 875px) {
    .header-trigger {
      height: var(--header-height);
      padding: var(--space-xs) var(--space-xs);
      background: var(--glass-bg-subtle);
      height: auto;
      border-radius: var(--border-radius);
      border: 0;
    }

    nav {
      padding-inline: 0;
    }

    .link {
      &.active {
        transform: scale(1);
      }
    }
  }
</style>
