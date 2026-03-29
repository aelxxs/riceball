<script lang="ts">
// - Icons

import type { DiscordEmbedWithRelations } from "@riceball/db/zod";
import ArrowDownFromLineIcon from "lucide-svelte/icons/arrow-down-from-line";
import ArrowRightFromLineIcon from "lucide-svelte/icons/arrow-right-from-line";
import TrashIcon from "lucide-svelte/icons/trash";

import { Button } from "$lib/blocks/button";
import Editable from "$lib/blocks/editable/editable.svelte";
import type { DashboardGuild } from "$lib/types";

type EmbedFieldValue = DiscordEmbedWithRelations["fields"][number];

type Props = {
	field: EmbedFieldValue;
	onChange?: (field: EmbedFieldValue) => void;
	onDelete: () => void;
	guild: DashboardGuild;
};

let {
	field = {
		name: "",
		value: "",
		inline: false,
	},
	onChange,
	onDelete = () => {},
	guild,
}: Props = $props();

const updateField = (patch: Partial<EmbedFieldValue>) => {
	const nextField = { ...field, ...patch };

	field = nextField;
	onChange?.(nextField);
};
</script>

<div class="field" class:inline={field.inline}>
  <div class="stack space-2xs">
    <div class="cluster align-center space-2xs">
      <Editable
        type="text"
        class="fw:bold"
        value={field.name}
        onValueChange={(value) => updateField({ name: value })}
        placeholder="Field"
        {guild}
        maxLength={256}
        noEmojiPicker
      />
      <Button variant="icon-only" onclick={onDelete}>
        <TrashIcon size={12} />
      </Button>
      <Button
        variant="icon-only"
        onclick={() => updateField({ inline: !field.inline })}
      >
        {#if field.inline}
          <ArrowRightFromLineIcon size={12} />
        {:else}
          <ArrowDownFromLineIcon size={12} />
        {/if}
      </Button>
    </div>
    <Editable
      type="text"
      value={field.value}
      onValueChange={(value) => updateField({ value })}
      placeholder="Field Value"
      {guild}
      maxLength={1024}
      noEmojiPicker
    />
  </div>
</div>

<style>
  .field {
    display: contents;
    max-width: calc(33.33% - var(--space-s));
  }

  .field.inline > * {
    grid-column: span 1;
  }

  .field:not(.inline) {
    max-width: 100%;
  }

  @media (min-width: 768px) {
    .field:not(.inline) > * {
      grid-column: 1 / -1;
    }
  }
</style>
