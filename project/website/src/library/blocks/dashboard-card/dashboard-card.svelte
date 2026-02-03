<script lang="ts">
// - Icons

import { Collapsible } from "bits-ui";
import ChevronDown from "lucide-svelte/icons/chevron-down";
import type { Snippet } from "svelte";
import type { Writable } from "svelte/store";
import { slide } from "svelte/transition";
import { Divider } from "../divider";

/** Props */
type Props = {
	id?: string;
	title: string;
	description?: string;
	children: Snippet;
	isOpen?: Writable<boolean>; // Shared state for side-by-side mode
	isSideBySide?: Writable<boolean>; // Whether modules are displayed side by side
	toggle?: (state: boolean) => void;
};

const { id, title, description, children, isOpen, isSideBySide, toggle }: Props = $props();

/** Logic */
let localIsOpen = $state(true);

$effect(() => {
	if (isSideBySide && $isSideBySide) {
		if (isOpen) {
			isOpen.subscribe((value) => {
				localIsOpen = value;
			});
		}
	}
});

function toggleOpen() {
	if (isSideBySide && $isSideBySide && isOpen) {
		const newState = !localIsOpen;
		isOpen.set(newState);
		toggle?.(newState);
	} else {
		localIsOpen = !localIsOpen;
		toggle?.(localIsOpen);
	}
}
</script>

<section>
  <Collapsible.Root {id} class="root box stack space-m" open={localIsOpen}>
    {#snippet child({ props })}
      <div {...props}>
        <Collapsible.Trigger class="trigger repel" onclick={toggleOpen}>
          {#snippet child({ props })}
            <div {...props}>
              <div class="stack space-xs">
                <p class="fs:sm fw:md">{title}</p>
                {#if description}
                  <p class="txt-muted">{description}</p>
                {/if}
              </div>
              <div class="arrow" class:rotate={localIsOpen}>
                <ChevronDown size={18} />
              </div>
            </div>
          {/snippet}
        </Collapsible.Trigger>
        <Collapsible.Content forceMount class="stack space-m">
          {#snippet child({ props })}
            {#if localIsOpen}
              <div transition:slide>
                <div {...props}>
                  <Divider />
                  <div>
                    {@render children?.()}
                  </div>
                </div>
              </div>
            {/if}
          {/snippet}
        </Collapsible.Content>
      </div>
    {/snippet}
  </Collapsible.Root>
</section>

<style>
  .root {
    --padding: var(--space-m);
    border-radius: var(--border-radius);
    background: linear-gradient(
      135deg,
      var(--glass-bg-subtle),
      var(--glass-bg-subtle)
    );
    border: var(--glass-border-light);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    position: relative;
    overflow: visible; /* allow dropdowns/select menus to render outside */
  }

  .root::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      hsl(var(--theme-hue), var(--theme-saturation-high), 60%, 0.5),
      transparent
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .root:hover {
    background: linear-gradient(
      135deg,
      var(--glass-bg-light),
      var(--glass-bg-subtle)
    );
    border: var(--glass-border-medium);
    box-shadow:
      0 8px 16px hsl(var(--theme-hue), var(--theme-saturation-high), 60%, 0.1),
      0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .root:hover::before {
    opacity: 1;
  }

  .trigger {
    border: none;
    cursor: pointer;
    padding: 0;
    background: none;
    transition: opacity 0.2s ease-out;

    &:hover {
      opacity: 0.85;
    }
  }

  .arrow {
    display: inline-flex;
    transform: rotate(0deg);
    transition: transform 0.2s ease-out 0s;
    color: hsl(var(--theme-hue), var(--theme-saturation-high), 60%, 0.8);
  }

  .rotate {
    transform: rotate(180deg);
    transition: transform 0.2s ease-out 0s;
  }
</style>
