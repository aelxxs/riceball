<script lang="ts">
  import type { WithoutChildrenOrChild } from "bits-ui";

  type EditableTag = keyof HTMLElementTagNameMap;

  interface Props<T extends EditableTag> {
    value?: string;
    tag?: T;
    class?: string;
    multiline?: boolean;
    maxChars?: number;
    placeholder?: string;
    hideIfEmpty?: boolean;
  }

  let {
    value = $bindable(""),
    tag = $bindable<EditableTag>("div"),
    class: className = $bindable(""),
    multiline = false,
    maxChars = 200,
    placeholder = $bindable(""),
    hideIfEmpty = false,
    ...restProps
  }: WithoutChildrenOrChild<Props<EditableTag>> = $props();

  function handleInput(event: Event) {
    const target = event.target as HTMLElement;
    if (target.innerHTML === "<br>") {
      target.innerHTML = "";
    }
    value = target.textContent || "";
  }
</script>

<svelte:element
  this={tag}
  class={`editable ${className}`}
  contenteditable="true"
  oninput={handleInput}
  data-placeholder={placeholder}
  data-hide-if-empty={hideIfEmpty}
  {...restProps}
>
  {value}
</svelte:element>

<style>
  [contenteditable] {
    cursor: text;
    outline: none;
    border: none;
    display: inline-block;
    display: flex;
    font-family: inherit;
  }

  [conteneditable][data-hide-if-empty="false"]:focus {
    box-shadow: 0 0 0 0.225rem hsl(var(--clr-bg-border-hover-hsl) / 0.05);
  }

  [contenteditable][data-hide-if-empty="false"]:empty:before {
    display: block;
    content: attr(data-placeholder);
    color: var(--txt-main);
    opacity: 0.75;
  }
</style>
