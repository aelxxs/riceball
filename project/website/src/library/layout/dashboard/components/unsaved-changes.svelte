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
    z-index: 1;
    position: sticky;
    bottom: 1.25rem;
    margin-top: var(--space-xl);
    width: 90%;
    margin: 0 auto;
    transition: all 0.4s cubic-bezier(0.47, 1.64, 0.41, 0.8);
    background-color: var(--clr-bg-input-active);
  }

  .error {
    background-color: var(--clr-theme-error-transparent);
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
