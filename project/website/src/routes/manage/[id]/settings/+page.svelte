<script lang="ts">
import {
	DashboardCard,
	DashboardCardSideBySide,
} from "$lib/blocks/dashboard-card";
import { DiscordMessageCreator } from "$lib/blocks/discord-message-creator";
import { Control, Field } from "$lib/blocks/forms";
import { Restrictions } from "$lib/blocks/restrictions";
import { Select } from "$lib/blocks/select";
import { getSaveModal, shake } from "$lib/utility/context.svelte";
import { toast } from "svelte-sonner";
import SuperDebug, { superForm } from "sveltekit-superforms";

const { data } = $props();

const modal = getSaveModal();

const form = superForm(data.form, {
	dataType: "json",
	resetForm: false,
	taintedMessage: () => {
		return new Promise(() => {
			shake.shake = true;
			setTimeout(() => {
				shake.shake = false;
			}, 500);
		});
	},
	onUpdate: ({ result }) => {
		switch (result.type) {
			case "success":
				modal.hideModal();
				toast.success("Settings saved successfully!");
				break;
			case "failure":
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
</script>

<SuperDebug data={$formData} />

<form class="stack" method="POST" action="?/save" use:enhance>
  <DashboardCardSideBySide
    module1Props={{
      title: "Locale",
      description: "Change the language Rice Ball uses.",
    }}
    module2Props={{
      title: "Timezone",
      description: "Change the timezone Rice Ball uses.",
    }}
  >
    {#snippet module1()}
      <div class="max-w-form">
        <Field {form} name="locale">
          <Control>
            {#snippet children({ props })}
              <Select
                {...props}
                bind:value={$formData.locale}
                items={[{ value: "en-US", label: "English (United States)" }]}
                placeholder="Select a locale"
              />
            {/snippet}
          </Control>
        </Field>
      </div>
    {/snippet}

    {#snippet module2()}
      <div class="max-w-form">
        <Field {form} name="timezone">
          <Control>
            {#snippet children({ props })}
              <Select
                {...props}
                bind:value={$formData.timezone!}
                items={[{ value: "America/New_York", label: "Eastern Time" }]}
                placeholder="Select a timezone"
              />
            {/snippet}
          </Control>
        </Field>
      </div>
    {/snippet}
  </DashboardCardSideBySide>

  <DashboardCard
    title="Default Embed Color"
    description="Change the default color Rice Ball uses for embeds."
  >
    <div class="max-w-form">
      <Field {form} name="embedColor">
        <Control>
          {#snippet children({ props })}
            <DiscordMessageCreator
              {...props}
              guild={data.guild}
              client={data.guild.client}
              maxEmbeds={1}
              withEmbed
              noContent
            />
          {/snippet}
        </Control>
      </Field>
    </div>
  </DashboardCard>

  <Restrictions
    title="Role Restrictions"
    description="Restrict which roles can use Rice Ball commands and plugins."
    type="role"
    {form}
    items={data.guild.itemizedRoles}
  />
  <Restrictions
    title="Channel Restrictions"
    description="Restrict which channels users can use Rice Ball commands and plugins in."
    type="channel"
    {form}
    items={data.guild.itemizedChannels}
  />
</form>
