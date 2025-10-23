<script lang="ts">
// - Icons

import { Popover } from "bits-ui";
import Palette from "lucide-svelte/icons/palette";
import { flyAndScale } from "$lib/utility/transitions";
import { Button } from "../button";
import Picker from "./picker.svelte";

const onClickClose = () => {
	isOpen = false;
};

let { format = "hex", color = $bindable("#ff0000"), showSelectedColor = $bindable(false) } = $props();

let isOpen = $state(false);
</script>

<Popover.Root bind:open={isOpen} onOpenChange={(open) => (isOpen = open)}>
  <Popover.Trigger class="color-picker-trigger">
    {#snippet child({ props })}
      {#if showSelectedColor}
        <div>
          <Button size="icon" variant="icon-only" {...props}>
            <div class="contain">
              <div class="alpha"></div>
              <div class="square" style:--bg={color}></div>
            </div>
          </Button>
        </div>
      {:else}
        <Button size="icon" variant="secondary" {...props}>
          <Palette size={16} />
        </Button>
      {/if}
    {/snippet}
  </Popover.Trigger>
  <Popover.Portal>
    <Popover.Content class="content" sideOffset={10} align="end" forceMount>
      {#snippet child({ wrapperProps, props, open })}
        <div {...wrapperProps}>
          {#if open}
            <div {...props} transition:flyAndScale>
              <Picker bind:color {format} {onClickClose} />
            </div>
          {/if}
        </div>
      {/snippet}
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>

<style is:global>
  .color-picker-trigger {
    position: relative;
    cursor: pointer;
    outline: 0;
    background: none;
  }

  .content {
    position: relative;
    outline: 0;
    border: 0;
  }

  .contain {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    background-color: var(--bg);
    border-radius: var(--border-radius);
    overflow: hidden;
    position: relative;
  }

  .alpha {
    overflow: hidden;
    position: absolute;
    width: 90%;
    height: 90%;
    border-radius: var(--border-radius);
    background-color: white;
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill-opacity=".5"><rect x="6" width="6" height="6"/><rect y="6" width="6" height="6"/></svg>');
  }

  .square {
    overflow: hidden;
    width: 100%;
    height: 100%;
    position: relative;
    background-color: var(--bg);
  }
</style>
