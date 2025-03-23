<script lang="ts">
  import ChartLine from "lucide-svelte/icons/chart-line";

  import { DashboardCard } from "$lib/blocks/dashboard-card";
  import { Control, Field } from "$lib/blocks/forms";
  import { Input } from "$lib/blocks/input";
  import { Select } from "$lib/blocks/select";
  import { Slider } from "$lib/blocks/slider/slider";
  import { Switch } from "$lib/blocks/switch";
  import { getGuild } from "$lib/utility/context.svelte";
  import { type LevelsWithRelations } from "db/zod";
  import type { SuperForm } from "sveltekit-superforms";

  type Props = {
    form: SuperForm<LevelsWithRelations>;
  };

  const { form }: Props = $props();
  const { form: formData } = form;

  const guild = getGuild();

  const multipliers = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
</script>

<DashboardCard
  title="Text Exp Rate"
  description="Configure how much exp users gain in text channels."
>
  <div class="max-w-form stack">
    <Field {form} name="textExpEnabled">
      <Control
        label="Disable Text Exp"
        description="Allow users to gain exp in text channels."
        orientation="horizontal"
      >
        {#snippet children({ props })}
          <Switch {...props} disabled bind:checked={$formData.textExpEnabled} />
        {/snippet}
      </Control>
    </Field>
    <Select
      icon={ChartLine}
      value="LINEAR"
      items={[
        { label: "Linear", value: "LINEAR" },
        { label: "Exponential", value: "EXPONENTIAL" },
        { label: "Polynomial", value: "POLYNOMIAL" },
        { label: "Logarithmic", value: "LOGARITHMIC" },
      ]}
      placeholder="Select a progression type"
    />
    <div class="stack">
      <Slider
        type="single"
        min={0}
        max={multipliers.length - 1}
        step={1}
        ticks={multipliers}
        value={multipliers.indexOf(1)}
      />
      <div class="repel">
        <Input type="number" min="0" max="999" label="Min:" />
        <Input type="number" min="0" max="999" label="Max:" />
      </div>
    </div>
    <Input type="number" min="0" max="999" label="Cooldown:" />
  </div>
</DashboardCard>
