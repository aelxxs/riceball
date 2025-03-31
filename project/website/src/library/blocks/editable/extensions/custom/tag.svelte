<script lang="ts">
import type { NodeViewProps } from "@tiptap/core";
import { NodeViewWrapper } from "svelte-tiptap";

const { node }: NodeViewProps = $props();

type Attrs = {
	id: string;
};

const { id } = node.attrs as Attrs;
</script>

<NodeViewWrapper id="tag">
  <div class="tag">
    {`{${id}}`}
  </div>
</NodeViewWrapper>

<style>
  .tag {
    background-color: var(--clr-bg-input-hover);
    padding: 0.075rem 0.25rem;
    border-radius: 0.25rem;
    font-family: monospace;
    font-weight: medium;
    color: var(--txt-bold);
    display: inline-block;
  }
</style>
