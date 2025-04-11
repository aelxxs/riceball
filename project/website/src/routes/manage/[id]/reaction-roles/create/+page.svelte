<script lang="ts">
import { beforeNavigate, goto } from "$app/navigation";
import { Button } from "$lib/blocks/button";
import {
	DashboardCard,
	DashboardCardSideBySide,
} from "$lib/blocks/dashboard-card";
import { DiscordMessageCreator } from "$lib/blocks/discord-message-creator";
import EmojiPicker from "$lib/blocks/emoji-picker/emoji-picker.svelte";
import { Control, Field, Fieldset } from "$lib/blocks/forms";
import { Input } from "$lib/blocks/input";
import { RadioGroup, RadioGroupItem } from "$lib/blocks/radio-group";
import { ChannelSelect, Select } from "$lib/blocks/select";
import SelectDiscord from "$lib/blocks/select-discord/select-discord.svelte";
import { WebsiteRoutes } from "$lib/constants";
import { getAppState } from "$lib/utility/context.svelte.js";
import { getFirstChannelFromItemizedChannelList } from "$lib/utility/utils.js";
import { ReactionRoleSchema } from "@riceball/db/zod";
import { ElementField } from "formsnap";
import { Trash2Icon } from "lucide-svelte";
import { toast } from "svelte-sonner";
import SuperDebug, { superForm } from "sveltekit-superforms";
import { zodClient } from "sveltekit-superforms/adapters";

const appState = getAppState();

const { data } = $props();

const goBack = () => goto(WebsiteRoutes.ReactionRoles(data.guild.id));

const form = superForm(data.form, {
	validators: zodClient(ReactionRoleSchema),
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
		value: "TOGGLE",
		label: "Toggle Role",
		description:
			"Adds or removes a role from a user when they react to the message.",
	},
	{
		value: "ADD",
		label: "Add Role Only",
		description:
			"Adds a role to a user when they react to the message. The user must not have the role already.",
	},
	{
		value: "REMOVE",
		label: "Remove Role Only",
		description:
			"Removes a role from a user when they react to the message. The user must have the role already.",
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
		{ label: "Create", handler: submit },
	]);
});

beforeNavigate(() => {
	appState.destroyControls();
});

const pair = $state({ emoji: "", roles: [] });

if ($formData.channelId.length === 0) {
	if (data.guild.itemizedChannels.length > 0) {
		$formData.channelId = getFirstChannelFromItemizedChannelList(
			data.guild.itemizedChannels,
		).value;
	}
}

const addReactionRolePair = () => {
	$formData.pairs = [...$formData.pairs, pair];
};

const removeReactionRolePair = (i: number) => {
	$formData.pairs = $formData.pairs.filter((_, index) => index !== i);
};
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
                bind:value={$formData.alias}
                placeholder="Reaction Role Alias"
                {...props}
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
                items={data.guild.itemizedChannels}
                bind:value={$formData.channelId}
                {...props}
              />
            {/snippet}
          </Control>
        </Field>
      </div>
    {/snippet}
  </DashboardCardSideBySide>

  <DashboardCard
    title="Reactions"
    description="The reactions that will be added to the message."
  >
    <div class="max-w-form flow">
      <Fieldset {form} name="pairs">
        {#each $formData.pairs as _, i}
          <ElementField {form} name="type">
            <Control
              label="Reaction Role Pair {i + 1}"
              description="When a user reacts to the message with this emoji, they will be given the roles."
              screenReaderOnly
            >
              {#snippet children({ props })}
                <SelectDiscord
                  type="role"
                  items={data.guild.itemizedRoles}
                  bind:selected={$formData.pairs[i].roles}
                  {...props}
                >
                  {#snippet left()}
                    <EmojiPicker
                      guild={data.guild}
                      bind:value={$formData.pairs[i].emoji}
                      onEmojiPick={(emoji) => {
                        $formData.pairs[i].emoji = emoji.native || emoji.id;
                      }}
                      showSelected
                      hideAfterPick
                    />
                  {/snippet}
                  {#snippet right()}
                    <Button
                      size="icon"
                      variant="destructive"
                      onclick={() => removeReactionRolePair(i)}
                    >
                      <Trash2Icon size="1rem" />
                    </Button>
                  {/snippet}
                </SelectDiscord>
              {/snippet}
            </Control>
          </ElementField>
        {/each}
      </Fieldset>
      <Button variant="secondary" onclick={addReactionRolePair}>
        Add New Reaction
      </Button>
    </div>
  </DashboardCard>

  <DashboardCard
    title="Message"
    description="The message that will be reacted to."
  >
    <div class="flow">
      <DiscordMessageCreator
        client={data.client}
        guild={data.guild}
        bind:content={$formData.messageContent}
        bind:embeds={$formData.messageEmbed}
        reactions={$formData.pairs.map((pair) => pair.emoji)}
      />
    </div>
  </DashboardCard>

  <!-- <DashboardCard
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
  </DashboardCard> -->
</form>
