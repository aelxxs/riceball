<script lang="ts">
import LoaderCircleIcon from "lucide-svelte/icons/loader-circle";

import { Button } from "$lib/blocks/button";
import { saveModal, shake } from "$lib/utility/context.svelte";
import { flyAndScale } from "$lib/utility/transitions";
</script>

<div
  class="box unsaved-changes"
  class:error={shake.shake}
  transition:flyAndScale={{ y: 50 }}
>
  <div class="repel">
    <p class="fw:md">Careful — you have unsaved changes!</p>
    <div class="cluster">
      <Button onclick={saveModal.undo} type="submit" variant="ghost">
        <span>Reset</span>
      </Button>
      <Button onclick={saveModal.save} type="submit">
        <div class="cluster space-2xs">
          {#if saveModal.delayed}
            <LoaderCircleIcon class="loader" size={18} />
          {/if}
          <span>Save Changes</span>
        </div>
      </Button>
    </div>
  </div>
</div>

<style>
  :global(.loader) {
    animation: spin 1s linear infinite;
  }

  .unsaved-changes {
    z-index: 10;
    position: sticky;
    bottom: 1.25rem;
    width: 90%;
    max-width: 1200px;
    margin-inline: auto;
    transition: all 0.4s cubic-bezier(0.47, 1.64, 0.41, 0.8);
    background: linear-gradient(
      135deg,
      hsl(var(--theme-hue), var(--theme-saturation-high), 60%, 0.15),
      hsl(var(--theme-hue-accent), var(--theme-saturation-high), 65%, 0.1)
    );
    backdrop-filter: blur(12px);
    border: 1.5px solid
      hsl(var(--theme-hue), var(--theme-saturation-high), 60%, 0.35);
    box-shadow:
      0 8px 32px hsl(var(--theme-hue), var(--theme-saturation-high), 60%, 0.2),
      0 4px 16px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 hsl(var(--theme-hue), var(--theme-saturation), 95%, 0.1);
    overflow: hidden;
  }

  .unsaved-changes::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent,
      hsl(var(--theme-hue), var(--theme-saturation-high), 60%, 0.8),
      transparent
    );
    animation: shimmer 2s infinite;
  }

  .error {
    background: linear-gradient(
      135deg,
      var(--clr-theme-error),
      var(--clr-theme-error-transparent)
    );
    border-color: var(--clr-theme-error);
    box-shadow:
      0 8px 32px var(--clr-theme-error),
      0 4px 16px rgba(0, 0, 0, 0.15);
    animation: pulse-error 0.5s ease-in-out;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes shimmer {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }

  @keyframes pulse-error {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.02);
    }
  }
</style>
