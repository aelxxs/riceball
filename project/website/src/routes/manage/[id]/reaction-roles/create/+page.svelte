<script lang="ts">
import { beforeNavigate, goto } from "$app/navigation";
import { Button } from "$lib/blocks/button";
import {
	DashboardCard,
	DashboardCardSideBySide,
} from "$lib/blocks/dashboard-card";
import { DiscordMessageCreator } from "$lib/blocks/discord-message-creator";
import EmojiPicker from "$lib/blocks/emoji-picker/emoji-picker.svelte";
import { Control, Field } from "$lib/blocks/forms";
import { Input } from "$lib/blocks/input";
import { RadioGroup, RadioGroupItem } from "$lib/blocks/radio-group";
import { ChannelSelect } from "$lib/blocks/select";
import SelectDiscord from "$lib/blocks/select-discord/select-discord.svelte";
import { WebsiteRoutes } from "$lib/constants";
import { getAppState } from "$lib/utility/context.svelte.js";
import {
	type DiscordEmbedWithRelations,
	ReactionRoleSchema,
} from "@riceball/db/zod";
import { Trash2Icon } from "lucide-svelte";
import { toast } from "svelte-sonner";
import SuperDebug, { superForm } from "sveltekit-superforms";
import { zodClient } from "sveltekit-superforms/adapters";

const appState = getAppState();

const { data } = $props();

const goBack = () => goto(WebsiteRoutes.ReactionRoles(data.guild.id));

const form = superForm(data.form, {
	// validators: zodClient(ReactionRoleSchema),
	dataType: "json",
	onUpdate: ({ result }) => {
		switch (result.type) {
			case "success":
				toast.success("Settings saved successfully!");
				goBack();
				break;
			case "failure":
				console.log({ result });
				toast.error("Failed to save settings.");
				break;
			default:
				break;
		}
	},
});

const { form: formData, submit, enhance } = form;

const types = [
	{
		value: "NORMAL",
		label: "Toggle Role",
		description:
			"Adds or removes a role from a user when they react to the message.",
	},
	{
		value: "ADD",
		label: "Add Role",
		description: "Add a role to a user when they react to the message.",
	},
	{
		value: "REMOVE",
		label: "Remove Role",
		description: "Remove a role from a user when they react to the message.",
	},
	{
		value: "UNIQUE",
		label: "Unique Role",
		description:
			"Remove all other roles from a user when they react to the message.",
	},
];

$effect.pre(() => {
	appState.setControlTitle("New Reaction Role");
	appState.setControlsVisible(true);
	appState.setControls([
		{ label: "Cancel", handler: goBack, variant: "destructive" },
		{ label: "Publish 🚀", handler: submit },
	]);
});

beforeNavigate(() => {
	appState.destroyControls();
});

const pair = $state({ emoji: "", roles: [] });
</script>

<SuperDebug data={$formData} />

<form class="stack" method="POST" action="?/save" use:enhance>
  <DashboardCardSideBySide
    module1Props={{
      title: "Alias",
      description: "Set an alias for the reaction role.",
    }}
    module2Props={{
      title: "Channel",
      description: "The channel where the reaction role will be created.",
    }}
  >
    {#snippet module1()}
      <div class="max-w-form">
        <Field {form} name="alias">
          <Control label="Alias" screenReaderOnly>
            {#snippet children({ props })}
              <Input
                {...props}
                bind:value={$formData.alias}
                placeholder="Reaction Role Alias"
              />
            {/snippet}
          </Control>
        </Field>
      </div>
    {/snippet}

    {#snippet module2()}
      <div class="max-w-form">
        <Field {form} name="channelId">
          <Control label="Channel" screenReaderOnly>
            {#snippet children({ props })}
              <ChannelSelect
                {...props}
                items={data.guild.itemizedChannels}
                bind:value={$formData.channelId}
              />
            {/snippet}
          </Control>
        </Field>
      </div>
    {/snippet}
  </DashboardCardSideBySide>

  <DashboardCard
    title="Message"
    description="The message that will be reacted to."
  >
    <div class="flow">
      <DiscordMessageCreator
        client={data.client}
        guild={data.guild}
        bind:content={$formData.messageContent}
        bind:embeds={$formData.messageEmbed as DiscordEmbedWithRelations}
        reactions={$formData.pairs.map((pair) => pair.emoji)}
      />
    </div>
  </DashboardCard>

  <DashboardCard
    title="Reactions"
    description="The reactions that will be added to the message."
  >
    <div class="max-w-form flow">
      <Button
        variant="secondary"
        onclick={() => {
          $formData.pairs = [...($formData.pairs as any[]), pair];
        }}
      >
        Add New Reaction
      </Button>

      {#each $formData.pairs as pair, i}
        <SelectDiscord
          type="role"
          items={data.guild.itemizedRoles}
          bind:selected={pair.roles}
        >
          {#snippet left()}
            <EmojiPicker
              guild={data.guild}
              bind:value={pair.emoji}
              onEmojiPick={(emoji) => {
                pair.emoji = emoji.native || emoji.id;
              }}
              showSelected
              hideAfterPick
            />
          {/snippet}
          {#snippet right()}
            <Button
              size="icon"
              variant="destructive"
              onclick={() => {
                if ($formData.pairs.length === 1) {
                  $formData.pairs = [
                    {
                      emoji: "🍙",
                      roles: [],
                    },
                  ];
                } else {
                  $formData.pairs = $formData.pairs.filter(
                    (_, index) => index !== i,
                  );
                }
              }}
            >
              <Trash2Icon size="1rem" />
            </Button>
          {/snippet}
        </SelectDiscord>
      {/each}
    </div>
  </DashboardCard>

  <DashboardCard
    title="Type"
    description="Configure the behavior that occurs when a user reacts to the message."
  >
    <div class="max-w-form flow">
      <Field {form} name="type">
        <Control label="Type" screenReaderOnly>
          <RadioGroup bind:value={$formData.type}>
            {#each types as type}
              <Control
                label={type.label}
                description={type.description}
                orientation="horizontal"
              >
                {#snippet children({ props })}
                  <RadioGroupItem
                    {...props}
                    id={type.value}
                    value={type.value}
                  />
                {/snippet}
              </Control>
            {/each}
          </RadioGroup>
        </Control>
      </Field>
    </div>
  </DashboardCard>
</form>
