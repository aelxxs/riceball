<script lang="ts">
import type { WithElementRef } from "bits-ui";
import type { Icon } from "lucide-svelte";
import type { HTMLInputAttributes } from "svelte/elements";

let {
	label,
	ref = $bindable(null),
	value = $bindable(),
	class: className,
	icon,
	...restProps
}: WithElementRef<HTMLInputAttributes & { label?: string; icon?: typeof Icon }> = $props();
</script>

<div class="container">
  <!-- permenent placeholder -->
  {#if icon}
    {@const Icon = icon}
    <span>
      <Icon size="1.25em" />
    </span>
  {/if}
  {#if label}
    <span>{label}</span>
  {/if}
  <input bind:this={ref} bind:value {...restProps} />
</div>

<style>
  .container {
    display: flex;
    position: relative;
    width: 100%;
    font-weight: var(--font-weight-normal);
    line-height: var(--line-height-body);
    letter-spacing: var(--letter-spacing-normal);
    border: 1.5px solid transparent;
    border-radius: var(--border-radius);
    padding: var(--space-xs) var(--space-xs);
    color: var(--txt-main);
    background-color: var(--clr-bg-input);
    transition-property: border-color, box-shadow;
    transition-duration: var(--input-transition-duration);
    transition-timing-function: var(--input-transition-timing-function);
    outline: 2px solid transparent;
    align-items: center;
    vertical-align: middle;
  }

  .container span {
    display: flex;
    color: var(--txt-muted);
    font-weight: var(--font-weight-medium);
    margin-right: var(--space-2xs);
  }

  .container input {
    flex: 1;
    border: none;
    background-color: transparent;
    color: inherit;
    font-size: var(--font-size-body);
    font-family: var(--font-family);
    line-height: inherit;
    letter-spacing: inherit;
    padding: 0;
    margin: 0;
    outline: none;
  }

  input::placeholder {
    color: var(--txt-main);
    opacity: 0.75; /* lighter */
  }

  .container:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .container:hover {
    border-color: var(--clr-bg-border-hover);
  }

  .container:focus-within {
    border-color: var(--clr-bg-border-hover);
    box-shadow: 0 0 0 0.225rem hsl(var(--clr-bg-border-hover-hsl) / 0.2);
  }

  .container:has(input[data-fs-error]) {
    border-color: var(--clr-theme-error);
  }

  .container:has(input[data-fs-error]):focus-within {
    box-shadow: 0 0 0 0.225rem var(--clr-theme-error-transparent);
  }
</style>
