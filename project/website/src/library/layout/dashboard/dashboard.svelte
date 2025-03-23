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
  import { type Snippet } from "svelte";
  import { Toaster } from "svelte-sonner";
  import { slide } from "svelte/transition";
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
    return Object.values(sections)
      .flat()
      .find((p) => p.link.startsWith(basePathname))!;
  };

  let plugin = $state(getCurrentPlugin());

  $effect(() => {
    plugin = getCurrentPlugin();
    layoutState.sideBarOpen = false;
    document.body.style.overflow = "auto";
  });

  let previousScrollY = layoutState.scrollY;
  const toggleOpen = () => {
    layoutState.sideBarOpen = !layoutState.sideBarOpen;

    if (layoutState.sideBarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
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
      document.body.style.overflow = "auto";
    }
  }}
  bind:scrollY={layoutState.scrollY}
/>

<Toaster richColors />

<div class="with-sidebar">
  <div id="sidebar" class:open={layoutState.sideBarOpen}>
    <Sidebar {guild} {guilds} {plugin} />
  </div>
  <div id="content">
    <Header {plugin} {toggleOpen} />
    {#key page.url.pathname}
      <div class="grid-test" class:shake={shake.shake}>
        <div id="dashboard" transition:slide={{ duration: 250 }}>
          {@render children()}
        </div>
      </div>
    {/key}
    {#if saveModal.show && !saveModal.submitting}
      <UnsavedChanges />
    {/if}
  </div>
</div>

<style>
  .grid-test {
    display: grid;
    grid-template-rows: 1fr;
    gap: var(--gutter, 1rem);
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

  .shake {
    animation: shake 0.5s;
  }

  .with-sidebar {
    display: flex;
    gap: var(--gutter, 1rem);
  }

  .with-sidebar > :first-child {
    flex-basis: 16.5rem;
    flex-shrink: 0;
  }

  .with-sidebar > :last-child {
    flex-grow: 999;
    min-inline-size: 60%;
  }

  #content {
    padding-bottom: 1.25rem;
    position: relative;
    /* padding-inline: var(--space-s); */
  }

  #dashboard {
    position: relative;
    padding-inline: var(--space-m);
  }

  #sidebar {
    z-index: 1;
    position: sticky;
    top: var(--header-height);
    height: calc(100vh - var(--header-height));
    transition: left 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
    /* background-color: var(--clr-bg-accent); */
    /* padding-inline: var(--space-m); */
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
      border-top: 1px solid var(--clr-bg-border);
    }

    #sidebar.open {
      left: 0;
      overflow-y: auto;
    }

    #content {
      width: 100%;
    }

    #dashboard {
      padding-inline: 0;
    }
  }
</style>
