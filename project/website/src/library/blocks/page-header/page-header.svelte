<script lang="ts">
import { page } from "$app/state";
import { layoutState } from "$lib/utility/context.svelte";
import { BellIcon } from "lucide-svelte";
import { DiscordUser } from "../discord-user";
import { Divider } from "../divider";

const user = page.data.session?.user;
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
      <BellIcon class="icon" size="1.25em" strokeWidth="1.5" />
      <DiscordUser {user} />
    </div>
  </header>
</div>

<style lang="scss">
  .icon {
    height: 1.75rem;
    filter: drop-shadow(0 0 0.5rem var(--clr-bg-border));
  }
  .header-wrapper {
    padding-inline: var(--space-m);
    display: flex;
    align-items: center;
    height: var(--header-height);
    margin: 0 auto;
    position: sticky;
    top: 0;
    background-color: var(--clr-bg);

    backdrop-filter: blur(5rem);
    border-bottom: 1px solid var(--clr-bg-border);
    transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
    z-index: 1;
    &.bg-solid {
      background-color: var(--clr-bg);
    }
  }

  a {
    transition: all 0.25s;
  }

  a:hover {
    text-decoration: underline;
    color: var(--txt-themed);
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
