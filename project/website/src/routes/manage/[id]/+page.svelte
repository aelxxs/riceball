<script lang="ts">
import type { SubmitFunction } from "@sveltejs/kit";
import { toast } from "svelte-sonner";
import { enhance } from "$app/forms";
import { Button } from "$lib/blocks/button";
import { PluginCard } from "$lib/blocks/plugin-card";
import { StatTile } from "$lib/blocks/stat-tile";
import { Switch } from "$lib/blocks/switch";
import { generateSidebarRoutes, WebsiteRoutes } from "$lib/constants";
import { getGuild } from "$lib/utility/context.svelte";
import type { PageProps } from "./$types";

const { data }: PageProps = $props();

const guild = getGuild();

type PluginKey = keyof typeof data.plugins;

const plugins = generateSidebarRoutes(guild.id).plugins;

let pending = $state<string | null>(null);
let resetKey = $state(0);

const stats = $derived(data.stats);

const starboardChannel = $derived(
	stats.starboardChannelId ? guild.channels.find((channel) => channel.id === stats.starboardChannelId) : undefined,
);

const starboardLabel = $derived(
	stats.starboardChannelId ? (starboardChannel?.name ? `#${starboardChannel.name}` : "Unknown channel") : "Not set",
);

const isUnconfigured = $derived(
	stats.membersWithExp === 0 && stats.reactionRoleMenus === 0 && stats.shopItems === 0 && !stats.starboardChannelId,
);

const isToggleable = (id?: string): id is PluginKey => !!id && id in data.plugins;

// Shop and Economy share the `economy` flag, so only the first card for a key gets the switch.
const switchOwners = new Map<string, string>();
for (const plugin of plugins) {
	if (plugin.id && !switchOwners.has(plugin.id)) switchOwners.set(plugin.id, plugin.name);
}

const firstSentence = (text: string) => {
	const end = text.indexOf(". ");
	return end === -1 ? text : text.slice(0, end + 1);
};

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

const statusFor = (name: string): string | undefined => {
	switch (name) {
		case "Leveling":
			return `${plural(stats.membersWithExp, "member")} with XP`;
		case "Shop":
			return `${plural(stats.shopItems, "active item")} · uses Economy switch`;
		case "Economy":
			return "Also powers the Shop";
		case "Starboard":
			return stats.starboardChannelId ? `Posting to ${starboardLabel}` : "No channel set";
		case "Reaction Roles":
			return `${plural(stats.reactionRoleMenus, "menu")} · toggled per menu`;
	}
};

const handleToggle: SubmitFunction = ({ formData }) => {
	pending = formData.get("pluginId")?.toString() ?? null;

	return async ({ result, update }) => {
		await update({ reset: false });
		pending = null;

		if (result.type === "failure" || result.type === "error") {
			resetKey++;
			const message = result.type === "failure" ? result.data?.message : undefined;
			toast.error(typeof message === "string" ? message : "Couldn't update the plugin.");
		}
	};
};
</script>

<div class="overview stack space-l">
  {#if isUnconfigured}
    <section class="empty stack space-s">
      <h2 class="fs:md">Nothing set up yet</h2>
      <p class="txt-muted">
        Leveling, Economy and Starboard are on by default, but there's no
        activity or configuration for this server yet. Pick a starboard channel,
        stock the shop, or create a reaction-role menu to get going.
      </p>
      <div class="cluster space-xs">
        <Button href={WebsiteRoutes.Starboard(guild.id)} variant="secondary">
          Set up Starboard
        </Button>
        <Button href={WebsiteRoutes.Shop(guild.id)} variant="secondary">
          Add shop items
        </Button>
        <Button href={WebsiteRoutes.ReactionRoles(guild.id)} variant="secondary">
          Create a reaction role
        </Button>
      </div>
    </section>
  {:else}
    <section class="stack space-s" aria-labelledby="overview-stats">
      <h2 id="overview-stats" class="fs:sm">At a glance</h2>
      <div class="grid stats">
        <StatTile
          label="Members with XP"
          value={stats.membersWithExp.toLocaleString()}
          href={`/manage/${guild.id}/leaderboard`}
        />
        <StatTile
          label="Reaction-role menus"
          value={stats.reactionRoleMenus.toLocaleString()}
          href={WebsiteRoutes.ReactionRoles(guild.id)}
        />
        <StatTile
          label="Active shop items"
          value={stats.shopItems.toLocaleString()}
          href={WebsiteRoutes.Shop(guild.id)}
        />
        <StatTile
          label="Starboard channel"
          value={starboardLabel}
          hint={!stats.starboardChannelId && data.plugins.stars.enabled
            ? "Enabled, but nothing will be posted"
            : undefined}
          href={WebsiteRoutes.Starboard(guild.id)}
        />
      </div>
    </section>
  {/if}

  <section class="stack space-s" aria-labelledby="overview-plugins">
    <h2 id="overview-plugins" class="fs:sm">Plugins</h2>
    <div class="grid plugins">
      {#each plugins as plugin (plugin.link)}
        <PluginCard
          name={plugin.name}
          description={firstSentence(plugin.extendedInfo.description)}
          href={plugin.link}
          icon={plugin.icon}
          status={statusFor(plugin.name)}
        >
          {#snippet control()}
            {#if isToggleable(plugin.id) && switchOwners.get(plugin.id) === plugin.name}
              {@const key = plugin.id}
              {@const enabled = data.plugins[key].enabled}
              <form
                method="POST"
                action={`/manage/${guild.id}?/togglePlugin`}
                use:enhance={handleToggle}
              >
                <input type="hidden" name="pluginId" value={key} />
                <input type="hidden" name="enabled" value={String(!enabled)} />
                <div class="cluster no-wrap space-xs">
                  <span class="fs:xs txt-muted">{enabled ? "On" : "Off"}</span>
                  {#key resetKey}
                    <Switch
                      type="submit"
                      checked={enabled}
                      disabled={pending === key}
                      aria-label={`${enabled ? "Disable" : "Enable"} ${plugin.name}`}
                    />
                  {/key}
                </div>
              </form>
            {:else if isToggleable(plugin.id)}
              <span class="fs:xs txt-muted">
                {data.plugins[plugin.id].enabled ? "On" : "Off"}
              </span>
            {/if}
          {/snippet}
        </PluginCard>
      {/each}
    </div>
  </section>
</div>

<style>
  .overview {
    max-width: 75rem;
  }

  .stats {
    --minimum: 12rem;
  }

  .plugins {
    --minimum: 18rem;
  }

  .empty {
    padding: var(--space-m);
    border-radius: var(--border-radius);
    background-color: var(--glass-bg-subtle);
    border: var(--glass-border-subtle);
  }
</style>
