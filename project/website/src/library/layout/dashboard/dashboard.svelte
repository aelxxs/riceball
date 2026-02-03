<script lang="ts">
import type { Snippet } from "svelte";
import { onMount } from "svelte";
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

let particles: Array<{
	id: number;
	x: number;
	y: number;
	size: number;
	duration: number;
}> = [];

onMount(() => {
	particles = Array.from({ length: 8 }, (_, i) => ({
		id: i,
		x: Math.random() * 100,
		y: Math.random() * 100,
		size: Math.random() * 3 + 1,
		duration: Math.random() * 25 + 20,
	}));
});

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

<!-- Animated Background -->
<div class="background">
  <div class="gradient-orb orb-1"></div>
  <div class="gradient-orb orb-2"></div>

  <!-- Particles -->
  <div class="particles-container">
    {#each particles as particle (particle.id)}
      <div
        class="particle"
        style="--x: {particle.x}%; --y: {particle.y}%; --size: {particle.size}px; --duration: {particle.duration}s"
      ></div>
    {/each}
  </div>

  <!-- Grid -->
  <div class="grid"></div>
</div>

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
  .background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .gradient-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.15;
    animation: float 25s ease-in-out infinite;
  }

  .orb-1 {
    width: 500px;
    height: 500px;
    background: var(--gradient-orb-primary);
    top: -150px;
    right: -150px;
    animation-delay: 0s;
  }

  .orb-2 {
    width: 400px;
    height: 400px;
    background: var(--gradient-orb-accent);
    bottom: -100px;
    left: 10%;
    animation-delay: -10s;
  }

  .particles-container {
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .particle {
    position: absolute;
    left: var(--x);
    top: var(--y);
    width: var(--size);
    height: var(--size);
    background: radial-gradient(
      circle,
      hsl(var(--theme-hue), var(--theme-saturation-high), 60%, 0.4),
      transparent
    );
    border-radius: 50%;
    animation: float var(--duration) ease-in-out infinite;
    opacity: 0.3;
  }

  .grid {
    position: absolute;
    width: 100%;
    height: 100%;
    background-image: var(--grid-pattern);
    background-size: 60px 60px;
    opacity: 0.8;
  }

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

  @keyframes float {
    0%,
    100% {
      transform: translateY(0px) translateX(0px);
    }
    33% {
      transform: translateY(-30px) translateX(20px);
    }
    66% {
      transform: translateY(20px) translateX(-20px);
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
    background: var(--gradient-primary);
    box-shadow: 0 0 20px
      hsl(var(--theme-hue), var(--theme-saturation-high), 60%, 0.5);
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
