<script lang="ts">
  import XIcon from "lucide-svelte/icons/x";

  import { AlertDialog, type WithoutChild } from "bits-ui";
  import type { Snippet } from "svelte";
  import Button from "../button/button.svelte";

  type Props = AlertDialog.RootProps & {
    button: Snippet | string;
    title: Snippet | string;
    description: Snippet | string;
    onConfirm: () => void;
    contentProps?: WithoutChild<AlertDialog.ContentProps>;
  };

  let {
    open = $bindable(false),
    children,
    button,
    contentProps,
    onConfirm,
    title,
    description,
    ...restProps
  }: Props = $props();
</script>

<AlertDialog.Root bind:open {...restProps}>
  <AlertDialog.Trigger>
    {#snippet child({ props })}
      {#if typeof button === "string"}
        <Button {...props}>{button}</Button>
      {:else}
        <div {...props}>
          {@render button()}
        </div>
      {/if}
    {/snippet}
  </AlertDialog.Trigger>
  <AlertDialog.Portal>
    <AlertDialog.Overlay />
    <AlertDialog.Content {...contentProps}>
      {#snippet child({ props })}
        <div {...props} class="box stack space-l content">
          <div>
            <div class="stack">
              <AlertDialog.Title>
                {#if typeof title === "string"}
                  <div class="repel align-start">
                    <h4>{title}</h4>
                    <Button variant="icon-only" onclick={() => (open = false)}>
                      <XIcon size={16} />
                    </Button>
                  </div>
                {:else}
                  {@render title()}
                {/if}
              </AlertDialog.Title>
              <AlertDialog.Description>
                {#if typeof description === "string"}
                  {description}
                {:else}
                  {@render description()}
                {/if}
              </AlertDialog.Description>
            </div>
          </div>
          {@render children?.()}
          <div>
            <div class="cluster no-wrap align-end">
              <AlertDialog.Cancel>
                {#snippet child({ props })}
                  <Button {...props} variant="secondary">Cancel</Button>
                {/snippet}
              </AlertDialog.Cancel>
              <AlertDialog.Action onclick={onConfirm}>
                {#snippet child({ props })}
                  <Button {...props} variant="destructive">Confirm</Button>
                {/snippet}
              </AlertDialog.Action>
            </div>
          </div>
        </div>
      {/snippet}
    </AlertDialog.Content>
  </AlertDialog.Portal>
</AlertDialog.Root>

<style>
  .content {
    --padding: var(--space-m);
    --space: var(--space-l);
    position: fixed;
    left: 50%;
    top: 50%;
    z-index: 50;
    width: clamp(20rem, 35rem, calc(100% - var(--padding) * 2));
    transform: translate(-50%, -50%);
  }

  :global {
    [data-alert-dialog-overlay] {
      position: fixed;
      inset: 0;
      z-index: 50;
      background-color: var(--clr-bg-translucent);
      backdrop-filter: blur(0.15rem);
    }

    [data-alert-dialog-overlay][data-state="open"] {
      animation: fadeIn 0.3s ease-out;
    }

    [data-alert-dialog-overlay][data-state="closed"] {
      animation: fadeOut 0.3s ease-in;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes fadeOut {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }

    [data-alert-dialog-content][data-state="open"] {
      animation:
        fadeIn 0.1s ease-out,
        zoomIn 0.1s ease-out;
    }

    [data-alert-dialog-content][data-state="closed"] {
      animation:
        fadeOut 0.1s ease-in,
        zoomOut 0.1s ease-in;
    }

    @keyframes zoomIn {
      from {
        transform: translate(-50%, -50%) scale(0.95);
      }
      to {
        transform: translate(-50%, -50%) scale(1);
      }
    }

    @keyframes zoomOut {
      from {
        transform: translate(-50%, -50%) scale(1);
      }
      to {
        transform: translate(-50%, -50%) scale(0.95);
      }
    }
  }
</style>
