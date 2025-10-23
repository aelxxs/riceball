<script lang="ts">
// - Icons

import { Select } from "bits-ui";
import { useFormControl } from "formsnap";
import type { Icon as IconType } from "lucide-svelte";
import CheckIcon from "lucide-svelte/icons/check";
import ChevronDownIcon from "lucide-svelte/icons/chevron-down";
import { flyAndScale } from "$lib/utility/transitions";
import { Checkbox } from "../checkbox";

export type Item = {
	value: string;
	label: string;
	icon?: typeof IconType;
	desc?: string;
};

export type Group = {
	label: string;
	items: Item[];
};

export type SelectItem = Item | Group;

type Props = {
	icon?: typeof IconType;
	showIconBeforeItems?: boolean;
	items: SelectItem[];
	value?: string | string[];
	selected?: string | string[];
	selectedValue?: string | string[] | null;
	placeholder: string;
	multiple?: boolean;
	width?: string;
};

let {
	icon,
	showIconBeforeItems = true,
	items,
	value = $bindable(),
	placeholder,
	multiple = false,
	...restProps
}: Props = $props();

function isGroup(item: SelectItem): item is Group {
	return "items" in item;
}

let isOpen = $state(false);

// flatten items from groups to a single array
let allItems = items.flatMap((item) => (isGroup(item) ? item.items : item));

let selectedItem = $derived(allItems.find((item) => item.value === value));
</script>

<Select.Root
  bind:value={value as never}
  bind:open={isOpen}
  type={multiple ? "multiple" : "single"}
>
  <Select.Trigger class="trigger repel">
    {#snippet child({ props })}
      <button {...props}>
        <div class="cluster space-xs">
          {#if icon && !selectedItem?.icon}
            {@const Icon = icon}
            <Icon size={16} />
          {/if}
          {#if selectedItem}
            {#if selectedItem.icon}
              {@const Icon = selectedItem.icon}
              <Icon size={16} />
            {/if}
            <div class="selected-label">{selectedItem.label}</div>
          {:else}
            <div class="placeholder">{placeholder}</div>
          {/if}
        </div>
        <div class="chevron" class:animate={isOpen}>
          <ChevronDownIcon size={16} />
        </div>
      </button>
    {/snippet}
  </Select.Trigger>

  <Select.Portal>
    <Select.Content forceMount sideOffset={10}>
      {#snippet child({ wrapperProps, props, open })}
        {#if open}
          <div {...wrapperProps}>
            <div
              {...props}
              class="stack space-2xs select-content"
              transition:flyAndScale
            >
              {#each items as item}
                {#if isGroup(item)}
                  <Select.Group class="stack space-2xs">
                    <Select.GroupHeading class="header">
                      {#snippet child({ props })}
                        <div {...props}>
                          <small class="fw:600"
                            >{item.label.toUpperCase()}</small
                          >
                        </div>
                      {/snippet}
                    </Select.GroupHeading>
                    {#each item.items as subItem}
                      <Select.Item value={subItem.value} label={subItem.label}>
                        {#snippet children({ selected })}
                          <div class="item repel">
                            <div class="cluster space-xs">
                              {#if multiple}
                                <Checkbox
                                  checked={selected}
                                  outlined
                                  style="pointer-events: none"
                                />
                              {/if}
                              {#if showIconBeforeItems}
                                {#if subItem.icon}
                                  {@const ItemIcon = subItem.icon}
                                  <ItemIcon size={16} />
                                {:else if icon}
                                  {@const ItemIcon = icon}
                                  <ItemIcon size={16} />
                                {/if}
                              {/if}
                              {subItem.label}
                            </div>
                            {#if !multiple && selected}
                              <CheckIcon size={16} />
                            {/if}
                          </div>
                        {/snippet}
                      </Select.Item>
                    {/each}
                  </Select.Group>
                {:else}
                  <Select.Item value={item.value} label={item.label}>
                    {#snippet children({ selected })}
                      <div class="item repel">
                        <div class="cluster space-xs">
                          {#if multiple}
                            <Checkbox
                              checked={selected}
                              outlined
                              style="pointer-events: none"
                            />
                          {/if}
                          {#if showIconBeforeItems}
                            {#if item.icon}
                              {@const ItemIcon = item.icon}
                              <ItemIcon size={16} />
                            {:else}
                              {@const ItemIcon = icon}
                              <ItemIcon size={16} />
                            {/if}
                          {/if}
                          {item.label}
                        </div>
                        {#if !multiple && selected}
                          <CheckIcon size={16} />
                        {/if}
                      </div>
                    {/snippet}
                  </Select.Item>
                {/if}
              {/each}
            </div>
          </div>
        {/if}
      {/snippet}
    </Select.Content>
  </Select.Portal>
</Select.Root>

<style>
  .chevron {
    display: flex;
    transform: rotate(0deg);
    transition: transform 0.1s;
  }

  .animate {
    transform: rotate(-180deg);
  }

  /* Trigger Styling */
  .trigger {
    width: 100%;
    cursor: pointer;
    min-height: 2.75rem;
    font-weight: var(--font-weight-normal);
    line-height: var(--line-height-body);
    letter-spacing: var(--letter-spacing-normal);
    border: 2px solid transparent;
    border-radius: var(--border-radius);
    padding: var(--space-xs) var(--space-xs);
    color: var(--txt-main);
    background-color: var(--clr-bg-input);
    transition-property: border-color, box-shadow;
    transition-duration: var(--input-transition-duration);
    transition-timing-function: var(--input-transition-timing-function);
    outline: 2px solid transparent;
  }

  .trigger::placeholder {
    color: var(--txt-main);
    opacity: 0.75; /* lighter */
  }

  .trigger:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .trigger:hover {
    border-color: var(--clr-bg-border-hover);
  }

  .trigger:focus {
    border-color: var(--clr-bg-border-hover);
    box-shadow: 0 0 0 0.225rem hsl(var(--clr-bg-border-hover-hsl) / 0.05);
  }

  .select-content {
    border-radius: var(--border-radius);
    background-color: var(--clr-bg-input);
    padding: var(--space-xs);
    max-height: 300px;
    overflow-y: auto;
    width: var(--bits-select-anchor-width);
    box-shadow: 0 0 10px 1px var(--clr-shadow);
  }

  /* Item Styling */
  .item {
    cursor: pointer;
    padding: var(--space-xs) var(--space-2xs);
    border-radius: var(--border-radius);
  }

  :global([data-selected]),
  .item:hover {
    border-radius: var(--border-radius);
    color: var(--txt-themed);
    background-color: var(--clr-bg-input-hover);
  }

  [data-select-indicator] {
    display: inline-flex;
  }

  .selected-label {
    color: var(--txt-main);
  }

  .placeholder {
    color: var(--txt-main);
    opacity: 0.75;
  }

  /* Value Styling */
  [data-select-value] {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
