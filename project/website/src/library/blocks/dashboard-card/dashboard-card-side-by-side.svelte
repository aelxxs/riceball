<script lang="ts">
import { type Snippet, onMount } from "svelte";
import { writable } from "svelte/store";
import { DashboardCard } from ".";

type ModuleProps = {
	title: string;
	description: string;
};

type Props = {
	module1: Snippet;
	module2: Snippet;
	module1Props: ModuleProps;
	module2Props: ModuleProps;
};

const { module1, module2, module1Props, module2Props }: Props = $props();

const isOpen = writable(true);
const isSideBySide = writable(false);

let gridContainer: HTMLElement;

onMount(() => {
	const observer = new ResizeObserver(() => {
		if (!gridContainer) return;

		const computedStyle = getComputedStyle(gridContainer);
		const columns = computedStyle
			.getPropertyValue("grid-template-columns")
			.split(" ").length;

		isSideBySide.set(columns > 1);
	});

	observer.observe(gridContainer);

	return () => observer.disconnect();
});

function handleToggle(newState: boolean) {
	if ($isSideBySide) {
		isOpen.set(newState);
	}
}
</script>

<div bind:this={gridContainer} class="grid">
  <DashboardCard
    {...module1Props}
    {isOpen}
    {isSideBySide}
    toggle={handleToggle}
  >
    {@render module1()}
  </DashboardCard>
  <DashboardCard
    {...module2Props}
    {isOpen}
    {isSideBySide}
    toggle={handleToggle}
  >
    {@render module2()}
  </DashboardCard>
</div>
