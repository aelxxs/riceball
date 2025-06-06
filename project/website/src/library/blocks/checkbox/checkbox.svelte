<script lang="ts">
import {
	Checkbox as CheckboxPrimitive,
	type WithoutChildrenOrChild,
} from "bits-ui";
import Check from "lucide-svelte/icons/check";
import Minus from "lucide-svelte/icons/minus";
import { fly } from "svelte/transition";

let {
	ref = $bindable(null),
	checked = $bindable(false),
	indeterminate = $bindable(false),
	outlined = $bindable(false),
	class: className,
	...restProps
}: WithoutChildrenOrChild<
	CheckboxPrimitive.RootProps & { outlined?: boolean }
> = $props();

const flyIn = { y: -7.5, duration: 350, opacity: 0 };
const flyOut = { y: 7.5, duration: 250, opacity: 0 };
</script>

<CheckboxPrimitive.Root
  data-outlined={outlined}
  bind:checked
  bind:indeterminate
  {...restProps}
>
  {#snippet children({ checked, indeterminate })}
    <div class="inline-flex">
      {#if checked}
        <div class="inline-flex" in:fly={flyIn} out:fly={flyOut}>
          <Check size={12} strokeWidth={6} />
        </div>
      {:else if indeterminate}
        <div class="inline-flex" in:fly={flyIn} out:fly={flyOut}>
          <Minus size={12} strokeWidth={6} />
        </div>
      {/if}
    </div>
  {/snippet}
</CheckboxPrimitive.Root>

<style>
  :global {
    @layer base, checkbox, indicator;

    @layer base {
      :root {
        --checkbox-size: var(--space-m);
        --checkbox-border-width: 1.25px;
        --checkbox-border-radius: var(--radius-xs);
      }
    }

    @layer checkbox {
      [data-checkbox-root] {
        border: 1px solid red;
        display: inline-flex;
        flex-shrink: 0;
        height: var(--checkbox-size);
        width: var(--checkbox-size);
        cursor: pointer;
        align-items: center;
        justify-content: center;
        border-radius: var(--checkbox-border-radius);
        outline: 1.25px solid transparent;
        color: var(--txt-bold);
        background-color: var(--clr-bg-input-light);
        transition-property: background-color, border-color, box-shadow;
        transition-duration: var(--input-transition-duration);
        transition-timing-function: var(--input-transition-timing-function);
      }

      [data-checkbox-root][data-outlined="true"] {
        background-color: transparent;
        outline-color: var(--clr-bg-border);
      }

      [data-checkbox-root]:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      [data-checkbox-root][data-state="checked"] {
        outline-color: var(--clr-theme-2);
        background-color: var(--clr-theme-2);
        opacity: 1;
      }

      [data-checkbox-root][data-outlined="true"][data-state="checked"] {
        outline-color: var(--clr-theme-2);
        outline-color: transparent;
      }

      [data-checkbox-root]:hover {
        outline-color: var(--clr-bg-border-hover);
      }

      [data-checkbox-root]:focus-visible {
        outline-color: var(--clr-theme-2);
        box-shadow: 0 0 0 0.225rem hsl(var(--clr-bg-border-hover-hsl) / 0.05);
      }
    }

    @layer indicator {
      [data-checkbox-indicator] {
        display: none;
      }

      [data-checkbox-root][data-state="checked"] [data-checkbox-indicator],
      [data-checkbox-root][data-state="indeterminate"]
        [data-checkbox-indicator] {
        display: inline-flex;
      }
    }
  }
</style>
