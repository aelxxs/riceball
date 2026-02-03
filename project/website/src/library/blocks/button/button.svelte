<script lang="ts">
import type { WithElementRef } from "bits-ui";
import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";

export type ButtonVariant =
	| "default"
	| "destructive"
	| "outline"
	| "secondary"
	| "secondary-alt"
	| "ghost"
	| "link"
	| "icon-only";
export type ButtonSize = "default" | "sm" | "lg" | "icon" | "md";

export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
	WithElementRef<HTMLAnchorAttributes> & {
		variant?: ButtonVariant;
		size?: ButtonSize;
	};

let {
	class: className,
	variant = "default",
	size = "default",
	ref = $bindable(null),
	href = undefined,
	type = "button",
	children,
	...restProps
}: ButtonProps = $props();
</script>

{#if href}
  <a
    bind:this={ref}
    {href}
    data-variant={variant}
    data-size={size}
    {...restProps}
    class="button"
  >
    {@render children?.()}</a
  >
{:else}
  <button
    bind:this={ref}
    {type}
    data-variant={variant}
    data-size={size}
    class="button"
    {...restProps}
  >
    {@render children?.()}</button
  >
{/if}

<style>
  @layer base, button;

  @layer base {
    :root {
      --button-height: 100%;
      --button-padding-x: 1rem;
      --button-padding-y: 0.5rem;
      --button-border-radius: var(--border-radius);
    }
  }

  @layer button {
    .button {
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: var(--button-height);
      border-radius: var(--button-border-radius);
      border: 2px solid transparent;
      color: var(--txt-bold) !important;
      outline: 1px solid transparent;
      font-weight: 400 !important;
      padding: 0;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .button[data-variant="default"] {
      background: var(--gradient-primary);
      box-shadow: 0 2px 8px
        hsl(var(--theme-hue), var(--theme-saturation-high), 60%, 0.2);
    }

    .button[data-variant="default"]:hover {
      box-shadow: var(--shadow-glow-md);
      transform: translateY(-1px);
    }

    .button[data-variant="destructive"] {
      color: var(--clr-theme-error) !important;
      background-color: var(--clr-theme-error-transparent);
      border: 1px solid var(--clr-theme-error);
    }

    .button[data-variant="destructive"]:hover {
      background-color: var(--clr-theme-error);
      border-color: var(--clr-theme-error);
    }

    .button[data-variant="outline"] {
      background-color: transparent;
      border: var(--glass-border-strong);
    }

    .button[data-variant="outline"]:hover {
      background: var(--glass-bg-light);
      border: var(--glass-border-strong);
    }

    .button[data-variant="secondary"] {
      background: var(--glass-bg-light);
      border: var(--glass-border-light);
    }

    .button[data-variant="secondary"]:hover {
      background: var(--glass-bg-medium);
      border: var(--glass-border-medium);
    }

    .button[data-variant="secondary-alt"] {
      background-color: var(--clr-bg-input);
    }

    .button[data-variant="secondary-alt"]:hover {
      background: var(--gradient-primary);
    }

    .button[data-variant="ghost"] {
      background-color: transparent;
    }

    .button[data-variant="ghost"]:hover {
      background: var(--glass-bg-light);
    }

    .button[data-variant="link"] {
      background-color: transparent;
      text-underline-offset: 0.25rem;
    }

    .button[data-variant="link"]:hover {
      text-decoration: underline;
    }

    .button[data-variant="icon-only"] {
      background-color: transparent;
      padding: 0 !important;
      width: auto !important;
      height: auto !important;
    }

    .button[data-size="default"] {
      height: var(--button-height);
      padding: var(--button-padding-y) var(--button-padding-x);
    }

    .button[data-size="md"] {
      height: 2.5rem;
      padding-inline: var(--space-m);
    }

    .button[data-size="sm"] {
      height: 2.25rem;
      padding: 0.25rem 0.5rem;
    }

    .button[data-size="lg"] {
      height: 3rem;
      padding: 0.5rem 1.5rem;
    }

    .button[data-size="icon"] {
      height: 1.95rem;
      width: 1.95rem;
    }

    .button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .button:disabled:hover {
      border-radius: var(--button-border-radius);
    }

    .button:hover {
      border-radius: var(--radius-xs);
    }

    .button:focus-visible {
      border-color: var(--clr-bg-border-hover);
      box-shadow: 0 0 0 0.225rem hsl(var(--clr-bg-border-hover-hsl) / 0.05);
    }
  }
</style>
