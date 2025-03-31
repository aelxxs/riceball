<script lang="ts">
import { Select } from "bits-ui";
import { AtSignIcon, HashIcon } from "lucide-svelte";
import type { SelectItem } from "../select/select.svelte";

type Props = {
	type: "channel" | "role";
	items: SelectItem[];
	command: (item: SelectItem) => void;
};

const { type, items, command }: Props = $props();

let highlightedIndex = $state(0);
const flatItems = $derived(
	items.flatMap((item) => ("items" in item ? item.items : item)),
);
const ItemIcon = $derived(type === "channel" ? HashIcon : AtSignIcon);

// Exposed API methods
export function scrollUp() {
	highlightedIndex = Math.max(highlightedIndex - 1, 0);
	scrollToHighlighted();
}

export function scrollDown() {
	highlightedIndex = Math.min(highlightedIndex + 1, flatItems.length - 1);
	scrollToHighlighted();
}

export function selectHighlighted() {
	if (highlightedIndex >= 0 && highlightedIndex < flatItems.length) {
		const item = flatItems[highlightedIndex];
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

<Select.Root
  type="single"
  open
  onValueChange={(s) => {
    const flatItems = items.flatMap((item) =>
      "items" in item ? item.items : item,
    );
    const item = flatItems.find((i) => i.value === s);

    if (item) {
      command(item);
    }
  }}
>
  <Select.ContentStatic class="select-content stack space-2xs">
    {#snippet child({ props })}
      <div {...props}>
        {#each items as item}
          {#if "items" in item}
            <Select.Group>
              <Select.GroupHeading>
                <small class="fw:600">{item.label.toUpperCase()}</small>
              </Select.GroupHeading>
              {#each item.items as subItem, subIndex}
                {@const currentIndex = flatItems.findIndex(
                  (fi) => fi === subItem,
                )}
                <Select.Item
                  value={subItem.value}
                  label={subItem.label}
                  data-index={currentIndex}
                >
                  <div
                    class="item cluster space-xs"
                    class:data-highlighted={currentIndex === highlightedIndex}
                  >
                    <ItemIcon size={16} />
                    {subItem.label}
                  </div>
                </Select.Item>
              {/each}
            </Select.Group>
          {:else}
            {@const currentIndex = flatItems.findIndex((fi) => fi === item)}
            <Select.Item
              value={item.value}
              label={item.label}
              data-index={currentIndex}
            >
              <div
                class="item cluster space-xs"
                class:data-highlighted={currentIndex === highlightedIndex}
              >
                <ItemIcon size={16} />
                {item.label}
              </div>
            </Select.Item>
          {/if}
        {:else}
          <span>No items found</span>
        {/each}
      </div>
    {/snippet}
  </Select.ContentStatic>
</Select.Root>

<style>
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
