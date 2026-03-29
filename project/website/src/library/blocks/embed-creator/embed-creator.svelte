<script lang="ts">
// - Icons

import type { DiscordEmbedWithRelations } from "@riceball/db/zod";
import { PencilIcon, Trash2 } from "lucide-svelte";
import EyeIcon from "lucide-svelte/icons/eye";
import PlusIcon from "lucide-svelte/icons/plus";
import type { DashboardGuild } from "$lib/types";
import { Button } from "../button";
import { ButtonWithConfirmation } from "../button-with-confirmation";
import ColorPicker from "../color-picker/color-picker.svelte";
import Editable from "../editable/editable.svelte";
import EmbedField from "./blocks/embed-field.svelte";
import ImageUpload from "./blocks/image-upload.svelte";

type Props = {
	embed: DiscordEmbedWithRelations;
	guild: DashboardGuild;
	handleDelete?: () => void;
	onChange?: (embed: DiscordEmbedWithRelations) => void;
};

const hexToInteger = (hex: string) => Number.parseInt(hex.replace("#", ""), 16);
const integerToHex = (int: number) => `#${int?.toString(16).padStart(6, "0")}`;

type EmbedFieldValue = DiscordEmbedWithRelations["fields"][number];

let { embed, guild, handleDelete, onChange }: Props = $props();

const cloneEmbed = (value: DiscordEmbedWithRelations): DiscordEmbedWithRelations => ({
	...value,
	author: { ...value.author },
	fields: value.fields.map((field) => ({ ...field })),
	footer: { ...value.footer },
	image: { ...value.image },
	thumbnail: { ...value.thumbnail },
});

const updateEmbed = (updater: (current: DiscordEmbedWithRelations) => DiscordEmbedWithRelations) => {
	const nextEmbed = updater(cloneEmbed(embed));

	embed = nextEmbed;
	onChange?.(nextEmbed);
};

const updateField = (index: number, nextField: EmbedFieldValue) => {
	updateEmbed((current) => ({
		...current,
		fields: current.fields.map((field, fieldIndex) => (fieldIndex === index ? nextField : field)),
	}));
};

/**
 * Adds a new field to the embed
 */
const addField = () => {
	updateEmbed((current) => ({
		...current,
		fields: [...current.fields, { name: "", value: "", inline: false }],
	}));
};

/**
 * Deletes a field from the embed
 * @param index
 */
function handleFieldDelete(index: number) {
	updateEmbed((current) => ({
		...current,
		fields: current.fields.filter((_, fieldIndex) => fieldIndex !== index),
	}));
}

let preview = $state(false);
</script>

<div class="with-sidebar">
  <div class="box embed stack" style:--embed-color={integerToHex(embed.color)}>
    <div class="repel" style:--repel-vertical-alignment="start">
      <div class="stack text-group-1">
        {#if !preview || embed.author.icon_url.length || embed.author.name.length}
          <div class="cluster space-2xs">
            {#if !preview && !embed.author.icon_url.length}
              <ImageUpload
                url={embed.author.icon_url}
                onUrlChange={(url: string | null) =>
                  updateEmbed((current) => ({
                    ...current,
                    author: { ...current.author, icon_url: url ?? "" },
                  }))}
                w={23.5}
                h={23.5}
              />
            {/if}
            {#if !preview}
              <Editable
                editable={!preview}
                type="text"
                class="fs:xs fw:bold"
                placeholder="Author Name"
                value={embed.author.name}
                onValueChange={(value) =>
                  updateEmbed((current) => ({
                    ...current,
                    author: { ...current.author, name: value },
                  }))}
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
            value={embed.title}
            onValueChange={(value) =>
              updateEmbed((current) => ({
                ...current,
                title: value,
              }))}
            maxLength={256}
            {guild}
          />
          <Editable
            editable={!preview}
            type="textarea"
            placeholder="Description"
            value={embed.description}
            onValueChange={(value) =>
              updateEmbed((current) => ({
                ...current,
                description: value,
              }))}
            maxLength={4096}
            {guild}
          />
        </div>
      </div>
      {#if !preview && !embed.thumbnail.url.length}
        <ImageUpload
          url={embed.thumbnail.url}
          onUrlChange={(url: string | null) =>
            updateEmbed((current) => ({
              ...current,
              thumbnail: { ...current.thumbnail, url: url ?? "" },
            }))}
          w={80}
          h={80}
        />
      {/if}
    </div>

    {#if embed.fields.length}
      <div class="fields text-group-1">
        {#each embed.fields as field, i}
          <EmbedField
            {field}
            onChange={(nextField) => updateField(i, nextField)}
            onDelete={() => handleFieldDelete(i)}
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
      <ImageUpload
        ratio={2 / 0.85}
        url={embed.image.url}
        onUrlChange={(url: string | null) =>
          updateEmbed((current) => ({
            ...current,
            image: { ...current.image, url: url ?? "" },
          }))}
      />
    {/if}

    {#if !preview || embed.footer.icon_url.length || embed.footer.text.length}
      <div class="cluster space-2xs text-group-2">
        {#if !preview && !embed.footer.icon_url.length}
          <ImageUpload
            w={23.5}
            h={23.5}
            url={embed.footer.icon_url}
            onUrlChange={(url: string | null) =>
              updateEmbed((current) => ({
                ...current,
                footer: { ...current.footer, icon_url: url ?? "" },
              }))}
          />
        {/if}

        {#if !preview}
          <Editable
            type="text"
            class="fs:xs fw:bold"
            placeholder="Footer"
            value={embed.footer.text}
            onValueChange={(value) =>
              updateEmbed((current) => ({
                ...current,
                footer: { ...current.footer, text: value },
              }))}
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
    <ColorPicker
      color={integerToHex(embed.color)}
      onColorChange={(color) =>
        updateEmbed((current) => ({
          ...current,
          color: hexToInteger(color),
        }))}
    />
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
