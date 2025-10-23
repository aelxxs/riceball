<script lang="ts">
import { Separator } from "bits-ui";

const { orientation = "horizontal" }: { orientation?: "horizontal" | "vertical" } = $props();
</script>

<Separator.Root {orientation} class="separator">
  {#snippet child({ props })}
    <div {...props}></div>
  {/snippet}
</Separator.Root>

<style>
  .separator {
    display: flex;
    background-color: var(--clr-bg-border);
  }

  .separator[data-orientation="horizontal"] {
    width: 100%;
    height: 1px;
  }

  .separator[data-orientation="vertical"] {
    width: 1px;
    height: 1.25rem;
  }
</style>
