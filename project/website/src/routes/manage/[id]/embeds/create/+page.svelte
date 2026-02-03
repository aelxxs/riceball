<script lang="ts">
import SuperDebug, { superForm } from "sveltekit-superforms";
import { beforeNavigate, goto } from "$app/navigation";
import { DashboardCard, DashboardCardSideBySide } from "$lib/blocks/dashboard-card";
import { DiscordMessageCreator } from "$lib/blocks/discord-message-creator";
import { Input } from "$lib/blocks/input";
import { ChannelSelect } from "$lib/blocks/select";
import { WebsiteRoutes } from "$lib/constants";
import { getAppState } from "$lib/utility/context.svelte";

const { data } = $props();

const embedCreateForm = superForm(data.form, { dataType: "json" });

const { form: formData, submit, enhance } = embedCreateForm;

const handleCancel = () => goto(WebsiteRoutes.Embeds(data.guild.id));
const handleSubmit = () => submit();

const appState = getAppState();

$effect.pre(() => {
	appState.setControlTitle("Create Embed");
	appState.setControlsVisible(true);
	appState.setControls([
		{ handler: handleCancel, label: "Cancel", variant: "destructive" },
		{ handler: handleSubmit, label: "Publish" },
	]);
});

beforeNavigate(appState.destroyControls);

// filter webhooks by selected channelId
const channelWebhooks = $derived.by(() => {
	return data.webhooks.filter(({ channel_id }) => channel_id === $formData.channelId);
});
</script>

<SuperDebug data={$formData} />

<!-- Channel -->
<form class="stack" method="POST" action="?/save" use:enhance>
  <!-- <DashboardCardSideBySide
    module1Props={{
      title: "Embed Name",
      description: "Set a name for the embed.",
    }}
    module2Props={{
      title: "Channel",
      description: "The channel where the embed will be created.",
    }}
  >
    {#snippet module1()}
      <Input placeholder="Embed Name" class="max-w-form" />
    {/snippet}

    {#snippet module2()}
      <ChannelSelect
        bind:value={$formData.channelId}
        items={data.guild.itemizedChannels}
      />
    {/snippet}
  </DashboardCardSideBySide> -->

  <DashboardCard title="Embed" description="Create a new embed message.">
    <DiscordMessageCreator
      guild={data.guild}
      client={data.client}
      bind:content={$formData.content}
      bind:embeds={$formData.embeds}
      maxEmbeds={10}
    />
  </DashboardCard>

  <DashboardCard
    title="Sender"
    description="Customize the sender for this embed message."
  >
    <!--  -->
    <div class="max-w-form">
      <Input
        bind:value={$formData.webhook.name}
        placeholder="Sender Name"
        class="max-w-form"
      />
    </div>
  </DashboardCard>
</form>

<!-- Embed -->
