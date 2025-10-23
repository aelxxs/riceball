<script lang="ts">
import { onMount } from "svelte";

let { color = $bindable("#ff0000"), format = "hex", onClickClose = () => {} } = $props();

let parent = $state<HTMLDivElement | null>(null);

onMount(() => {
	let closeButton: HTMLButtonElement | null;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	let Coloris: any;
	const init = async () => {
		Coloris = await import("@melloware/coloris");

		Coloris.init();
		Coloris.coloris({
			el: null, // not used
			theme: "large",
			inline: true,
			parent,
			format,
			defaultColor: color,
			closeButton: true,
			onChange: (newColor: string) => {
				color = newColor;
			},
		});

		setTimeout(Coloris.updatePosition, 200);
		window.addEventListener("resize", Coloris.updatePosition);

		closeButton = document.getElementById("clr-close") as HTMLButtonElement;
		closeButton?.addEventListener("click", () => {
			onClickClose();
		});
	};

	init();
	return () => {
		window.removeEventListener("resize", Coloris.updatePosition);
		closeButton?.removeEventListener("click", () => {
			onClickClose();
		});
	};
});
</script>

<div bind:this={parent}></div>
