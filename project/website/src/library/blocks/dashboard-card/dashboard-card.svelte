<script lang="ts">
  // - Icons
  import ChevronDown from "lucide-svelte/icons/chevron-down";

  import { Collapsible } from "bits-ui";
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

  const {
    id,
    title,
    description,
    children,
    isOpen,
    isSideBySide,
    toggle,
  }: Props = $props();

  /** Logic */
  let localIsOpen = $state(true);

  $effect(() => {
    if (isSideBySide && $isSideBySide) {
      if (isOpen) {
        isOpen.subscribe((value) => (localIsOpen = value));
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

<Collapsible.Root {id} class="root box stack" open={localIsOpen}>
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
            <div {...props} transition:slide>
              <Divider />
              {@render children?.()}
            </div>
          {/if}
        {/snippet}
      </Collapsible.Content>
    </div>
  {/snippet}
</Collapsible.Root>

<style>
  .root {
    --padding: var(--space-m);
  }

  .trigger {
    border: none;
    cursor: pointer;
    padding: 0;
    background: none;
    transition: opacity 0.2s ease-out;

    &:hover {
      opacity: 0.75;
    }
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
