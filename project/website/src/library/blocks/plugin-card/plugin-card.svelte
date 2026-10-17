<script lang="ts">
import type { Icon as IconType } from "lucide-svelte";
import ArrowRightIcon from "lucide-svelte/icons/arrow-right";
import type { Snippet } from "svelte";

type Props = {
	name: string;
	description: string;
	href: string;
	icon: typeof IconType;
	status?: string;
	control?: Snippet;
};

const { name, description, href, icon: Icon, status, control }: Props = $props();
</script>

<article class="plugin-card stack space-s">
  <div class="repel align-start">
    <div class="cluster no-wrap space-xs">
      <span class="icon"><Icon size={18} /></span>
      <h3 class="fs:sm">{name}</h3>
    </div>
    {@render control?.()}
  </div>
  <p class="description txt-muted">{description}</p>
  <div class="repel footer">
    <span class="fs:xs txt-muted">{status ?? ""}</span>
    <a {href} class="cluster no-wrap space-2xs fs:xs">
      Configure <ArrowRightIcon size={14} />
    </a>
  </div>
</article>

<style>
  .plugin-card {
    padding: var(--space-m);
    border-radius: var(--border-radius);
    background-color: var(--glass-bg-subtle);
    border: var(--glass-border-subtle);
    transition: border-color 0.2s ease;
  }

  .plugin-card:hover {
    border: var(--glass-border-light);
  }

  .icon {
    display: inline-flex;
    padding: var(--space-2xs);
    border-radius: var(--border-radius);
    background-color: var(--clr-bg-input);
    color: var(--txt-bold);
  }

  .description {
    flex-grow: 1;
  }

  .footer {
    padding-block-start: var(--space-xs);
    border-top: var(--glass-border-subtle);
  }

  a {
    color: var(--txt-main);
    font-weight: 500;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  a:hover {
    color: var(--clr-primary);
  }
</style>
