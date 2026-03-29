<script lang="ts">
import { BellIcon } from "lucide-svelte";
import MoonIcon from "lucide-svelte/icons/moon";
import SunIcon from "lucide-svelte/icons/sun";
import { onMount } from "svelte";
import { page } from "$app/state";
import { layoutState } from "$lib/utility/context.svelte";
import { getActiveTheme, toggleTheme } from "$lib/utility/theme";
import { DiscordUser } from "../discord-user";
import { Divider } from "../divider";

const user = page.data.session?.user;

let isLightTheme = $state(false);

onMount(() => {
	isLightTheme = getActiveTheme() === "light";
});

const handleThemeToggle = () => {
	isLightTheme = toggleTheme() === "light";
};
</script>

<div class="header-wrapper" class:bg-solid={layoutState.sideBarOpen}>
  <header class="repel">
    <div class="cluster space-l">
      <a href="/" class="cluster">
        <img class="icon" src="/icon.svg" alt="riceball-icon" />
        <p class="fs:md fw:bold show:md">Rice Ball</p>
      </a>
      <div class="cluster space-l | show:md">
        <Divider orientation="vertical" />
        <nav class="cluster space-m">
          <a href="/"> Support </a>
          <a href="/commands"> Docs </a>
          <a href="/commands"> Commands </a>
        </nav>
      </div>
    </div>
    <div class="cluster space-m">
      <button
        type="button"
        class="theme-toggle"
        onclick={handleThemeToggle}
        aria-label={isLightTheme
          ? "Switch to dark theme"
          : "Switch to light theme"}
        title={isLightTheme ? "Dark mode" : "Light mode"}
      >
        {#if isLightTheme}
          <MoonIcon class="theme-icon" size="1rem" strokeWidth="2" />
        {:else}
          <SunIcon class="theme-icon" size="1rem" strokeWidth="2" />
        {/if}
      </button>
      <BellIcon class="icon" size="1.25em" strokeWidth="1.5" />
      <DiscordUser {user} />
    </div>
  </header>
</div>

<style lang="scss">
  .icon {
    height: 1.75rem;
    filter: drop-shadow(
      0 0 0.5rem hsl(var(--theme-hue), var(--theme-saturation-high), 60%, 0.3)
    );
  }

  .header-wrapper {
    padding-inline: var(--space-m);
    display: flex;
    align-items: center;
    height: var(--header-height);
    margin: 0 auto;
    position: sticky;
    top: 0;
    background: var(--navbar-bg);
    backdrop-filter: blur(12px);
    border-bottom: var(--glass-border-medium);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 100;

    &.bg-solid {
      background: var(--navbar-bg-solid);
      border-bottom: var(--glass-border-strong);
    }
  }

  a {
    transition: all 0.25s ease;
    color: var(--clr-neutral);
    font-weight: 500;
    text-decoration: none;
  }

  a:hover {
    color: var(--clr-primary);
    text-decoration: none;
  }

  .theme-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border: 1px solid var(--clr-bg-border);
    border-radius: var(--radius-full);
    background-color: var(--clr-bg-input);
    color: var(--txt-main);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .theme-toggle:hover {
    border-color: var(--clr-bg-border-hover);
    color: var(--clr-primary);
    transform: translateY(-1px);
  }

  .theme-toggle:focus-visible {
    outline: 2px solid transparent;
    box-shadow: 0 0 0 0.225rem hsl(var(--clr-bg-border-hover-hsl) / 0.08);
  }

  .theme-icon {
    transition: transform 0.2s ease;
  }

  .theme-toggle:hover .theme-icon {
    transform: rotate(12deg);
  }

  .show\:md {
    display: none;
  }

  @media (min-width: 875px) {
    .show\:md {
      display: flex;
    }
  }

  @media (max-width: 875px) {
    .header-wrapper {
      position: relative;
    }
  }
</style>
