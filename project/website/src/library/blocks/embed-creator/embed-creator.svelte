<script lang="ts">
// - Icons
import EyeIcon from "lucide-svelte/icons/eye";
import PlusIcon from "lucide-svelte/icons/plus";

import type { DiscordEmbedWithRelations } from "@riceball/db/zod";
import { Button } from "../button";
import ColorPicker from "../color-picker/color-picker.svelte";
import EmbedField from "./blocks/embed-field.svelte";
import ImageUpload from "./blocks/image-upload.svelte";

import type { DashboardGuild } from "$lib/types";
import { PencilIcon, Trash2 } from "lucide-svelte";
import { ButtonWithConfirmation } from "../button-with-confirmation";
import Editable from "../editable/editable.svelte";

type Props = {
	embed: DiscordEmbedWithRelations;
	guild: DashboardGuild;
	handleDelete?: () => void;
};

const hexToInteger = (hex: string) => Number.parseInt(hex.replace("#", ""), 16);
const integerToHex = (int: number) => `#${int?.toString(16).padStart(6, "0")}`;

let {
	embed = $bindable<DiscordEmbedWithRelations>(),
	guild,
	handleDelete,
}: Props = $props();

/**
 * Adds a new field to the embed
 */
const addField = () => {
	embed.fields.push({ name: "", value: "", inline: false });
};

/**
 * Deletes a field from the embed
 * @param index
 */
function handleFieldDelete(index: number) {
	if (embed.fields) {
		embed.fields = embed.fields.filter((_, i) => i !== index);
	}
}

/**
 * Toggles the inline property of a field
 * @param index
 */
function handleFieldToggleInline(index: number) {
	if (embed.fields) {
		embed.fields = embed.fields.map((field, i) => {
			return i === index ? { ...field, inline: !field.inline } : field;
		});
	}
}

const color = {
	get value() {
		return integerToHex(embed.color);
	},
	set value(color: string) {
		embed.color = hexToInteger(color);
	},
};

let preview = $state(false);
</script>

<div class="with-sidebar">
  <div class="box embed stack" style:--embed-color={integerToHex(embed.color)}>
    <div class="repel" style:--repel-vertical-alignment="start">
      <div class="stack text-group-1">
        {#if !preview || embed.author.icon_url.length || embed.author.name.length}
          <div class="cluster space-2xs">
            {#if !preview && !embed.author.icon_url.length}
              <ImageUpload bind:url={embed.author.icon_url} w={23.5} h={23.5} />
            {/if}
            {#if !preview && !embed.author.name.length}
              <Editable
                editable={!preview}
                type="text"
                class="fs:xs fw:bold"
                placeholder="Author Name"
                bind:value={embed.author.name}
                maxLength={2048}
                {guild}
              />
            {/if}
          </div>
        {/if}
        <div class="stack space-2xs">
          <Editable
            editable={!preview}
            type="text"
            class="fs:sm fw:bold txt:bold"
            placeholder="Title"
            bind:value={embed.title}
            maxLength={256}
            {guild}
          />
          <Editable
            editable={!preview}
            type="textarea"
            placeholder="Description"
            bind:value={embed.description}
            maxLength={4096}
            {guild}
          />
        </div>
      </div>
      {#if !preview && !embed.thumbnail.url.length}
        <ImageUpload bind:url={embed.thumbnail.url} w={80} h={80} />
      {/if}
    </div>

    {#if embed.fields.length}
      <div class="fields text-group-1">
        {#each embed.fields as _, i}
          <EmbedField
            bind:field={embed.fields[i]}
            onDelete={() => handleFieldDelete(i)}
            onToggleInline={() => handleFieldToggleInline(i)}
            {guild}
          />
        {/each}
      </div>
    {/if}

    {#if !preview}
      <div class="cluster space-xs">
        <Button variant="secondary" size="icon" onclick={addField}>
          <PlusIcon size={16} />
        </Button>
        Add Field
      </div>
    {/if}

    {#if !preview && !embed.image.url.length}
      <ImageUpload ratio={2 / 0.85} bind:url={embed.image.url} />
    {/if}

    {#if !preview || embed.footer.icon_url.length || embed.footer.text.length}
      <div class="cluster space-2xs text-group-2">
        {#if !preview && !embed.footer.icon_url.length}
          <ImageUpload w={23.5} h={23.5} bind:url={embed.footer.icon_url} />
        {/if}

        {#if !preview && !embed.footer.text.length}
          <Editable
            type="text"
            class="fs:xs fw:bold"
            placeholder="Footer"
            bind:value={embed.footer.text}
            maxLength={2048}
            {guild}
          />
        {/if}
      </div>
    {/if}
  </div>
  <!-- Controls -->
  <div class="cluster space-2xs align-start">
    <Button
      size="icon"
      onclick={() => {
        preview = !preview;
      }}
    >
      {#if preview}
        <PencilIcon size={16} />
      {:else}
        <EyeIcon size={16} />
      {/if}
    </Button>
    <ColorPicker bind:color={color.value} />
    {#if handleDelete}
      <ButtonWithConfirmation
        onConfirm={handleDelete}
        title="Remove Embed"
        description="Are you sure you want to remove this embed?"
      >
        {#snippet button()}
          <Button size="icon" variant="destructive">
            <Trash2 size={16} />
          </Button>
        {/snippet}
      </ButtonWithConfirmation>
    {/if}
  </div>
</div>

<style>
  .with-sidebar {
    display: flex;
    flex-wrap: wrap-reverse;
    gap: var(--space-2xs);
    align-items: flex-end;
  }

  .with-sidebar > :last-child {
    flex-grow: 1;
    flex-basis: 1rem;
  }

  .with-sidebar > :first-child {
    flex-basis: 0;
    flex-grow: 999;
    min-inline-size: 90%;
  }

  .text-group-1 {
    flex: 1;
    /* ImageUpload - Padding: var(--space-s) */
    max-width: calc(100% - 5rem - var(--space-s));
  }

  .text-group-2 {
    flex: 1;
    max-width: calc(100% - 2rem);
  }

  .fields {
    display: grid;
    grid-template-columns: 1fr;
    gap: 18px;
  }

  @media (min-width: 768px) {
    .fields {
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    }
  }

  .embed {
    position: relative;
    --bg: var(--clr-bg-input);
    --padding: var(--space-m);
    overflow-wrap: break-word;
    width: 100%;
  }

  .embed::before {
    content: "";
    position: absolute;
    inset-inline-start: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 5px;
    height: 100%;
    background-color: var(--embed-color);
    border-top-left-radius: var(--border-radius);
    border-bottom-left-radius: var(--border-radius);
  }
</style>
