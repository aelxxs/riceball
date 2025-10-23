<script lang="ts">
import { Switch as SwitchPrimitive, type WithoutChildrenOrChild } from "bits-ui";

let {
	ref = $bindable(null),
	class: className,
	checked = $bindable(false),
	...restProps
}: WithoutChildrenOrChild<SwitchPrimitive.RootProps> = $props();
</script>

<SwitchPrimitive.Root bind:ref bind:checked {...restProps}>
  <SwitchPrimitive.Thumb />
</SwitchPrimitive.Root>

<style>
  :global {
    @layer base, switch, thumb;

    @layer base {
      :root {
        --switch-width: 40px;
        --switch-height: calc(var(--switch-width) / 1.75);
        --switch-padding: 4px;
        --thumb-size: calc(var(--switch-height) - (2 * var(--switch-padding)));
        --thumb-translate: calc(
          var(--switch-width) - var(--thumb-size) - (2 * var(--switch-padding))
        );
      }
    }

    @layer switch {
      [data-switch-root] {
        display: inline-flex;
        flex-shrink: 0;
        height: var(--switch-height);
        width: var(--switch-width);
        cursor: pointer;
        align-items: center;
        border-radius: var(--radius-full);
        border: 0;
        color: var(--txt-main);
        background-color: var(--clr-bg-input-light);
        transition-property: background-color, box-shadow;
        transition-duration: var(--input-transition-duration);
        transition-timing-function: var(--input-transition-timing-function);
        outline: 1px solid transparent;
        padding: 0 var(--switch-padding);
      }

      [data-switch-root]:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      [data-switch-root][data-state="checked"] {
        background-color: var(--clr-theme-2);
      }

      [data-switch-root]:focus-visible {
        box-shadow: 0 0 0 0.225rem hsl(var(--clr-bg-border-hover-hsl) / 0.05);
      }
    }

    @layer thumb {
      [data-switch-thumb] {
        width: var(--thumb-size);
        height: var(--thumb-size);
        border-radius: var(--radius-full);
        background-color: var(--txt-bold);
        transition:
          transform var(--input-transition-duration)
            var(--input-transition-timing-function),
          box-shadow var(--input-transition-duration)
            var(--input-transition-timing-function);
      }

      [data-switch-thumb][data-state="unchecked"] {
        transform: translateX(0);
        box-shadow: 2px 0px 4px var(--clr-shadow);
      }

      [data-switch-thumb][data-state="checked"] {
        transform: translateX(var(--thumb-translate));
        box-shadow: -2px 0px 4px var(--clr-shadow);
      }
    }
  }
</style>
