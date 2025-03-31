<script lang="ts">
import { PageHeader } from "$lib/blocks/page-header";

const { children } = $props();
</script>

<PageHeader />
<div class="wrapper">
  <main class="content">
    {@render children()}
  </main>
</div>

<style>
  .wrapper {
    padding-inline: var(--space-m);
    /* max-width: 88rem; */
    margin: 0 auto;
  }

  .content {
    margin: 0 auto;
  }
</style>
