<script lang="ts">
  // - Icons
  import HashIcon from "lucide-svelte/icons/hash";

  import {
    DashboardCard,
    DashboardCardSideBySide,
  } from "$lib/blocks/dashboard-card";
  import EmojiPicker from "$lib/blocks/emoji-picker/emoji-picker.svelte";
  import { Input } from "$lib/blocks/input";
  import Restrictions from "$lib/blocks/restrictions/restrictions.svelte";
  import { Select } from "$lib/blocks/select";
  import { Switch } from "$lib/blocks/switch";
  import { StarsWithRelationsSchema } from "db/zod";
  import { ChannelType } from "discord-api-types/v10";
  import { Control, Field, FieldErrors, Label } from "formsnap";
  import { superForm } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";

  let { data } = $props();

  const settingsForm = superForm(data.form, {
    validators: zodClient(StarsWithRelationsSchema),
    dataType: "json",
    resetForm: false,
  });

  const { form, enhance, tainted, isTainted, submit } = settingsForm;

  // $effect(() => {
  //   if (isTainted($tainted)) {
  //     saveModal.showModal({
  //       save: () => {
  //         submit();
  //         saveModal.hideModal();
  //       },
  //       undo: () => settingsForm.reset(),
  //     });
  //   } else {
  //     saveModal.hideModal();
  //   }
  // });

  let embed = $state({});
</script>

<!-- <SuperDebug data={$form} /> -->

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
        <Field form={settingsForm} name="emoji">
          <Control>
            {#snippet children({ props })}
              <Label class="sr-only">Emoji</Label>
              <div class="cluster align-start gap:-1">
                <EmojiPicker
                  showSelected
                  guild={data.guild}
                  bind:value={$form.emoji}
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
        <Field form={settingsForm} name="threshold">
          <Control>
            {#snippet children({ props })}
              <Input {...props} type="number" bind:value={$form.threshold} />
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
      <Field form={settingsForm} name="channelId">
        <Control>
          {#snippet children({ props })}
            <Label class="sr-only">Channel</Label>
            <Select
              {...props}
              icon={HashIcon}
              items={data.guild.itemizedChannels}
              placeholder="Select a channel..."
              bind:value={$form.channelId!}
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
      <Field form={settingsForm} name="selfStarEnabled">
        <Control>
          {#snippet children({ props })}
            <Label>Self Star Enabled</Label>
            <div class="cluster gap:-2">
              <Switch {...props} bind:checked={$form.selfStarEnabled} />
              <p>Allow users to star their own messages</p>
            </div>
          {/snippet}
        </Control>
        <FieldErrors />
      </Field>
      {#if $form.selfStarEnabled}
        <Field form={settingsForm} name="selfStarWarning">
          <Control>
            {#snippet children({ props })}
              <Label>Self Star Warning</Label>
              <div class="cluster gap:-2">
                <Switch {...props} bind:checked={$form.selfStarWarning} />
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
    <!-- <EmbedCreator /> -->
    pp
  </DashboardCard>
  <!--
  <Restrictions
    title="Role Restrictions"
    description="Restrict which roles are allowed to gain exp."
    type="role"
    form={settingsForm}
    items={data.guild.roles.map((role) => ({
      value: role.id,
      label: role.name,
    }))}
  />

  <Restrictions
    title="Channel Restrictions"
    description="Restrict which channels users can gain exp in."
    type="channel"
    form={settingsForm}
    items={}
  /> -->
</form>
