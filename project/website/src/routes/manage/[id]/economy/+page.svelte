<script lang="ts">
import { EconomyWithRelationsSchema } from "@riceball/db/zod";
import { ArrowLeft, ArrowRight } from "lucide-svelte";
import { toast } from "svelte-sonner";
import { superForm } from "sveltekit-superforms";
import { zod4Client } from "sveltekit-superforms/adapters";
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
	validators: zod4Client(EconomyWithRelationsSchema),
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

const samplePayouts = [1250, 420, 72];
const sampleUsername = "Nova";
const sampleAvatar = "https://cdn.discordapp.com/embed/avatars/1.png";
const VISUAL_CAP = 5000;

const presets = {
	wager: [
		{ label: "Chill", min: 25, max: 120 },
		{ label: "Balanced", min: 120, max: 420 },
		{ label: "High Roller", min: 400, max: 1200 },
	],
	daily: [
		{ label: "Starter", min: 50, max: 120 },
		{ label: "Standard", min: 150, max: 350 },
		{ label: "Generous", min: 400, max: 900 },
	],
	text: [
		{ label: "Slow", min: 1, max: 4 },
		{ label: "Fair", min: 3, max: 8 },
		{ label: "Fast", min: 7, max: 15 },
	],
};

const formatCurrencyPreview = (amount: number, location: string, icon: string) => {
	if (location === "RIGHT") return `${amount.toLocaleString()} ${icon || "💰"}`;
	return `${icon || "💰"} ${amount.toLocaleString()}`;
};

const formatSeconds = (value: number) => {
	if (value >= 3600) return `${(value / 3600).toFixed(1)}h`;
	if (value >= 120) return `${Math.round(value / 60)}m`;
	return `${value}s`;
};

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
    <div class="cluster currency-layout">
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
          <Control
            label="Currency Name"
            description="The name of the currency."
          >
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

      <div class="preview-card">
        <div class="preview-head">
          <p class="eyebrow">Discord Preview</p>
          <p class="hint">Updates live as you type</p>
        </div>
        <div class="discord-msg">
          <div
            class="avatar"
            style={`background-image: url(${sampleAvatar})`}
          ></div>
          <div class="bubble">
            <div class="meta">
              <span class="user">{sampleUsername}</span>
              <span class="time">Today at 4:20 PM</span>
            </div>
            <p class="line">
              Claimed daily reward: <strong
                >{formatCurrencyPreview(
                  samplePayouts[0],
                  $formData.currencyIconLocation,
                  $formData.currencyIcon,
                )}</strong
              >
            </p>
            <p class="line">
              Wager won: <strong
                >{formatCurrencyPreview(
                  samplePayouts[1],
                  $formData.currencyIconLocation,
                  $formData.currencyIcon,
                )}</strong
              >
            </p>
            <p class="line">
              Tax collected: <strong
                >{formatCurrencyPreview(
                  samplePayouts[2],
                  $formData.currencyIconLocation,
                  $formData.currencyIcon,
                )}</strong
              >
            </p>
          </div>
        </div>
      </div>
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
            <div class="input-stack">
              <div class="number-row">
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
                <div class="stepper" aria-hidden="true">
                  <button
                    type="button"
                    on:click={() =>
                      ($formData.inventorySize = Math.max(
                        0,
                        Number($formData.inventorySize || 0) - 1,
                      ))}>−</button
                  >
                  <button
                    type="button"
                    on:click={() =>
                      ($formData.inventorySize = Math.min(
                        1000000,
                        Number($formData.inventorySize || 0) + 1,
                      ))}>+</button
                  >
                </div>
              </div>
              <div class="bar">
                <span
                  style={`width: ${Math.min(100, (Number($formData.inventorySize || 0) / VISUAL_CAP) * 100)}%`}
                ></span>
              </div>
            </div>
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

      <div class="chip-row">
        {#each presets.wager as preset}
          <button
            type="button"
            class="chip"
            on:click={() => {
              $formData.wagerMin = preset.min;
              $formData.wagerMax = preset.max;
            }}
          >
            {preset.label}
            <span class="chip-sub">{preset.min} → {preset.max}</span>
          </button>
        {/each}
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

      <div class="chip-row">
        {#each presets.daily as preset}
          <button
            type="button"
            class="chip"
            on:click={() => {
              $formData.dailyRewardMin = preset.min;
              $formData.dailyRewardMax = preset.max;
            }}
          >
            {preset.label}
            <span class="chip-sub">{preset.min} → {preset.max}</span>
          </button>
        {/each}
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

      <div class="chip-row">
        {#each presets.text as preset}
          <button
            type="button"
            class="chip"
            on:click={() => {
              $formData.textRateMin = preset.min;
              $formData.textRateMax = preset.max;
            }}
          >
            {preset.label}
            <span class="chip-sub">{preset.min} → {preset.max}</span>
          </button>
        {/each}
      </div>

      <!-- Text Cooldown (Number input, suffix: seconds) -->
      <Field {form} name="textCooldown">
        <Control
          label="Text Cooldown"
          description="The cooldown between messages in seconds."
        >
          {#snippet children({ props })}
            <div class="input-stack">
              <div class="number-row">
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
                <div class="stepper" aria-hidden="true">
                  <button
                    type="button"
                    on:click={() =>
                      ($formData.textCooldown = Math.max(
                        0,
                        Number($formData.textCooldown || 0) - 1,
                      ))}>−</button
                  >
                  <button
                    type="button"
                    on:click={() =>
                      ($formData.textCooldown = Math.min(
                        1000000,
                        Number($formData.textCooldown || 0) + 1,
                      ))}>+</button
                  >
                </div>
              </div>
              <div class="range-row">
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="1"
                  bind:value={$formData.textCooldown}
                />
                <span class="range-label"
                  >{formatSeconds(Number($formData.textCooldown || 0))}</span
                >
              </div>
            </div>
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
            <div class="input-stack">
              <div class="number-row">
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
                <div class="stepper" aria-hidden="true">
                  <button
                    type="button"
                    on:click={() =>
                      ($formData.defaultBalance = Math.max(
                        0,
                        Number($formData.defaultBalance || 0) - 10,
                      ))}>−10</button
                  >
                  <button
                    type="button"
                    on:click={() =>
                      ($formData.defaultBalance = Math.min(
                        1000000,
                        Number($formData.defaultBalance || 0) + 10,
                      ))}>+10</button
                  >
                </div>
              </div>
              <div class="bar subtle">
                <span
                  style={`width: ${Math.min(100, (Number($formData.defaultBalance || 0) / VISUAL_CAP) * 100)}%`}
                ></span>
              </div>
            </div>
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
              <div class="input-stack">
                <div class="number-row">
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
                  <div class="stepper" aria-hidden="true">
                    <button
                      type="button"
                      on:click={() =>
                        ($formData.negativeBalanceLimit = Math.max(
                          -1000000,
                          Number($formData.negativeBalanceLimit || 0) - 10,
                        ))}>−10</button
                    >
                    <button
                      type="button"
                      on:click={() =>
                        ($formData.negativeBalanceLimit = Math.min(
                          0,
                          Number($formData.negativeBalanceLimit || 0) + 10,
                        ))}>+10</button
                    >
                  </div>
                </div>
                <div class="range-row">
                  <input
                    type="range"
                    min="-10000"
                    max="0"
                    step="10"
                    bind:value={$formData.negativeBalanceLimit}
                  />
                  <span class="range-label"
                    >{formatCurrencyPreview(
                      Math.abs(Number($formData.negativeBalanceLimit || 0)),
                      "LEFT",
                      $formData.currencyIcon || "💰",
                    )}</span
                  >
                </div>
              </div>
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

<style lang="scss">
  .preview-card {
    margin-top: var(--space-m);
    padding: var(--space-m);
    border-radius: var(--radius-m);
    background: linear-gradient(
      135deg,
      hsl(var(--theme-hue), var(--theme-saturation-high), 60%, 0.08),
      rgba(var(--color-accent), 0.05)
    );
    border: var(--glass-border-light);
    box-shadow: 0 14px 36px rgba(0, 0, 0, 0.2);
  }

  .preview-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-s);
    margin-bottom: var(--space-s);
  }

  .preview-head .hint {
    color: rgb(var(--color-neutral));
    font-size: 0.9rem;
    margin: 0;
  }

  .discord-msg {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--space-s);
    align-items: flex-start;
  }

  .discord-msg .avatar {
    width: 44px;
    height: 44px;
    border-radius: 999px;
    background-size: cover;
    background-position: center;
    border: 2px solid hsl(var(--theme-hue), var(--theme-saturation), 95%, 0.1);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.25);
  }

  .bubble {
    background: hsl(var(--theme-hue), var(--theme-saturation), 12%, 0.7);
    border: var(--glass-border-light);
    border-radius: 12px;
    padding: 10px 12px;
    box-shadow: inset 0 1px 0
      hsl(var(--theme-hue), var(--theme-saturation), 95%, 0.04);
  }

  .meta {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 6px;
    color: rgb(var(--color-neutral));
  }

  .meta .user {
    font-weight: 700;
    color: #e5e7eb;
  }

  .meta .time {
    font-size: 0.9rem;
    color: #94a3b8;
  }

  .line {
    margin: 2px 0;
    color: rgb(var(--color-neutral));
    font-size: 0.95rem;
  }

  .line strong {
    color: #f9fafb;
  }

  .currency-layout {
    align-items: flex-start;
    gap: var(--space-l);
  }

  .preview-card {
    width: min(420px, 100%);
    flex: 1;
  }

  @media (max-width: 900px) {
    .currency-layout {
      flex-direction: column;
    }

    .preview-card {
      width: 100%;
    }
  }

  .input-stack {
    display: grid;
    gap: 8px;
  }

  .number-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px;
    align-items: center;
  }

  .stepper {
    display: inline-flex;
    border: var(--glass-border-light);
    border-radius: 10px;
    overflow: hidden;
    background: var(--glass-bg-subtle);
  }

  .stepper button {
    padding: 8px 10px;
    color: #e5e7eb;
    background: transparent;
    border: none;
    font-weight: 700;
    cursor: pointer;
  }

  .stepper button:hover {
    background: var(--glass-bg-light);
  }

  .bar {
    height: 6px;
    border-radius: 999px;
    background: hsl(var(--theme-hue), var(--theme-saturation), 95%, 0.08);
    overflow: hidden;
  }

  .bar span {
    display: block;
    height: 100%;
    background: var(--gradient-primary);
  }

  .bar.subtle span {
    background: linear-gradient(
      90deg,
      hsl(var(--theme-hue), var(--theme-saturation-high), 60%, 0.8),
      rgba(var(--color-accent), 0.6)
    );
  }

  .range-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px;
    align-items: center;
  }

  .range-row input[type="range"] {
    accent-color: var(--clr-primary);
  }

  .range-label {
    color: rgb(var(--color-neutral));
    font-weight: 600;
    font-size: 0.95rem;
  }

  .chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: var(--space-s);
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    border: var(--glass-border-medium);
    background: var(--glass-bg-light);
    color: #e5e7eb;
    font-weight: 700;
    cursor: pointer;
    transition:
      transform 120ms ease,
      border-color 120ms ease,
      background 120ms ease;
  }

  .chip:hover {
    transform: translateY(-1px);
    border-color: rgba(var(--color-secondary), 0.4);
    background: linear-gradient(
      120deg,
      hsl(var(--theme-hue), var(--theme-saturation-high), 60%, 0.18),
      rgba(var(--color-secondary), 0.12)
    );
  }

  .chip-sub {
    color: rgb(var(--color-neutral));
    font-weight: 600;
    font-size: 0.9rem;
  }
</style>
