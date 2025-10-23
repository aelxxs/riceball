<script lang="ts">
import type { LevelsWithRelations } from "@riceball/db/custom";
import { Hash, MegaphoneOff, MessagesSquare, UserRoundPen } from "lucide-svelte";
import type { SuperForm } from "sveltekit-superforms";
import { DashboardCard } from "$lib/blocks/dashboard-card";
import { DiscordMessageCreator } from "$lib/blocks/discord-message-creator";
import { Control, Field } from "$lib/blocks/forms";
import { ChannelSelect, Select } from "$lib/blocks/select";
import { getGuild } from "$lib/utility/context.svelte";

type Props = {
	form: SuperForm<LevelsWithRelations>;
};

const { form }: Props = $props();
const { form: formData } = form;

const guild = getGuild();

const embed = $state({
	get value() {
		return $formData.notifyMessageEmbed;
	},
	set value(v) {
		$formData.notifyMessageEmbed = v;
	},
});

console.log($formData.notifyMessageEmbed);
</script>

<DashboardCard
  title="Leveling Up"
  description="Configure what happens when a user levels up."
>
  <div class="flow max-w-form">
    <Field {form} name="notifyMessageType">
      <Control label="Announcement Type">
        {#snippet children({ props })}
          <Select
            {...props}
            items={[
              {
                value: "CUSTOM_CHANNEL",
                label: "Custom Channel",
                icon: Hash,
              },
              {
                value: "ACTIVE_CHANNEL",
                label: "Current Channel",
                icon: MessagesSquare,
              },
              {
                value: "PRIVATE_MESSAGE",
                label: "Private Message",
                icon: UserRoundPen,
              },
              {
                value: "DISABLED",
                label: "Disabled",
                icon: MegaphoneOff,
              },
            ]}
            placeholder="Select a channel"
            bind:value={$formData.notifyDestination}
          />
        {/snippet}
      </Control>
    </Field>
    {#if $formData.notifyDestination !== "DISABLED"}
      {#if $formData.notifyDestination === "CUSTOM_CHANNEL"}
        <Field {form} name="notifyChannel">
          <Control label="Announcement Channel">
            {#snippet children({ props })}
              <ChannelSelect
                items={guild.itemizedChannels}
                bind:value={$formData.notifyChannel!}
                {...props}
              />
            {/snippet}
          </Control>
        </Field>
      {/if}
      <Field {form} name="notifyMessageType">
        <Control label="Announcement Message">
          {#snippet children({ props })}
            <DiscordMessageCreator
              {...props}
              {guild}
              client={guild.client}
              bind:content={$formData.notifyMessageContent}
              bind:embeds={embed.value}
            />
          {/snippet}
        </Control>
      </Field>
    {/if}
  </div>
</DashboardCard>
