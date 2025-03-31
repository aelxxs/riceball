<script lang="ts">
import { beforeNavigate } from "$app/navigation";
import { getAppState } from "$lib/utility/context.svelte";

const { data } = $props();

// Handlers
const handleCancel = () => window.history.back();
const handleSubmit = () => {};

const appState = getAppState();

appState.setControlTitle("Create Embed");
appState.setControlsVisible(true);
appState.setControls([
	{ label: "Cancel", handler: handleCancel, variant: "destructive" },
	{ label: "Submit", handler: handleSubmit },
]);

beforeNavigate(() => {
	appState.destroyControls();
});
</script>

edit
