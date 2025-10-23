<script lang="ts">
import { EconomyWithRelationsSchema } from "@riceball/db/zod";
import { ArrowLeft, ArrowRight } from "lucide-svelte";
import { toast } from "svelte-sonner";
import { superForm } from "sveltekit-superforms";
import { zodClient } from "sveltekit-superforms/adapters";
import DashboardCard from "$lib/blocks/dashboard-card/dashboard-card.svelte";
import { Control, Field } from "$lib/blocks/forms";
import { Input } from "$lib/blocks/input";
import Restrictions from "$lib/blocks/restrictions/restrictions.svelte";
import { Select } from "$lib/blocks/select";
import { Switch } from "$lib/blocks/switch";
import { getSaveModal } from "$lib/utility/context.svelte.js";

const { data } = $props();
const modal = getSaveModal();

const form = superForm(data.form, {
	dataType: "json",
	resetForm: false,
	validators: zodClient(EconomyWithRelationsSchema),
	onUpdate: ({ result }) => {
		switch (result.type) {
			case "success":
				modal.hideModal();
				toast.success("Settings saved successfully!");
				break;
			case "failure":
				console.log(result);
				toast.error("Failed to save settings.");
				break;
			default:
				break;
		}
	},
});

const { form: formData, enhance, tainted, isTainted, submit, delayed, submitting } = form;

$effect(() => {
	if (isTainted($tainted)) {
		modal.showModal({
			save: submit,
			undo: form.reset,
			delayed: $delayed,
			submitting: $submitting,
		});
	} else {
		modal.hideModal();
	}
});
</script>

<form class="stack" method="POST" action="?/save" use:enhance>
  <DashboardCard
    title="Currency Settings"
    description="Configure the currency settings for your server."
  >
    <div class="flow max-w-form">
      <!-- Currency Icon -->
      <Field {form} name="currencyIcon">
        <Control
          label="Currency Icon"
          description="The icon representing the currency."
        >
          {#snippet children({ props })}
            <Input
              {...props}
              type="text"
              name="currencyIcon"
              placeholder="💴"
              bind:value={$formData.currencyIcon}
              required
            />
          {/snippet}
        </Control>
      </Field>
      <!-- Currency Name -->
      <Field {form} name="currencyName">
        <Control label="Currency Name" description="The name of the currency.">
          {#snippet children({ props })}
            <Input
              {...props}
              type="text"
              name="currencyName"
              placeholder="Currency Name"
              bind:value={$formData.currencyName}
            />
          {/snippet}
        </Control>
      </Field>
      <!-- Currency Location (LEFT or RIGHT) -->
      <Field {form} name="currencyIconLocation">
        <Control
          label="Currency Symbol Location"
          description="The location of the currency icon."
        >
          {#snippet children({ props })}
            <Select
              {...props}
              bind:value={$formData.currencyIconLocation}
              items={[
                { value: "LEFT", label: "Left", icon: ArrowLeft },
                { value: "RIGHT", label: "Right", icon: ArrowRight },
              ]}
              placeholder="Select currency symbol location"
            />
          {/snippet}
        </Control>
      </Field>
    </div>
  </DashboardCard>

  <DashboardCard
    title="Inventory Settings"
    description="Configure the inventory settings for your server."
  >
    <div class="flow max-w-form">
      <!-- Inventory Size -->
      <Field {form} name="inventorySize">
        <Control
          label="Inventory Size"
          description="The maximum number of items a user can hold."
        >
          {#snippet children({ props })}
            <Input
              {...props}
              type="number"
              name="inventorySize"
              placeholder="0"
              min="0"
              max="1000000"
              step="1"
              bind:value={$formData.inventorySize}
              required
            />
          {/snippet}
        </Control>
      </Field>
      <!-- Auto use items -->
      <Field {form} name="autoUseItems">
        <Control
          label="Auto Use Items"
          description="Automatically use items when obtained."
        >
          {#snippet children({ props })}
            <Switch {...props} bind:checked={$formData.autoUseItems} />
          {/snippet}
        </Control>
      </Field>
      <!-- Clear on leave -->
      <Field {form} name="clearOnLeave">
        <Control
          label="Clear on Leave"
          description="Clear the inventory when a user leaves the server."
        >
          {#snippet children({ props })}
            <Switch {...props} bind:checked={$formData.clearOnLeave} />
          {/snippet}
        </Control>
      </Field>
    </div>
  </DashboardCard>

  <DashboardCard
    title="Wager Settings"
    description="Configure the wager settings for your server."
  >
    <div class="flow max-w-form">
      <div class="cluster">
        <!-- Wager Min -->
        <Field {form} name="wagerMin">
          <Control
            label="Wager Min"
            description="The minimum amount of currency required to wager."
          >
            {#snippet children({ props })}
              <Input
                {...props}
                type="number"
                name="wagerMin"
                placeholder="0"
                min="0"
                max="1000000"
                step="1"
                bind:value={$formData.wagerMin}
                required
              />
            {/snippet}
          </Control>
        </Field>
        <!-- Wager Max -->
        <Field {form} name="wagerMax">
          <Control
            label="Wager Max"
            description="The maximum amount of currency required to wager."
          >
            {#snippet children({ props })}
              <Input
                {...props}
                type="number"
                name="wagerMax"
                placeholder="0"
                min="0"
                max="1000000"
                step="1"
                bind:value={$formData.wagerMax}
                required
              />
            {/snippet}
          </Control>
        </Field>
      </div>
    </div>
  </DashboardCard>

  <DashboardCard
    title="Daily Reward Settings"
    description="Configure daily reward amounts."
  >
    <div class="flow max-w-form">
      <div class="cluster">
        <!-- Daily Reward Min (Number input) -->
        <Field {form} name="dailyRewardMin">
          <Control
            label="Daily Reward Min"
            description="The minimum amount of currency earned per day."
          >
            {#snippet children({ props })}
              <Input
                {...props}
                type="number"
                name="dailyRewardMin"
                placeholder="0"
                min="0"
                max="1000000"
                step="1"
                bind:value={$formData.dailyRewardMin}
                required
              />
            {/snippet}
          </Control>
        </Field>
        <!-- Daily Reward Max (Number input) -->
        <Field {form} name="dailyRewardMax">
          <Control
            label="Daily Reward Max"
            description="The maximum amount of currency earned per day."
          >
            {#snippet children({ props })}
              <Input
                {...props}
                type="number"
                name="dailyRewardMax"
                placeholder="0"
                min="0"
                max="1000000"
                step="1"
                bind:value={$formData.dailyRewardMax}
                required
              />
            {/snippet}
          </Control>
        </Field>
      </div>
    </div>
  </DashboardCard>

  <DashboardCard
    title="Text Rate Settings"
    description="Configure text earning rates and cooldowns."
  >
    <div class="flow max-w-form">
      <div class="cluster">
        <!-- Text Rate Min (Number input) -->
        <Field {form} name="textRateMin">
          <Control
            label="Text Rate Min"
            description="The minimum amount of currency earned per message."
          >
            {#snippet children({ props })}
              <Input
                {...props}
                type="number"
                name="textRateMin"
                placeholder="0"
                min="0"
                max="1000000"
                step="1"
                bind:value={$formData.textRateMin}
                required
              />
            {/snippet}
          </Control>
        </Field>
        <!-- Text Rate Max (Number input) -->
        <Field {form} name="textRateMax">
          <Control
            label="Text Rate Max"
            description="The maximum amount of currency earned per message."
          >
            {#snippet children({ props })}
              <Input
                {...props}
                type="number"
                name="textRateMax"
                placeholder="0"
                min="0"
                max="1000000"
                step="1"
                bind:value={$formData.textRateMax}
                required
              />
            {/snippet}
          </Control>
        </Field>
      </div>

      <!-- Text Cooldown (Number input, suffix: seconds) -->
      <Field {form} name="textCooldown">
        <Control
          label="Text Cooldown"
          description="The cooldown between messages in seconds."
        >
          {#snippet children({ props })}
            <Input
              {...props}
              type="number"
              name="textCooldown"
              placeholder="0"
              min="0"
              max="1000000"
              step="1"
              bind:value={$formData.textCooldown}
              required
            />
          {/snippet}
        </Control>
      </Field>
    </div>
  </DashboardCard>

  <DashboardCard
    title="Balance Settings"
    description="Configure balance limits and defaults."
  >
    <div class="flow max-w-form">
      <Field {form} name="defaultBalance">
        <Control
          label="Default Balance"
          description="The default balance for new users."
        >
          {#snippet children({ props })}
            <Input
              {...props}
              type="number"
              name="defaultBalance"
              placeholder="0"
              min="0"
              max="1000000"
              step="1"
              bind:value={$formData.defaultBalance}
              required
            />
          {/snippet}
        </Control>
      </Field>
      <!-- Allow Negative Balance (Toggle) -->
      <Field {form} name="allowNegativeBalance">
        <Control
          label="Allow Negative Balance"
          description="Allow users to go into negative balance."
        >
          {#snippet children({ props })}
            <Switch {...props} bind:checked={$formData.allowNegativeBalance} />
          {/snippet}
        </Control>
      </Field>

      <!-- Negative Balance Limit (Number input, only if above is true) -->
      {#if $formData.allowNegativeBalance}
        <Field {form} name="negativeBalanceLimit">
          <Control
            label="Negative Balance Limit"
            description="The limit for negative balance."
          >
            {#snippet children({ props })}
              <Input
                {...props}
                type="number"
                name="negativeBalanceLimit"
                placeholder="0"
                min="-1000000"
                max="0"
                step="1"
                bind:value={$formData.negativeBalanceLimit}
                required
              />
            {/snippet}
          </Control>
        </Field>
      {/if}
    </div>
  </DashboardCard>

  <DashboardCard
    title="Debug Settings"
    description="Enable or disable debug mode."
  >
    <div class="flow max-w-form">
      <!-- Debug Mode (Toggle) -->
      <Field {form} name="debugMode">
        <Control
          label="Debug Mode"
          description="Enable debug mode for detailed logs."
        >
          {#snippet children({ props })}
            <Switch {...props} bind:checked={$formData.debugMode} />
          {/snippet}
        </Control>
      </Field>
    </div>
  </DashboardCard>

  <Restrictions
    title="Role Restrictions"
    description="Restrict which roles are allowed to gain exp."
    type="role"
    {form}
    items={data.guild.itemizedRoles}
  />
  <Restrictions
    title="Channel Restrictions"
    description="Restrict which channels users can gain exp in."
    type="channel"
    {form}
    items={data.guild.itemizedChannels}
  />
</form>
