<script lang="ts">
import { beforeNavigate, goto } from "$app/navigation";
import {
	DashboardCard,
	DashboardCardSideBySide,
} from "$lib/blocks/dashboard-card";
import { DiscordMessageCreator } from "$lib/blocks/discord-message-creator";
import { Input } from "$lib/blocks/input";
import { ChannelSelect } from "$lib/blocks/select";
import { WebsiteRoutes } from "$lib/constants";
import { getAppState } from "$lib/utility/context.svelte";
import SuperDebug, { superForm } from "sveltekit-superforms";

const { data } = $props();

const embedCreateForm = superForm(data.form, {
	dataType: "json",
});

const { form, submit, enhance } = embedCreateForm;

const handleCancel = () => goto(WebsiteRoutes.Embeds(data.guild.id));
const handleSubmit = () => submit();

const appState = getAppState();

$effect.pre(() => {
	appState.setControlTitle("Create Embed");
	appState.setControlsVisible(true);
	appState.setControls([
		{ label: "Cancel", handler: handleCancel, variant: "destructive" },
		{ label: "Publish", handler: handleSubmit },
	]);
});

beforeNavigate(appState.destroyControls);
</script>

<SuperDebug data={$form} />

<!-- Channel -->
<form class="stack" method="POST" action="?/save" use:enhance>
  <DashboardCardSideBySide
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
      <ChannelSelect items={data.guild.itemizedChannels} />
    {/snippet}
  </DashboardCardSideBySide>

  <DashboardCard title="Embed" description="Create a new embed message.">
    <DiscordMessageCreator
      guild={data.guild}
      client={data.client}
      bind:content={$form.content}
      bind:embeds={$form.embeds}
      maxEmbeds={10}
    />
  </DashboardCard>

  <DashboardCard
    title="Sender"
    description="Customize the sender for this embed message."
  >
    <div class="max-w-form">
      <Input placeholder="Sender Name" class="max-w-form" />
    </div>
  </DashboardCard>
</form>

<!-- Embed -->
