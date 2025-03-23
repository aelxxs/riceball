<script lang="ts">
  import { page } from "$app/state";
  import { layoutState } from "$lib/utility/context.svelte";
  import { DiscordUser } from "../discord-user";
  import { Divider } from "../divider";

  const user = page.data.session?.user;
</script>

<div class="header-wrapper" class:bg-solid={layoutState.sideBarOpen}>
  <header class="repel">
    <div class="cluster space-l">
      <a href="/" class="cluster">
        <img class="icon" src="/icon.svg" alt="riceball-icon" />
        <p class="fs:md fw:bold">Rice Ball</p>
      </a>
      <div class="cluster space-l | show:md">
        <Divider orientation="vertical" />
        <nav class="cluster space-m">
          <a href="/"> Home </a>
          <a href="/support"> Support </a>
          <a href="/commands"> Commands </a>
        </nav>
      </div>
    </div>
    <DiscordUser {user} />
  </header>
</div>

<style lang="scss">
  .icon {
    // width: clamp(1.5rem, 1.75rem, 2.15rem);
    height: var(--space-l);
  }
  .header-wrapper {
    padding-inline: var(--space-m);
    display: flex;
    align-items: center;
    height: var(--header-height);
    margin: 0 auto;
    position: sticky;
    top: 0;
    background-color: var(--clr-bg-translucent);
    backdrop-filter: blur(5rem);
    border-bottom: 1px solid var(--clr-bg-border);
    transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
    z-index: 1;
    &.bg-solid {
      background-color: var(--clr-bg);
    }
  }

  header {
    // max-width: 75rem;
    margin: auto;
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
