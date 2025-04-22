<script lang="ts">
// - Icons
import { enhance } from "$app/forms";
import { Button } from "$lib/blocks/button";
import { Divider } from "$lib/blocks/divider";
import Switch from "$lib/blocks/switch/switch.svelte";
import {
	getAppState,
	getGuild,
	layoutState,
} from "$lib/utility/context.svelte";
import ChevronLeftIcon from "lucide-svelte/icons/chevron-left";
import HashIcon from "lucide-svelte/icons/hash";
import MenuIcon from "lucide-svelte/icons/menu";
import XIconIcon from "lucide-svelte/icons/x";
import { onMount } from "svelte";
// @ts-ignore
import Motion from "svelte-motion/src/motion/MotionSSR.svelte";
import { fade, fly } from "svelte/transition";

const duration = 0.3;

const { plugin, toggleOpen } = $props();

const goBack = () => window.history.back();

const state = getAppState();
const guild = getGuild();
</script>

<div class="transition-wrapper" class:bg-solid={layoutState.sideBarOpen}>
  {#if state.showControls}
    <div
      class="header"
      in:fly={{ duration: 250, x: 100 }}
      out:fly={{ duration: 250, x: -10 }}
    >
      <div class="repel">
        <div class="cluster space-2xs no-wrap">
          <Button size="icon" variant="ghost" onclick={goBack}>
            <ChevronLeftIcon size="1.2rem" />
          </Button>
          <h4>{state.controlTitle.value}</h4>
        </div>
        <div
          class="cluster"
          in:fly={{ duration: 250, x: 50, delay: 120 }}
          out:fly={{ duration: 250, x: 50, delay: 0 }}
        >
          <!-- controls -->
          {#each state.controls as control}
            <Button variant={control.variant} onclick={control.handler}>
              <div class="cluster space-2xs">
                {#if control.icon}
                  {@const Icon = control.icon}
                  <Icon size={20} />
                {/if}
                {control.label}
              </div>
            </Button>
          {/each}
        </div>
      </div>
    </div>
  {:else}
    <div class="header" out:fly={{ duration: 250, x: -20 }}>
      <div class="repel">
        <div class="cluster no-wrap">
          <div class="cluster hide:md">
            <Button variant="icon-only" onclick={toggleOpen}>
              {#if layoutState.sideBarOpen}
                <XIconIcon size={20} />
              {:else}
                <MenuIcon size={20} />
              {/if}
            </Button>
            <Divider orientation="vertical" />
          </div>
          <div class="show:md">
            {#if plugin.icon}
              {@const Icon = plugin.icon}
              <Icon size={20} />
            {/if}
          </div>
          {#key plugin.name}
            <div class="text">
              {#each plugin.name.split("") as item, index}
                <Motion
                  initial={{
                    opacity: 0,
                    filter: "blur(4px)",
                    rotateX: 90,
                    y: 5,
                  }}
                  transition={{
                    ease: "easeOut",
                    duration: duration,
                    delay: index * 0.015,
                  }}
                  animate={{
                    opacity: 1,
                    filter: "blur(0px)",
                    rotateX: 0,
                    y: 0,
                  }}
                  let:motion
                >
                  <span use:motion class="text char fs:sm fw:bold">
                    {item}
                  </span>
                </Motion>
              {/each}
            </div>
            <Motion
              initial={{ opacity: 0, rotateX: 120 }}
              transition={{
                ease: "easeOut",
                duration: 0.3,
                delay: 0.175,
              }}
              animate={{
                rotateX: 0,
                opacity: 1,
              }}
              let:motion
            >
              <div use:motion class="show:md cluster no-wrap">
                <Divider orientation="vertical" />
                <p>{plugin.desc}</p>
              </div>
            </Motion>
          {/key}
        </div>

        <div transition:fade={{ delay: 250 }} style="display: inline-flex;">
          {#if plugin.id && guild.settings[plugin.id]}
            {@const enabled = guild.settings[plugin.id].enabled}
            <form
              method="POST"
              action={`/manage/${guild.id}?/togglePlugin`}
              use:enhance
            >
              <input type="hidden" name="pluginId" value={plugin.id} />
              <input type="hidden" name="enabled" value={!enabled} />
              <div class="cluster">
                <p class="txt:bold fw:md">
                  {enabled ? "Enabled" : "Disabled"}
                </p>
                <Switch checked={enabled} type="submit" />
              </div>
            </form>
            <!-- {:else}
            <HashIcon size={18} /> -->
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  .transition-wrapper {
    display: grid;
    grid-template-columns: 1fr;
    position: sticky;
    top: var(--header-height);
    z-index: 1;
    background-color: var(--clr-bg-accent);
    overflow: hidden;
    backdrop-filter: blur(5rem);
    transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
    height: var(--header-height-lg);
    border-bottom: 1px solid var(--clr-bg-border);
    &.bg-solid {
      background-color: var(--clr-bg);
    }
  }

  .header {
    display: flex;
    overflow: hidden;
    grid-area: 1/1/2/2;
    padding-inline: var(--space-m);
  }

  .text {
    display: inline-block;
    white-space: pre;
    letter-spacing: -3.8px;
  }

  .char {
    letter-spacing: 0.015em;
  }

  @media (max-width: 875px) {
    .transition-wrapper {
      height: var(--header-height);
      top: 0;
    }
  }
</style>
