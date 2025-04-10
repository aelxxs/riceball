<script lang="ts">
// - Icons
import HashIcon from "lucide-svelte/icons/hash";

import type { SelectItem } from "./select.svelte";
import Select from "./select.svelte";

type Props = {
	items: SelectItem[];
	value?: string;
};

let { value = $bindable(), ...restProps }: Props = $props();
</script>

<Select
  icon={HashIcon}
  placeholder="Select a channel"
  bind:value
  {...restProps}
/>
