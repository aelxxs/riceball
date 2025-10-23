<script lang="ts">
import { RadioGroup as RadioGroupPrimitive, type WithoutChildrenOrChild } from "bits-ui";

let {
	ref = $bindable(null),
	class: className,
	...restProps
}: WithoutChildrenOrChild<RadioGroupPrimitive.ItemProps> = $props();
</script>

<RadioGroupPrimitive.Item bind:ref {...restProps}>
  {#snippet children()}
    <div data-radio-group-item-indicator></div>
  {/snippet}
</RadioGroupPrimitive.Item>

<style>
  :global {
    @layer base, radio-group-item;

    @layer base {
      :root {
        --radio-group-item-size: 1.275rem;
        --radio-group-item-indicator-size: calc(
          var(--radio-group-item-size) * 0.425
        );
      }
    }

    @layer radio-group-item {
      [data-radio-group-item] {
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: var(--radio-group-item-size);
        height: var(--radio-group-item-size);
        border-radius: var(--radius-full);
        border: 0;
        background-color: var(--clr-bg-input-light);
        outline: 1px solid transparent;
      }

      [data-radio-group-item]:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      [data-radio-group-item][data-state="checked"] {
        background-color: var(--clr-theme-2);
      }

      [data-radio-group-item-indicator] {
        width: var(--radio-group-item-indicator-size);
        height: var(--radio-group-item-indicator-size);
        background-color: var(--txt-bold);
        border-radius: var(--radius-full);
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      [data-radio-group-item][data-state="checked"]
        [data-radio-group-item-indicator] {
        opacity: 1;
      }

      [data-radio-group-item]:not(:disabled):hover
        [data-radio-group-item-indicator] {
        opacity: 1;
      }

      [data-radio-group-item]:focus-visible {
        border-color: var(--clr-theme-2);
        box-shadow: 0 0 0 0.225rem hsl(var(--clr-bg-border-hover-hsl) / 0.05);
      }
    }
  }
</style>
