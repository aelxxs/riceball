<script lang="ts">
import type { Reward } from "@riceball/db";
import type { LevelsWithRelations } from "@riceball/db/zod";
import { Legend } from "formsnap";
import AtSignIcon from "lucide-svelte/icons/at-sign";
import Trash2Icon from "lucide-svelte/icons/trash-2";
import { slide } from "svelte/transition";
import type { SuperForm } from "sveltekit-superforms";
import { Button } from "$lib/blocks/button";
import { ButtonWithConfirmation } from "$lib/blocks/button-with-confirmation";
import { DashboardCard } from "$lib/blocks/dashboard-card";
import { Divider } from "$lib/blocks/divider";
import { Control, Field, Fieldset } from "$lib/blocks/forms";
import Input from "$lib/blocks/input/input.svelte";
import { RadioGroup, RadioGroupItem } from "$lib/blocks/radio-group";
import { DiscordEntitySelect } from "$lib/blocks/select-discord";
import { Switch } from "$lib/blocks/switch";
import { getGuild } from "$lib/utility/context.svelte";

type Props = {
	form: SuperForm<LevelsWithRelations>;
};

const { form }: Props = $props();
const { form: formData } = form;

const guild = getGuild();

let reward = $state<Reward>({
	roles: [],
	level: 1,
});

const stackRewards = $state({
	get value() {
		return $formData.stackRewards ? "true" : "false";
	},
	set value(v) {
		$formData.stackRewards = v === "true";
	},
});

const sortedRewards = $derived($formData.rewards.sort((a, b) => a.level - b.level));

const handleRewardAdd = () => {
	const existingReward = $formData.rewards.find((r) => r.level === reward.level);

	if (existingReward) {
		if (existingReward.roles.some((r) => reward.roles.includes(r))) {
			return;
		}
		existingReward.roles = [...existingReward.roles, ...reward.roles];
		$formData.rewards = $formData.rewards.map((r) => (r.level === reward.level ? existingReward : r));
	} else {
		$formData.rewards = [...$formData.rewards, reward];
	}

	reward = { roles: [], level: 1 };
};

const handleRewardDelete = (index: number) => {
	$formData.rewards = $formData.rewards.filter((_, i) => i !== index);
};
</script>

<DashboardCard
  title="Level Up Rewards"
  description="Configure what rewards users get when they level up."
>
  <div class="stack space-m">
    <div class="max-w-form">
      <Fieldset {form} name="stackRewards">
        <Legend class="fw:md">Reward configuration</Legend>
        <RadioGroup bind:value={stackRewards.value}>
          <Control
            label="Stack previous rewards"
            description="Users will receive all rewards from previous levels."
            orientation="horizontal"
          >
            {#snippet children({ props })}
              <RadioGroupItem {...props} id="true" value="true" />
            {/snippet}
          </Control>
          <Control
            label="Replace previous rewards"
            description="Users will only receive rewards from their highest level."
            orientation="horizontal"
          >
            {#snippet children({ props })}
              <RadioGroupItem {...props} id="false" value="false" />
            {/snippet}
          </Control>
        </RadioGroup>
      </Fieldset>
    </div>
    <Divider />
    <div class="max-w-form flow">
      <Field {form} name="rewards">
        <Control
          label="Create a new level reward"
          description="Reward users with up to 5 roles when they reach a certain level."
        >
          {#snippet children({ props })}
            <DiscordEntitySelect
              {...props}
              type="role"
              max={5}
              items={guild.itemizedRoles}
              bind:selected={reward.roles}
              closeAfterSelect
            />
          {/snippet}
        </Control>
      </Field>

      {#if reward.roles.length > 0}
        <div class="cluster no-wrap" transition:slide>
          <Field {form} name="rewards">
            <Control label="Level" screenReaderOnly>
              {#snippet children({ props })}
                <Input
                  {...props}
                  label="Level:"
                  type="number"
                  min="1"
                  max="999"
                  bind:value={reward.level}
                />
              {/snippet}
            </Control>
          </Field>
          <Button onclick={handleRewardAdd}>Add Reward</Button>
        </div>
      {/if}

      <p class="fw:md">Your Rewards</p>
      <div class="grid rewards">
        {#each sortedRewards as reward, i (reward.level)}
          <div class="box reward stack">
            <div class="repel" style:--repel-vertical-alignment="flex-start">
              <div>
                <p class="txt-muted">Level</p>
                <p class="fs:sm fw:bold">
                  <span class="txt-muted">#</span>
                  {reward.level}
                </p>
              </div>
              <ButtonWithConfirmation
                onConfirm={() => handleRewardDelete(i)}
                title="Delete Reward"
                description="Are you sure you want to delete this reward?"
              >
                {#snippet button()}
                  <Button size="icon" variant="destructive">
                    <Trash2Icon size={16.25} />
                  </Button>
                {/snippet}
              </ButtonWithConfirmation>
            </div>
            <div class="cluster">
              {#each reward.roles as roleId}
                {@const guildRole = guild.roles.find((r) => r.id === roleId)}
                {#if guildRole}
                  <div class="cluster reward-role">
                    <AtSignIcon size={12} />
                    <small>{guildRole.name}</small>
                  </div>
                {/if}
              {/each}
            </div>
          </div>
        {:else}
          <p>No rewards have been created yet.</p>
        {/each}
      </div>
    </div>
    <Divider />
    <div class="max-w-form">
      <Field {form} name="addRolesOnJoin">
        <Control
          label="Add roles on join"
          description="Automatically add roles to users when they rejoin."
          orientation="horizontal"
        >
          {#snippet children({ props })}
            <Switch {...props} bind:checked={$formData.addRolesOnJoin} />
          {/snippet}
        </Control>
      </Field>
    </div>
  </div>
</DashboardCard>

<style>
  .rewards {
    --minimum: 20ch;
  }

  .reward {
    --padding: var(--space-s);
    --bg: var(--clr-bg-input);
  }

  .reward-role {
    --space: 0.25rem;
    display: inline-flex;
    align-items: center;
    padding: 0.3rem 0.75rem;
    border-radius: var(--radius-full);
    color: var(--txt-themed) !important;
    background-color: var(--clr-bg-input-hover);
    outline: 0;
    border: 0;
  }
</style>
