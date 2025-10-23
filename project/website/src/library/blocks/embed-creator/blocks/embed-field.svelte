<script lang="ts">
// - Icons

import type { APIEmbedField } from "discord-api-types/v10";
import ArrowDownFromLineIcon from "lucide-svelte/icons/arrow-down-from-line";
import ArrowRightFromLineIcon from "lucide-svelte/icons/arrow-right-from-line";
import TrashIcon from "lucide-svelte/icons/trash";

import { Button } from "$lib/blocks/button";
import Editable from "$lib/blocks/editable/editable.svelte";
import type { DashboardGuild } from "$lib/types";

type Props = {
	field: APIEmbedField;
	onDelete: () => void;
	onToggleInline: () => void;
	guild: DashboardGuild;
};

const {
	field = $bindable<APIEmbedField>({
		name: "",
		value: "",
		inline: false,
	}),
	onDelete = $bindable(() => {}),
	onToggleInline = $bindable(() => {}),
	guild,
}: Props = $props();
</script>

<div class="field" class:inline={field.inline}>
  <div class="stack space-2xs">
    <div class="cluster align-center space-2xs">
      <Editable
        type="text"
        class="fw:bold"
        bind:value={field.name}
        placeholder="Field"
        {guild}
        maxLength={256}
        noEmojiPicker
      />
      <Button variant="icon-only" onclick={onDelete}>
        <TrashIcon size={12} />
      </Button>
      <Button variant="icon-only" onclick={onToggleInline}>
        {#if field.inline}
          <ArrowRightFromLineIcon size={12} />
        {:else}
          <ArrowDownFromLineIcon size={12} />
        {/if}
      </Button>
    </div>
    <Editable
      type="text"
      bind:value={field.value}
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
