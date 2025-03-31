<script lang="ts">
import type { WithElementRef, WithoutChildren } from "bits-ui";
import type { HTMLTextareaAttributes } from "svelte/elements";

const {
	ref = $bindable(null),
	value = $bindable(),
	class: className,
	...restProps
}: WithoutChildren<WithElementRef<HTMLTextareaAttributes>> = $props();
</script>

<textarea bind:this={ref} bind:value {...restProps}></textarea>

<style>
  textarea {
    width: 100%;
    min-height: 8rem;
    font-weight: var(--font-weight-normal);
    line-height: var(--line-height-body);
    letter-spacing: var(--letter-spacing-normal);
    border: 1px solid var(--clr-bg-border);
    border: 1.5px solid transparent;
    border-radius: var(--border-radius);
    padding: var(--space-xs) var(--space-xs);
    color: var(--txt-main);
    background-color: var(--clr-bg-input);
    transition-property: border-color, box-shadow;
    transition-duration: var(--input-transition-duration);
    transition-timing-function: var(--input-transition-timing-function);
    outline: 2px solid transparent;
    resize: vertical;
  }

  textarea::placeholder {
    color: var(--txt-main);
    opacity: 0.5;
  }

  textarea:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    resize: none;
  }

  textarea:hover {
    border-color: var(--clr-bg-border-hover);
  }

  textarea:focus-within {
    border-color: var(--clr-bg-border-hover);
    box-shadow: 0 0 0 0.225rem hsl(var(--clr-bg-border-hover-hsl) / 0.05);
  }
</style>
