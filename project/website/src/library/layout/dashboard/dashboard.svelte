<script lang="ts">
import type { Snippet } from "svelte";
import { Toaster } from "svelte-sonner";
import { navigating, page } from "$app/state";
import PageHeader from "$lib/blocks/page-header/page-header.svelte";
import { generateSidebarRoutes } from "$lib/constants";
import { getGuild, getGuilds, layoutState, saveModal, shake } from "$lib/utility/context.svelte";
import { Header, Sidebar, UnsavedChanges } from "./components";

type Props = {
	children: Snippet;
};

const { children }: Props = $props();

const guild = getGuild();
const guilds = getGuilds();

const sections = generateSidebarRoutes(guild.id);

const getCurrentPlugin = () => {
	const basePathname = page.url.pathname.split("/").slice(0, 4).join("/");
	const plugin = Object.values(sections)
		.flat()
		.find((p) => p.link.startsWith(basePathname));

	if (!plugin) {
		throw new Error("Plugin not found for the current path.");
	}

	return plugin;
};

let plugin = $state(getCurrentPlugin());

let showLoader = $state(false);
let loaderTimeout: ReturnType<typeof setTimeout> | null = null;

$effect(() => {
	if (navigating.to) {
		loaderTimeout = setTimeout(() => {
			showLoader = true;
		}, 200);
	} else {
		if (loaderTimeout) {
			clearTimeout(loaderTimeout);
			loaderTimeout = null;
		}
		showLoader = false;
	}

	return () => {
		if (loaderTimeout) {
			clearTimeout(loaderTimeout);
		}
	};
});

$effect(() => {
	plugin = getCurrentPlugin();
	layoutState.sideBarOpen = false;
	document.body.style.overflow = "clip";
});

const toggleOpen = () => {
	layoutState.sideBarOpen = !layoutState.sideBarOpen;
};
</script>

<svelte:window
  onresize={() => {
    if (window.innerWidth > 675) {
      layoutState.sideBarOpen = false;
      document.body.style.overflow = "clip";
    }
  }}
  bind:scrollY={layoutState.scrollY}
/>

<Toaster richColors />

<svelte:head>
  <title>{plugin.name} | {guild.name}</title>
</svelte:head>

<PageHeader />

<div class="with-sidebar">
  <div id="sidebar" class:open={layoutState.sideBarOpen}>
    <Sidebar {guild} {guilds} {plugin} />
  </div>
  <div id="content">
    <Header {plugin} {toggleOpen} />
    {#key page.url.pathname}
      <div id="dashboard" class:shake={shake.shake}>
        {#if showLoader}
          <div class="loading-container">
            <div class="dots">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          </div>
        {:else}
          {@render children()}
        {/if}
      </div>
    {/key}
    {#if saveModal.show && !saveModal.submitting}
      <UnsavedChanges />
    {/if}
  </div>
</div>

<style>
  @keyframes shake {
    0% {
      transform: translate(1px, 1px) rotate(0deg);
    }
    10% {
      transform: translate(-1px, -2px) rotate(-1deg);
    }
    20% {
      transform: translate(-2px, 0px) rotate(1deg);
    }
    30% {
      transform: translate(3px, 2px) rotate(0deg);
    }
    40% {
      transform: translate(1px, -1px) rotate(1deg);
    }
    50% {
      transform: translate(-1px, 2px) rotate(-1deg);
    }
    60% {
      transform: translate(-3px, 1px) rotate(0deg);
    }
    70% {
      transform: translate(3px, 1px) rotate(-1deg);
    }
    80% {
      transform: translate(-1px, -1px) rotate(1deg);
    }
    90% {
      transform: translate(1px, 2px) rotate(0deg);
    }
    100% {
      transform: translate(1px, -2px) rotate(-1deg);
    }
  }

  .shake {
    animation: shake 0.5s;
  }

  .with-sidebar {
    position: relative;
    z-index: 1;
    display: flex;
  }

  .with-sidebar > :first-child {
    flex-basis: 18.75rem;
    flex-shrink: 0;
  }

  .with-sidebar > :last-child {
    flex-grow: 999;
    min-inline-size: 60%;
  }

  #content {
    /* overflow: scroll; */
    background: transparent;
  }

  #dashboard {
    width: 100%;
    height: 100%;
    overflow-y: scroll;
    height: calc(100vh - var(--header-height) - var(--header-height-lg));
    padding: var(--space-m);
    padding-inline: var(--space-m);
  }

  #sidebar {
    resize: horizontal;
    z-index: 1;
    position: sticky;
    top: var(--header-height);
    height: calc(100vh - var(--header-height));
    transition: left 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
    background: var(--navbar-bg);
    backdrop-filter: blur(12px);
    border-right: var(--glass-border-medium);
  }

  @media (max-width: 875px) {
    #sidebar {
      position: fixed;
      top: calc(var(--header-height) * 2);
      bottom: 0;
      height: auto;
      width: 100%;
      background-color: var(--clr-bg);
      backdrop-filter: blur(5rem);
      transition: left 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      padding: var(--space-m);
      left: -100%;
    }

    #sidebar.open {
      left: 0;
      overflow-y: auto;
    }
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 50vh;
  }

  .dots {
    display: flex;
    gap: var(--space-xs);
    align-items: center;
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--clr-primary);
    animation: bounce 1.4s ease-in-out infinite;
  }

  .dot:nth-child(1) {
    animation-delay: 0s;
  }

  .dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes bounce {
    0%,
    80%,
    100% {
      transform: scale(0.8) translateY(0);
      opacity: 0.5;
    }
    40% {
      transform: scale(1.2) translateY(-10px);
      opacity: 1;
    }
  }
</style>
