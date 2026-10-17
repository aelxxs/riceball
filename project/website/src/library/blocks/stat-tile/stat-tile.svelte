<script lang="ts">
type Props = {
	label: string;
	value: string | number;
	hint?: string;
	href?: string;
};

const { label, value, hint, href }: Props = $props();
</script>

<svelte:element this={href ? "a" : "div"} {href} class="stat-tile stack space-3xs">
  <span class="fs:xs txt-muted">{label}</span>
  <span class="value fs:md fw:bold">{value}</span>
  {#if hint}
    <span class="fs:xs txt-muted">{hint}</span>
  {/if}
</svelte:element>

<style>
  .stat-tile {
    padding: var(--space-s) var(--space-m);
    border-radius: var(--border-radius);
    background-color: var(--glass-bg-subtle);
    border: var(--glass-border-subtle);
    color: inherit;
    text-decoration: none;
    transition: border-color 0.2s ease;
  }

  a.stat-tile:hover {
    border: var(--glass-border-light);
  }

  .value {
    font-variant-numeric: tabular-nums;
  }
</style>
