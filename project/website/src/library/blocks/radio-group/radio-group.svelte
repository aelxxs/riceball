<script lang="ts">
import { RadioGroup as RadioGroupPrimitive } from "bits-ui";

let { ref = $bindable(null), value = $bindable(""), ...restProps }: RadioGroupPrimitive.RootProps = $props();
</script>

<RadioGroupPrimitive.Root bind:value class="grid gap:-2" {...restProps} />
