<script lang="ts">
import { page } from "$app/state";
import { generateSidebarRoutes } from "$lib/constants";
import {
	getGuild,
	getGuilds,
	layoutState,
	saveModal,
	shake,
} from "$lib/utility/context.svelte";
import type { Snippet } from "svelte";
import { Toaster } from "svelte-sonner";
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

$effect(() => {
	plugin = getCurrentPlugin();
	layoutState.sideBarOpen = false;
	document.body.style.overflow = "clip";
});

let previousScrollY = layoutState.scrollY;
const toggleOpen = () => {
	layoutState.sideBarOpen = !layoutState.sideBarOpen;

	if (layoutState.sideBarOpen) {
		document.body.style.overflow = "hidden";
	} else {
		document.body.style.overflow = "clip";
	}

	if (layoutState.sideBarOpen && layoutState.scrollY > 0) {
		previousScrollY = layoutState.scrollY;
		document.body.scrollIntoView({
			behavior: "smooth",
		});
	} else {
		window.scroll(0, previousScrollY);
		previousScrollY = 0;
	}
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

<div class="with-sidebar">
  <div id="sidebar" class:open={layoutState.sideBarOpen}>
    <Sidebar {guild} {guilds} {plugin} />
  </div>
  <div id="content">
    <Header {plugin} {toggleOpen} />
    {#key page.url.pathname}
      <div id="dashboard" class:shake={shake.shake}>
        {@render children()}
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
    display: flex;
  }

  .with-sidebar > :first-child {
    flex-basis: 20rem;
    flex-shrink: 0;
  }

  .with-sidebar > :last-child {
    flex-grow: 999;
    min-inline-size: 60%;
  }

  #dashboard {
    width: 100%;
    height: 100%;
    overflow-y: scroll;
    height: calc(100vh - var(--header-height) - var(--header-height-lg));
    padding: var(--space-l);
    padding-inline: var(--space-l);
  }

  #sidebar {
    resize: horizontal;
    z-index: 1;
    position: sticky;
    top: var(--header-height);
    height: calc(100vh - var(--header-height));
    transition: left 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
    background-color: var(--clr-bg);
    border-right: 1px solid var(--clr-bg-border);
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
</style>
