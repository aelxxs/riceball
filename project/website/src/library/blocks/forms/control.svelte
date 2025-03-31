<script lang="ts">
import { Control, Description, Label } from "formsnap";
import type { ComponentProps } from "svelte";

const {
	label,
	description = "",
	orientation = "vertical",
	screenReaderOnly = false,
	children: childrenProp,
	...restProps
}: ComponentProps<typeof Control> & {
	/**
	 * The label for the control.
	 */
	label?: string;
	/**
	 * The description for the control.
	 *
	 * only shown if `screenReaderOnly` is `false` and `label` is present.
	 */
	description?: string;
	orientation?: "horizontal" | "vertical";
	/**
	 * Whether the label should be hidden from screen readers.
	 *
	 * @default false
	 */
	screenReaderOnly?: boolean;
} = $props();
</script>

{#snippet labelSnippet()}
  {#if label}
    <Label>
      {#snippet child({ props })}
        <label
          class:sr-only={screenReaderOnly}
          class:txt-muted={!description.length}
          class:fw-md={description.length}
          {...props}
        >
          {label}
        </label>
      {/snippet}
    </Label>
  {/if}
  {#if label && description && !screenReaderOnly}
    <Description class="txt-muted">{description}</Description>
  {/if}
{/snippet}

<Control {...restProps}>
  {#snippet children({ props })}
    {#if orientation === "vertical"}
      <div class="stack space-xs">
        {@render labelSnippet()}
        {@render childrenProp?.({ props })}
      </div>
    {:else}
      <div class="cluster no-wrap align-start space-xs">
        {@render childrenProp?.({ props })}
        <div class="stack space-xs">
          {@render labelSnippet()}
        </div>
      </div>
    {/if}
  {/snippet}
</Control>
