<script lang="ts">
  import Base from "$lib/layout/Base.svelte";
  import "$lib/scss/index.scss";
  import "iconify-icon";

  const { children } = $props();
</script>

<Base>
  {@render children()}
</Base>
