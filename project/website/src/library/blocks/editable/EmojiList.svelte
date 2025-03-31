<script lang="ts">
import { Select } from "bits-ui";

type SelectItem = {
	value: string;
	label: string;
	src: string;
};

type Props = {
	items: SelectItem[];
	command: (item: SelectItem) => void;
};

const { items, command }: Props = $props();

let highlightedIndex = $state(0);

export function scrollUp() {
	highlightedIndex = Math.max(highlightedIndex - 1, 0);
	scrollToHighlighted();
}

export function scrollDown() {
	highlightedIndex = Math.min(highlightedIndex + 1, items.length - 1);
	scrollToHighlighted();
}

export function selectHighlighted() {
	if (highlightedIndex >= 0 && highlightedIndex < items.length) {
		const item = items[highlightedIndex];
		if (item) {
			command(item);
		}
	}
}

function scrollToHighlighted() {
	const item = document.querySelector(`[data-index="${highlightedIndex}"]`);
	if (item) {
		item.scrollIntoView({ block: "nearest" });
	}
}
</script>

{#if items.length}
  <Select.Root
    type="single"
    open
    onValueChange={(s) => {
      const item = items.find((i) => i.value === s);

      if (item) {
        command(item);
      }
    }}
  >
    <Select.ContentStatic
      onmouseover={() => {
        highlightedIndex = -1;
      }}
      class="select-content stack space-2xs"
    >
      {#snippet child({ props })}
        <div {...props}>
          <Select.Group>
            <Select.GroupHeading>
              <small class="fw:600">EMOJI SEARCH RESULTS</small>
            </Select.GroupHeading>
            {#each items as item}
              {@const currentIndex = items.findIndex((fi) => fi === item)}
              <Select.Item
                value={item.value}
                label={item.label}
                data-index={currentIndex}
              >
                <div
                  class="item cluster space-xs"
                  class:data-highlighted={currentIndex === highlightedIndex}
                >
                  <!-- <ItemIcon size={16} /> -->
                  <!-- img -->
                  <img src={item.src} class="emoji" alt="" />
                  {item.label}
                </div>
              </Select.Item>
            {:else}
              <span>No items found</span>
            {/each}
          </Select.Group>
        </div>
      {/snippet}
    </Select.ContentStatic>
  </Select.Root>
{/if}

<style>
  .emoji {
    width: 1.5rem;
    height: 1.5rem;
  }

  .select-content {
    border-radius: var(--border-radius);
    background-color: var(--clr-bg-input);
    padding: var(--space-xs);
    max-height: 300px;
    overflow-y: auto;
    width: 24rem;
    border: 2px solid transparent;
    border-color: var(--clr-bg-border-hover);
    box-shadow: 0 0 0 0.225rem hsl(var(--clr-bg-border-hover-hsl) / 0.05);
  }

  .item {
    cursor: pointer;
    padding: var(--space-xs) var(--space-2xs);
    border-radius: var(--border-radius);
  }

  .item.data-highlighted,
  .item:hover {
    color: var(--txt-themed);
    background-color: var(--clr-bg-input-hover);
  }

  .highlighted {
    color: var(--txt-themed);
    background-color: var(--clr-bg-input-hover);
  }
</style>
