<script lang="ts">
  // - Icons
  import HashIcon from "lucide-svelte/icons/hash";

  import {
    DashboardCard,
    DashboardCardSideBySide,
  } from "$lib/blocks/dashboard-card";
  import { DiscordMessageCreator } from "$lib/blocks/discord-message-creator/index.js";
  import EmojiPicker from "$lib/blocks/emoji-picker/emoji-picker.svelte";
  import { Input } from "$lib/blocks/input";
  import Restrictions from "$lib/blocks/restrictions/restrictions.svelte";
  import { Select } from "$lib/blocks/select";
  import { Switch } from "$lib/blocks/switch";
  import { getSaveModal } from "$lib/utility/context.svelte.js";
  import { StarsSchema } from "@riceball/db/zod";
  import { ChannelType } from "discord-api-types/v10";
  import { Control, Field, FieldErrors, Label } from "formsnap";
  import { toast } from "svelte-sonner";
  import SuperDebug, { superForm } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";

  const { data } = $props();

  const modal = getSaveModal();

  const form = superForm(data.form, {
    validators: zodClient(StarsSchema),
    dataType: "json",
    resetForm: false,
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

  const {
    form: formData,
    enhance,
    tainted,
    isTainted,
    submit,
    delayed,
    submitting,
  } = form;

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

  const embed = $state({});
</script>

<SuperDebug data={$formData} />

<form method="POST" action="?/save" use:enhance class="stack">
  <DashboardCardSideBySide
    module1Props={{
      title: "Star Emoji",
      description: "The emoji that will be used to star messages.",
    }}
    module2Props={{
      title: "Star Threshold",
      description: "The number of stars required to pin a message.",
    }}
  >
    {#snippet module1()}
      <div class="max-w-form">
        <Field {form} name="emoji">
          <Control>
            {#snippet children({ props })}
              <Label class="sr-only">Emoji</Label>
              <div class="cluster align-start gap:-1">
                <EmojiPicker
                  showSelected
                  guild={data.guild}
                  bind:value={$formData.emoji}
                />
                <div class="stack gap:-2">
                  <p class="fw:bold txt:bold">Select Emoji</p>
                  <p>You may use custom emojis from your server.</p>
                </div>
              </div>
            {/snippet}
          </Control>
          <!-- <FieldErrors /> -->
        </Field>
      </div>
    {/snippet}

    {#snippet module2()}
      <div class="max-w-form">
        <Field {form} name="threshold">
          <Control>
            {#snippet children({ props })}
              <Input
                {...props}
                type="number"
                bind:value={$formData.threshold}
              />
            {/snippet}
          </Control>
          <FieldErrors />
        </Field>
      </div>
    {/snippet}
  </DashboardCardSideBySide>

  <DashboardCard
    title="Starboard Channel"
    description="The channel where starred messages will be sent."
  >
    <div class="max-w-form">
      <Field {form} name="channelId">
        <Control>
          {#snippet children({ props })}
            <Label class="sr-only">Channel</Label>
            <Select
              {...props}
              icon={HashIcon}
              items={data.guild.itemizedChannels}
              placeholder="Select a channel..."
              bind:value={$formData.channelId!}
            />
          {/snippet}
        </Control>
        <FieldErrors />
      </Field>
    </div>
  </DashboardCard>

  <DashboardCard
    title="Self Starring Messages"
    description="Allow users to star their own messages."
  >
    <div class="max-w-form flow">
      <Field {form} name="selfStarEnabled">
        <Control>
          {#snippet children({ props })}
            <Label>Self Star Enabled</Label>
            <div class="cluster gap:-2">
              <Switch {...props} bind:checked={$formData.selfStarEnabled} />
              <p>Allow users to star their own messages</p>
            </div>
          {/snippet}
        </Control>
        <FieldErrors />
      </Field>
      {#if $formData.selfStarEnabled}
        <Field {form} name="selfStarWarning">
          <Control>
            {#snippet children({ props })}
              <Label>Self Star Warning</Label>
              <div class="cluster gap:-2">
                <Switch {...props} bind:checked={$formData.selfStarWarning} />
                <p>Warn users when they star their own messages</p>
              </div>
            {/snippet}
          </Control>
          <FieldErrors />
        </Field>
      {/if}
    </div>
  </DashboardCard>

  <DashboardCard
    title="Starboard Message"
    description="Customize the embed message that will be sent to the starboard channel."
  >
    <DiscordMessageCreator client={data.client} guild={data.guild} withEmbed />
  </DashboardCard>

  <Restrictions
    title="Role Restrictions"
    description="Restrict which roles are allowed to use the starboard."
    type="role"
    {form}
    items={data.guild.itemizedRoles}
  />

  <Restrictions
    title="Channel Restrictions"
    description="Restrict which channels where starred messages will be listened to."
    type="channel"
    {form}
    items={data.guild.itemizedChannels}
  />
</form>
