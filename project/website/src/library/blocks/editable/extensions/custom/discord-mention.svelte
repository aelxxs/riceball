<script lang="ts">
  import type { NodeViewProps } from "@tiptap/core";
  import { AtSignIcon, HashIcon, type Icon } from "lucide-svelte";
  import { NodeViewWrapper } from "svelte-tiptap";

  const { node }: NodeViewProps = $props();

  type Attrs = {
    type: "user" | "role" | "channel" | "everyone" | "here";
    name: string;
    mention: string;
  };

  let { name, type } = node.attrs as Attrs;

  let icon: typeof Icon = $state(null!);
  switch (type) {
    case "role":
      icon = AtSignIcon;
      break;
    case "channel":
      icon = HashIcon;
      break;
  }
</script>

<NodeViewWrapper id="discord-mention">
  <span class="box mention cluster space-3xs">
    {#if icon}
      {@const Icon = icon}
      <Icon size="0.85rem" />
    {/if}
    <span>{name}</span>
  </span>
</NodeViewWrapper>

<style>
  .mention {
    background-color: hsl(var(--clr-bg-border-hover-hsl) / 0.15);
    --padding: 0.015rem 0.15lh;
    /* height: 1lh; */
    border-radius: 0.2rem;
    font-size: inherit !important;
    color: hsl(var(--clr-bg-border-hover-hsl) / 1);
  }

  .mention span {
    font-size: inherit;
  }
</style>
