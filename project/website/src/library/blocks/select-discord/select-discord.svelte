<script lang="ts">
import type { Icon } from "lucide-svelte";
// - Icons
import AtSignIcon from "lucide-svelte/icons/at-sign";
import HashIcon from "lucide-svelte/icons/hash";
import PlusCircleIcon from "lucide-svelte/icons/plus-circle";
import XIcon from "lucide-svelte/icons/x";

import { flyAndScale } from "$lib/utility/transitions";
import { Combobox, type Selected } from "bits-ui";

import type { Snippet } from "svelte";
import { Button } from "../button";
import { Checkbox } from "../checkbox";

type Item = {
	value: string;
	label: string;
	icon?: typeof Icon;
	desc?: string;
};

type Group = {
	label: string;
	items: Item[];
};

type SelectItem = Item | Group;

interface Props {
	name?: string;
	type: "role" | "channel" | "member";
	items: SelectItem[];
	selected?: string[];
	max?: number | null;
	closeAfterSelect?: boolean;
	left?: Snippet;
	right?: Snippet;
}

let {
	name,
	type,
	items,
	selected = $bindable([]),
	max = null,
	closeAfterSelect = false,
	left,
	right,
	...restProps
}: Props = $props();

const icon =
	type === "role" ? AtSignIcon : type === "channel" ? HashIcon : null;

let inputValue = $state("");

const flatItems = items.flatMap((item) => {
	if ("items" in item) return item.items;
	return item;
});

const filteredItems = $derived(() => {
	return inputValue
		? items.filter((item) =>
				item.label.toLowerCase().includes(inputValue.toLowerCase()),
			)
		: items;
});

let selectedItems = $state<Selected<string>[]>([]);

$effect(() => {
	selectedItems = selected.map((id) => {
		const item = flatItems.find((i) => i.value === id);
		return { value: id, label: item?.label };
	});
});

const onValueChange = (value: string[]) => {
	if (closeAfterSelect) {
		isOpen = false;
	}
	if (max && value.length > max) {
		return;
	}
	selectedItems = value.map((id) => {
		const item = flatItems.find((i) => i.value === id);
		return { value: id, label: item?.label };
	});
	inputValue = "";
};

let isOpen = $state(false);

const inputPlaceholder = $derived(() => {
	if (isOpen) return `Search for ${type}...`;
	if (selectedItems.length) return `Add more ${type}s...`;
	return `Select a ${type}...`;
});

const noItemsFoundMessage = `No ${type}s found`;

let customAnchor = $state<HTMLElement | null>(null);

function isGroup(item: SelectItem): item is Group {
	return "items" in item;
}

let lastClickTime = $state(0);
const DOUBLE_CLICK_THRESHOLD = 300; // milliseconds

const internalInputValue = $state("");

function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
	inputValue = e.currentTarget.value;
}

function focusInput(node: HTMLElement, _isOpen: boolean) {
	function focus() {
		if (_isOpen && node) {
			node.focus();
		}
	}

	return {
		update(newIsOpen: boolean) {
			isOpen = newIsOpen;
			focus();
		},
	};
}
</script>

<Combobox.Root
  {name}
  bind:open={isOpen}
  bind:value={selected}
  type="multiple"
  {onValueChange}
>
  <Combobox.Trigger>
    {#snippet child()}
      <div
        role="button"
        tabindex="0"
        onkeydown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            isOpen = !isOpen;
          }
        }}
        class="input-wrapper cluster space-2xs no-wrap"
        bind:this={customAnchor}
        onclick={(event) => {
          if (!event.target) return;

          const targetElement = event.target as HTMLElement;

          const closestButton = targetElement.closest('button[name="remove"]');
          if (closestButton) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }

          const closestCustomEntry = targetElement.closest(".custom-entry");
          if (closestCustomEntry) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }

          const currentTime = new Date().getTime();
          const isDoubleClick =
            currentTime - lastClickTime < DOUBLE_CLICK_THRESHOLD;
          lastClickTime = currentTime;

          if (isDoubleClick) {
            return;
          }

          const isInputOrInputWrapper =
            targetElement.classList.contains("input-wrapper") ||
            targetElement.classList.contains("input") ||
            targetElement.classList.contains("cluster");

          if (isInputOrInputWrapper) {
            if (!isOpen) {
              isOpen = true;
            }
          } else {
            event.preventDefault();
            event.stopPropagation();
            return;
          }
        }}
        {...restProps}
      >
        {#if left}
          <div class="custom-entry" style="display: flex;">
            {@render left()}
          </div>
        {/if}
        <div class="cluster align-center space-2xs" style="align-self: center;">
          {#each selectedItems as item}
            <div class="chip">
              <button
                name="remove"
                type="button"
                class="chip-close"
                onclick={(event) => {
                  selectedItems = selectedItems.filter((c) => c !== item);
                  selected = selectedItems.map((i) => i.value);
                }}
              >
                <span class="sr-only">Remove</span>
                <XIcon size={12} class="txt:bold" strokeWidth={4} />
                <div class="cluster align-center space-2xs">
                  {#if icon}
                    {@const Icon = icon}
                    <Icon size={14} />
                  {/if}
                  <small>{item.label}</small>
                </div>
              </button>
            </div>
          {/each}
          <div class="cluster space-3xs no-wrap align-center">
            <Button
              variant="icon-only"
              onclick={() => {
                isOpen = true;
              }}
            >
              <PlusCircleIcon size={16} />
            </Button>
            <Combobox.Input
              class="input"
              placeholder={inputPlaceholder()}
              aria-label={inputPlaceholder()}
            >
              {#snippet child({ props })}
                <input
                  {...props}
                  size="10"
                  use:focusInput={isOpen}
                  value={internalInputValue}
                  oninput={handleInput}
                />
              {/snippet}</Combobox.Input
            >
          </div>
        </div>
        {#if right}
          <div class="custom-entry" style="display: flex; margin-left: auto;">
            {@render right()}
          </div>
        {/if}
      </div>
    {/snippet}
  </Combobox.Trigger>

  <Combobox.Portal>
    <Combobox.Content
      sideOffset={10}
      forceMount
      {customAnchor}
      onInteractOutside={(e) => {
        const targetElement = e.target as HTMLElement;
        const closestButton = targetElement.closest('button[name="remove"]');
        if (closestButton) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        isOpen = false;
      }}
    >
      {#snippet child({ wrapperProps, props, open })}
        {#if open}
          <div {...wrapperProps}>
            <div
              {...props}
              class="stack space-2xs combobox-content"
              transition:flyAndScale
            >
              <Combobox.Group class="stack" style="--space: 0.25rem">
                <Combobox.GroupHeading>
                  <small class="fw:600">{type.toUpperCase()}S</small>
                </Combobox.GroupHeading>
              </Combobox.Group>

              {#each filteredItems() as item}
                {#if isGroup(item)}
                  <Combobox.Group class="stack space-2xs">
                    <Combobox.GroupHeading>
                      <small class="heading fw:600"
                        >{item.label.toUpperCase()}</small
                      >
                    </Combobox.GroupHeading>
                    {#each item.items as subItem}
                      <Combobox.Item
                        class="combobox-item repel"
                        value={subItem.value}
                        label={subItem.label}
                      >
                        {#snippet child({ props, selected })}
                          <div {...props}>
                            <div class="cluster space-xs">
                              <Checkbox
                                checked={selected}
                                outlined
                                style="pointer-events: none"
                              />
                              {#if true}
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
                          </div>
                        {/snippet}
                      </Combobox.Item>
                    {/each}
                  </Combobox.Group>
                {:else}
                  <Combobox.Group class="stack space-2xs">
                    <Combobox.Item
                      class="combobox-item repel"
                      value={item.value}
                      label={item.label}
                    >
                      {#snippet child({ props, selected })}
                        <div {...props} class="combobox-item repel">
                          <div class="cluster space-s">
                            <Checkbox
                              checked={selected}
                              outlined
                              style="pointer-events: none"
                            />
                            <div>
                              <div class="cluster space-xs">
                                {#if true}
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
                            </div>
                          </div>
                        </div>
                      {/snippet}
                    </Combobox.Item>
                  </Combobox.Group>
                {/if}
              {:else}
                <span>{noItemsFoundMessage}</span>
              {/each}
            </div>
          </div>
        {/if}
      {/snippet}
    </Combobox.Content>
  </Combobox.Portal>
</Combobox.Root>

<style>
  .input-wrapper {
    --align: flex-start;
    cursor: pointer;
    position: relative;
    padding: var(--space-2xs) var(--space-2xs);
    border: 2px solid transparent;
    border-radius: var(--border-radius);
    background-color: var(--clr-bg-input);
    transition-property: border-color, box-shadow;
    transition-duration: var(--input-transition-duration);
    transition-timing-function: var(--input-transition-timing-function);
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .input-wrapper:hover {
    border-color: var(--clr-bg-border-hover);
  }

  .input-wrapper:focus-within {
    border-color: var(--clr-bg-border-hover);
    box-shadow: 0 0 0 0.225rem hsl(var(--clr-bg-border-hover-hsl) / 0.05);
  }

  .input {
    align-self: center;
    outline: none;
    border: none;
    flex: 1 1 0%;
    color: var(--txt-main);

    width: var(--bits-combobox-anchor-width);
    background-color: transparent;
  }

  .input::placeholder {
    color: var(--txt-main);
    opacity: 0.75; /* lighter */
  }

  .combobox-content {
    /* border: 1px solid var(--clr-bg-border); */
    border-radius: var(--border-radius);
    background-color: var(--clr-bg-input);
    padding: var(--space-xs);
    max-height: 300px;
    overflow-y: auto;
    width: var(--bits-combobox-anchor-width);
    box-shadow: 0 0 10px 1px var(--clr-shadow);
  }

  .combobox-item {
    border-radius: var(--border-radius);
    padding: var(--space-xs) var(--space-2xs);
    display: flex;
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  [data-highlighted] {
    cursor: pointer;
    color: var(--txt-themed);
    background-color: var(--clr-bg-input-hover);
  }

  .checkbox {
    cursor: pointer !important;
    background-color: var(--clr-bg-invert);
    width: 1.35rem;
    height: 1.35rem;
    border-radius: var(--radius-xs);
    border: 1px solid var(--clr-bg-border);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--txt-bold);
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .checkbox:hover {
    border: 1px solid var(--clr-bg-border-hover);
  }

  .checkbox > * {
    opacity: 0;
    transform: translateY(-0.5rem);
  }

  [data-selected] .checkbox > * {
    opacity: 1;
    transform: translateY(0);
  }

  .animate {
    opacity: 1;
    transform: translateY(0);
  }

  .chip {
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    padding: 0.275rem 0.35rem;
    border-radius: var(--radius-full);
    color: var(--txt-themed) !important;
    background-color: var(--clr-bg-input-hover);
  }

  .chip-close {
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    color: var(--txt-main);
    border: none;
    gap: 0.35rem;
  }

  .header {
    position: sticky;
    top: 0;
  }
</style>
