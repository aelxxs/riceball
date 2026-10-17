<script lang="ts">
import { ReactionRoleSchema } from "@riceball/db/zod";
import { ElementField } from "formsnap";
import { Trash2Icon } from "lucide-svelte";
import { toast } from "svelte-sonner";
import { superForm } from "sveltekit-superforms";
import { zodClient } from "sveltekit-superforms/adapters";
import { beforeNavigate, goto } from "$app/navigation";
import { Button } from "$lib/blocks/button";
import { DashboardCard, DashboardCardSideBySide } from "$lib/blocks/dashboard-card";
import { DiscordMessageCreator } from "$lib/blocks/discord-message-creator";
import EmojiPicker from "$lib/blocks/emoji-picker/emoji-picker.svelte";
import { Control, Field, Fieldset } from "$lib/blocks/forms";
import { Input } from "$lib/blocks/input";
import { RadioGroup, RadioGroupItem } from "$lib/blocks/radio-group";
import { ChannelSelect } from "$lib/blocks/select";
import SelectDiscord from "$lib/blocks/select-discord/select-discord.svelte";
import { Switch } from "$lib/blocks/switch";
import { WebsiteRoutes } from "$lib/constants";
import { getAppState } from "$lib/utility/context.svelte.js";
import { getFirstChannelFromItemizedChannelList } from "$lib/utility/utils.js";

const appState = getAppState();

const { data } = $props();

const goBack = () => goto(WebsiteRoutes.ReactionRoles(data.guild.id));

const form = superForm(data.form, {
	dataType: "json",
	onResult: () => {},
	onUpdate: ({ form: updated, result }) => {
		switch (result.type) {
			case "success":
				goBack();
				break;
			case "failure":
				toast.error(
					updated.message ??
						(updated.errors.pairs ? "Each reaction needs an emoji and 1 to 5 roles." : "Failed to save settings."),
				);
				break;
			default:
				break;
		}
	},
	resetForm: false,
	validators: zodClient(ReactionRoleSchema),
});

const { form: formData, submit, enhance } = form;

const types = [
	{
		value: "TOGGLE",
		label: "Toggle",
		description: "Reacting gives the roles. Removing the reaction takes them away.",
	},
	{
		value: "ADD",
		label: "Add only",
		description: "Reacting gives the roles. Removing the reaction does nothing, so members keep them.",
	},
	{
		value: "REMOVE",
		label: "Remove only",
		description: "Reacting takes the roles away. Removing the reaction does nothing.",
	},
	{
		value: "UNIQUE",
		label: "Unique",
		description:
			"Members can only hold the roles of one reaction. Reacting with another swaps their roles and clears their previous reaction.",
	},
] as const;

$effect.pre(() => {
	appState.setControlTitle("Edit Reaction Role");
	appState.setControlsVisible(true);
	appState.setControls([
		{ handler: goBack, label: "Cancel", variant: "destructive" },
		{ handler: submit, label: "Save" },
	]);
});

beforeNavigate(() => {
	appState.destroyControls();
});

if ($formData.channelId.length === 0) {
	if (data.guild.itemizedChannels.length > 0) {
		$formData.channelId = getFirstChannelFromItemizedChannelList(data.guild.itemizedChannels).value;
	}
}

const addReactionRolePair = () => {
	$formData.pairs = [...$formData.pairs, { emoji: "", roles: [] }];
};

const removeReactionRolePair = (i: number) => {
	$formData.pairs = $formData.pairs.filter((_, index) => index !== i);
};
</script>

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
          <ElementField {form} name="pairs[{i}]">
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

  <DashboardCard
    title="Type"
    description="Configure what happens when a member reacts to the message."
  >
    <div class="max-w-form">
      <Fieldset {form} name="type">
        <RadioGroup bind:value={$formData.type}>
          {#each types as type}
            <Control
              label={type.label}
              description={type.description}
              orientation="horizontal"
            >
              {#snippet children({ props })}
                <RadioGroupItem {...props} id={type.value} value={type.value} />
              {/snippet}
            </Control>
          {/each}
        </RadioGroup>
      </Fieldset>
    </div>
  </DashboardCard>

  <DashboardCard
    title="Status"
    description="Paused reaction roles keep their message, but reacting does nothing."
  >
    <div class="max-w-form">
      <Field {form} name="enabled">
        <Control label="Enabled" screenReaderOnly>
          {#snippet children({ props })}
            <div class="cluster gap:-2">
              <Switch {...props} bind:checked={$formData.enabled} />
              <p>Give and remove roles when members react</p>
            </div>
          {/snippet}
        </Control>
      </Field>
    </div>
  </DashboardCard>
</form>
