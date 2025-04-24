<script lang="ts">
const { children } = $props();
</script>

<main class="wrapper">
  {@render children()}
</main>

<style>
  .wrapper {
    margin: 0 auto;
  }
</style>
