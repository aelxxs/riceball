<script lang="ts">
// - Icons
import ChevronDown from "lucide-svelte/icons/chevron-down";

import type { ManagedGuild } from "$lib/types";
import { flyAndScale } from "$lib/utility/transitions";
import type { User } from "@auth/sveltekit";
import { signIn, signOut } from "@auth/sveltekit/client";
import { DropdownMenu } from "bits-ui";
import {
	BoxIcon,
	HomeIcon,
	LogOutIcon,
	Settings2,
	UserIcon,
} from "lucide-svelte";
import { Button } from "../button";
import Divider from "../divider/divider.svelte";

type Props = {
	user?: User;
};

const { user }: Props = $props();

let open = $state(false);
</script>

{#if user}
  <DropdownMenu.Root bind:open>
    <DropdownMenu.Trigger class="cluster space-xs">
      {#snippet child({ props })}
        <div {...props}>
          <img
            class="profile__icon"
            class:shrink={open}
            src={user.image}
            alt="user avatar"
          />
          <!-- <p>{user.name}</p> -->
          <div class="arrow" class:rotate={open}>
            <ChevronDown size={18} />
          </div>
        </div>
      {/snippet}
    </DropdownMenu.Trigger>

    <DropdownMenu.Portal to="main">
      <DropdownMenu.Content
        align="end"
        forceMount
        sideOffset={8}
        class="dropdown__content stack box space-xs"
      >
        {#snippet child({ wrapperProps, props, open })}
          {#if open}
            <div {...wrapperProps}>
              <div {...props} transition:flyAndScale>
                <div class="cluster space-xs">
                  <img
                    class="dropdown__icon"
                    src={user.image}
                    alt="user avatar"
                  />
                  <div class="">
                    <p class="fw:bold fs:sm">{user.name}</p>
                    <small class="txt-muted">{user.email}</small>
                  </div>
                </div>

                <div class="space-s">
                  <Divider />
                </div>
                <div>
                  <div class="stack space-3xs">
                    <DropdownMenu.Item class="cluster space-xs">
                      {#snippet child({ props })}
                        <a
                          {...props}
                          href="/@me"
                          data-sveltekit-preload-data="hover"
                        >
                          <UserIcon size={16} />
                          <p class="txt:bold">My Profile</p>
                          <small class="txt-muted">@aelxxs</small>
                        </a>
                      {/snippet}
                    </DropdownMenu.Item>

                    <DropdownMenu.Item class="cluster space-xs">
                      {#snippet child({ props })}
                        <a
                          {...props}
                          href="/manage"
                          data-sveltekit-preload-data="hover"
                        >
                          <BoxIcon size={16} />
                          <p class="txt:bold">My Servers</p>
                        </a>
                      {/snippet}
                    </DropdownMenu.Item>

                    <DropdownMenu.Item class="cluster space-xs">
                      {#snippet child({ props })}
                        <a
                          {...props}
                          href="/manage"
                          data-sveltekit-preload-data="hover"
                        >
                          <Settings2 size={16} />
                          <p class="txt:bold">Settings</p>
                        </a>
                      {/snippet}
                    </DropdownMenu.Item>
                  </div>
                </div>
                <div class="space-xs">
                  <Divider />
                </div>
                <DropdownMenu.Item>
                  <div class="cluster">
                    <button
                      data-type="link"
                      class="button cluster space-xs"
                      onclick={() => signOut()}
                    >
                      <LogOutIcon size={16} class="txt-main" />
                      <span class="fw-md">Logout</span>
                    </button>
                  </div>
                </DropdownMenu.Item>
              </div>
            </div>
          {/if}
        {/snippet}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>
{:else}
  <Button
    class="button"
    onclick={() => signIn("discord", { redirectTo: "/manage" })}
    >Login with Discord
  </Button>
{/if}

<style lang="scss">
  :global {
    [data-dropdown-menu-trigger] {
      cursor: pointer;
    }

    [data-dropdown-content] {
      background-color: var(--clr-bg);
      border-radius: var(--border-radius);
      min-width: 10rem;
      z-index: 10;
    }

    [data-dropdown-menu-item] {
      cursor: pointer;
      outline: 0;
      border: 0;
      background: none;
      padding: var(--space-2xs) var(--space-2xs);
      border-radius: var(--border-radius);
    }

    [data-dropdown-menu-item]:hover {
      background-color: var(--clr-bg-input-active);
    }
  }

  .dropdown__content {
    background-color: var(--clr-bg);
    min-width: 10rem;
    z-index: 10;
    --padding: var(--space-s);
    box-shadow: var(--shadow-m);
    border: 1px solid var(--clr-bg-border);
  }

  .profile__icon {
    width: 2rem;
    border-radius: 50%;
    transition: transform 0.2s ease-out 0s;
  }

  .profile__icon.shrink {
    transform: scale(0.95);
  }

  .dropdown__icon {
    width: 2.75rem;
    border-radius: 50%;
  }

  .arrow {
    display: inline-flex;
    transform: rotate(0deg);
    transition: transform 0.2s ease-out 0s;
  }

  .rotate {
    transform: rotate(180deg);
    transition: transform 0.2s ease-out 0s;
  }
</style>
