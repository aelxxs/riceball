<script lang="ts">
import { Award, X as CloseIcon, Mail, User as UserIcon } from "lucide-svelte";
import { fade, fly } from "svelte/transition";
import { enhance } from "$app/forms";
import { DashboardCard } from "$lib/blocks/dashboard-card";
import { DiscordIcon } from "$lib/blocks/discord-icon";
import { LevelingCardPreview } from "$lib/blocks/leveling-card-preview";
import type { PageData } from "./$types";

const { data }: { data: PageData } = $props();

let editingGuild: any = $state(null);
let showModal = $state(false);

// Level calculation helpers (matching backend logic)
function expReq(level: number): number {
	return 50 * level ** 2;
}

function getLvl(xp: number): number {
	let expRemaining = xp;
	let level = 1;
	while (expRemaining >= expReq(level)) {
		expRemaining -= expReq(level);
		xp;
		level++;
	}
	return level;
}

function getProgress(xp: number): number {
	let expRemaining = xp;
	let level = 1;
	while (expRemaining >= expReq(level)) {
		expRemaining -= expReq(level);
		level++;
	}
	return expRemaining;
}

// Calculate levels for each guild
const guildsWithLevels = $derived(
	data.guilds.map((guild: any) => {
		const level = getLvl(guild.exp);
		const currentExp = getProgress(guild.exp);
		const maxExp = expReq(level);
		return {
			...guild,
			level,
			currentExp,
			maxExp,
		};
	}),
);
</script>

<svelte:head>
  <title>Profile | Riceball</title>
</svelte:head>

<div class="profile-page">
  <!-- Animated Background -->
  <div class="background">
    <div class="gradient-orb orb-1"></div>
    <div class="gradient-orb orb-2"></div>
    <div class="grid"></div>
  </div>

  <div class="content stack space-l">
    <!-- Profile Header -->
    <section class="profile-header" in:fade={{ duration: 400 }}>
      <div class="profile-card box">
        <div class="profile-info">
          <div class="avatar-container" in:fly={{ y: 20, duration: 600 }}>
            {#if data.user.image}
              <img src={data.user.image} alt={data.user.name} class="avatar" />
            {:else}
              <div class="avatar-placeholder">
                <UserIcon size={64} />
              </div>
            {/if}
          </div>
          <div
            class="user-details"
            in:fly={{ y: 20, duration: 600, delay: 100 }}
          >
            <h1 class="username">{data.user.name}</h1>
            {#if data.user.email}
              <div class="email">
                <Mail size={16} />
                <span>{data.user.email}</span>
              </div>
            {/if}
            {#if data.userSettings.bio}
              <p class="bio">{data.userSettings.bio}</p>
            {/if}
          </div>
        </div>

        <div class="stats-grid" in:fly={{ y: 20, duration: 600, delay: 200 }}>
          <div class="stat-card">
            <div class="stat-icon">
              <Award size={24} />
            </div>
            <div class="stat-info">
              <p class="stat-value">
                {data.userSettings.reputation.toLocaleString()}
              </p>
              <p class="stat-label">Reputation</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <UserIcon size={24} />
            </div>
            <div class="stat-info">
              <p class="stat-value">{data.guilds.length}</p>
              <p class="stat-label">Servers</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Server Rank Cards -->
    <section class="rank-cards" in:fade={{ duration: 400, delay: 300 }}>
      <h2 class="section-title">Your Rank Cards</h2>
      <p class="section-description">
        View and customize your rank cards across all servers
      </p>

      <div class="cards-grid">
        {#each guildsWithLevels as guild, index}
          <div
            class="guild-card"
            in:fly={{ y: 30, duration: 500, delay: 100 * index }}
          >
            <DashboardCard
              title={guild.name}
              description={`Level ${guild.level} • ${guild.currentExp.toLocaleString()}/${guild.maxExp.toLocaleString()} XP`}
            >
              <div class="card-content stack space-m">
                <div class="guild-header cluster space-s">
                  <DiscordIcon
                    type="guild"
                    id={guild.id}
                    icon={guild.icon}
                    name={guild.name}
                    size={4}
                  />
                  <div>
                    <p class="guild-name">{guild.name}</p>
                    <p class="guild-level">Level {guild.level}</p>
                  </div>
                </div>

                <div class="card-preview">
                  <LevelingCardPreview
                    card={guild.card}
                    user={{
                      username: data.user.name || "User",
                      greeting: data.userSettings.bio || "Hello!",
                      level: guild.level,
                      curExp: guild.currentExp,
                      maxExp: guild.maxExp,
                      reputation: data.userSettings.reputation,
                      rank: 1,
                      badges: [],
                    }}
                  />
                </div>

                <div class="card-actions">
                  {#if guild.guildSettings?.allowCustomRankCard !== false}
                    <button
                      class="button button-primary"
                      type="button"
                      onclick={() => {
                        editingGuild = guild;
                        showModal = true;
                      }}
                    >
                      Edit Card
                    </button>
                  {:else}
                    <p class="lock-note">
                      Server has disabled custom cards for members.
                    </p>
                  {/if}
                </div>
              </div>
            </DashboardCard>
          </div>
        {/each}

        {#if guildsWithLevels.length === 0}
          <div class="empty-state" in:fade={{ duration: 400 }}>
            <div class="empty-icon">
              <UserIcon size={48} />
            </div>
            <h3>No Servers Found</h3>
            <p>You haven't joined any servers with Riceball yet.</p>
          </div>
        {/if}
      </div>
    </section>
  </div>
</div>

{#if showModal && editingGuild}
  <div class="modal-backdrop" role="dialog" aria-modal="true">
    <div class="modal">
      <div class="modal-header">
        <h3>Edit Card — {editingGuild.name}</h3>
        <button
          class="icon-btn"
          type="button"
          aria-label="Close"
          onclick={() => {
            showModal = false;
            editingGuild = null;
          }}
        >
          <CloseIcon size={18} />
        </button>
      </div>
      <div class="modal-body">
        {#if editingGuild.guildSettings?.allowCustomRankCard === false}
          <p class="txt-muted">
            This server has disabled custom rank cards for members.
          </p>
          <div class="cluster justify-end">
            <button
              type="button"
              class="button"
              onclick={() => {
                showModal = false;
                editingGuild = null;
              }}
            >
              Close
            </button>
          </div>
        {:else}
          <form method="POST" action="?/updateCard" class="stack space-m">
            <input type="hidden" name="guildId" value={editingGuild.id} />
            <input type="hidden" name="name" value={editingGuild.card.name} />
            <!-- Keep existing colors unless changed -->
            {#if editingGuild.card.wrapperColor}
              <input
                type="hidden"
                name="wrapperColor.h"
                value={editingGuild.card.wrapperColor.h}
              />
              <input
                type="hidden"
                name="wrapperColor.s"
                value={editingGuild.card.wrapperColor.s}
              />
              <input
                type="hidden"
                name="wrapperColor.l"
                value={editingGuild.card.wrapperColor.l}
              />
              <input
                type="hidden"
                name="wrapperColor.a"
                value={editingGuild.card.wrapperColor.a}
              />
            {/if}
            {#if editingGuild.card.overlayColor}
              <input
                type="hidden"
                name="overlayColor.h"
                value={editingGuild.card.overlayColor.h}
              />
              <input
                type="hidden"
                name="overlayColor.s"
                value={editingGuild.card.overlayColor.s}
              />
              <input
                type="hidden"
                name="overlayColor.l"
                value={editingGuild.card.overlayColor.l}
              />
              <input
                type="hidden"
                name="overlayColor.a"
                value={editingGuild.card.overlayColor.a}
              />
            {/if}
            {#if editingGuild.card.overlayAccentColor}
              <input
                type="hidden"
                name="overlayAccentColor.h"
                value={editingGuild.card.overlayAccentColor.h}
              />
              <input
                type="hidden"
                name="overlayAccentColor.s"
                value={editingGuild.card.overlayAccentColor.s}
              />
              <input
                type="hidden"
                name="overlayAccentColor.l"
                value={editingGuild.card.overlayAccentColor.l}
              />
              <input
                type="hidden"
                name="overlayAccentColor.a"
                value={editingGuild.card.overlayAccentColor.a}
              />
            {/if}
            {#if editingGuild.card.progressBarColor}
              <input
                type="hidden"
                name="progressBarColor.h"
                value={editingGuild.card.progressBarColor.h}
              />
              <input
                type="hidden"
                name="progressBarColor.s"
                value={editingGuild.card.progressBarColor.s}
              />
              <input
                type="hidden"
                name="progressBarColor.l"
                value={editingGuild.card.progressBarColor.l}
              />
              <input
                type="hidden"
                name="progressBarColor.a"
                value={editingGuild.card.progressBarColor.a}
              />
            {/if}
            {#if editingGuild.card.textColor}
              <input
                type="hidden"
                name="textColor.h"
                value={editingGuild.card.textColor.h}
              />
              <input
                type="hidden"
                name="textColor.s"
                value={editingGuild.card.textColor.s}
              />
              <input
                type="hidden"
                name="textColor.l"
                value={editingGuild.card.textColor.l}
              />
              <input
                type="hidden"
                name="textColor.a"
                value={editingGuild.card.textColor.a}
              />
            {/if}
            {#if editingGuild.card.subtextColor}
              <input
                type="hidden"
                name="subtextColor.h"
                value={editingGuild.card.subtextColor.h}
              />
              <input
                type="hidden"
                name="subtextColor.s"
                value={editingGuild.card.subtextColor.s}
              />
              <input
                type="hidden"
                name="subtextColor.l"
                value={editingGuild.card.subtextColor.l}
              />
              <input
                type="hidden"
                name="subtextColor.a"
                value={editingGuild.card.subtextColor.a}
              />
            {/if}

            <label class="stack">
              <span class="label">Font family</span>
              <select name="fontFamily" value={editingGuild.card.fontFamily}>
                <option value="SANS_SERIF">Sans-serif</option>
                <option value="SERIF">Serif</option>
                <option value="MONOSPACE">Monospace</option>
                <option value="HANDWRITTEN">Handwritten</option>
                <option value="CURSIVE">Cursive</option>
              </select>
            </label>

            <label class="stack">
              <span class="label">Border radius</span>
              <input
                type="range"
                name="borderRadius"
                min="0"
                max="30"
                step="1"
                value={editingGuild.card.borderRadius ?? 10}
              />
            </label>

            <label class="stack">
              <span class="label">Background image URL</span>
              <input
                type="url"
                name="wrapperImage"
                placeholder="https://..."
                value={editingGuild.card.wrapperImage ?? ""}
              />
            </label>

            <div class="cluster space-s justify-end">
              <button
                type="button"
                class="button"
                onclick={() => {
                  showModal = false;
                  editingGuild = null;
                }}
              >
                Cancel
              </button>
              <button type="submit" class="button button-primary">
                Save changes
              </button>
            </div>
          </form>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .profile-page {
    position: relative;
    min-height: 100vh;
    padding: var(--space-xl) var(--space-m);
  }

  .background {
    position: fixed;
    inset: 0;
    z-index: -1;
    overflow: hidden;

    .gradient-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.3;
      animation: float 20s infinite ease-in-out;

      &.orb-1 {
        width: 500px;
        height: 500px;
        background: radial-gradient(
          circle,
          hsl(var(--theme-hue), var(--theme-saturation-high), 60%, 0.4),
          transparent
        );
        top: -10%;
        left: -10%;
        animation-delay: 0s;
      }

      &.orb-2 {
        width: 400px;
        height: 400px;
        background: radial-gradient(
          circle,
          rgba(var(--color-accent), 0.3),
          transparent
        );
        bottom: -10%;
        right: -10%;
        animation-delay: 10s;
      }
    }

    .grid {
      position: absolute;
      inset: 0;
      background-image: var(--grid-pattern);
      background-size: 50px 50px;
      mask-image: radial-gradient(
        ellipse at center,
        black 20%,
        transparent 80%
      );
    }
  }

  @keyframes float {
    0%,
    100% {
      transform: translate(0, 0) scale(1);
    }
    50% {
      transform: translate(50px, 50px) scale(1.1);
    }
  }

  .content {
    max-width: 1400px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  .profile-header {
    margin-bottom: var(--space-xl);
  }

  .profile-card {
    background: linear-gradient(
      135deg,
      var(--glass-bg-light),
      var(--glass-bg-subtle)
    );
    border: var(--glass-border-light);
    border-radius: var(--radius-l);
    padding: var(--space-xl);
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }

  .profile-info {
    display: flex;
    gap: var(--space-l);
    align-items: flex-start;
    margin-bottom: var(--space-l);
    flex-wrap: wrap;

    @media (max-width: 640px) {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
  }

  .avatar-container {
    position: relative;

    &::after {
      content: "";
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      background: linear-gradient(
        45deg,
        hsl(var(--theme-hue), var(--theme-saturation-high), 60%, 0.5),
        rgba(var(--color-accent), 0.5)
      );
      z-index: -1;
      animation: pulse 2s infinite;
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.5;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.05);
    }
  }

  .avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid
      hsl(var(--theme-hue), var(--theme-saturation-high), 60%, 0.3);
  }

  .avatar-placeholder {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: linear-gradient(
      135deg,
      hsl(var(--theme-hue), var(--theme-saturation-high), 60%, 0.2),
      rgba(var(--color-accent), 0.2)
    );
    display: flex;
    align-items: center;
    justify-content: center;
    color: hsl(var(--theme-hue), var(--theme-saturation-high), 60%, 0.8);
  }

  .user-details {
    flex: 1;
    min-width: 0;
  }

  .username {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: var(--space-xs);
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .email {
    display: flex;
    align-items: center;
    gap: var(--space-2xs);
    color: var(--txt-muted);
    margin-bottom: var(--space-s);
    font-size: 0.9rem;

    @media (max-width: 640px) {
      justify-content: center;
    }
  }

  .bio {
    color: var(--txt-muted);
    line-height: 1.6;
    max-width: 600px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-m);
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: var(--space-m);
    padding: var(--space-m);
    background: var(--glass-bg-subtle);
    border: var(--glass-border-medium);
    border-radius: var(--radius-m);
    transition: all 0.3s ease;

    &:hover {
      background: var(--glass-bg-light);
      border: var(--glass-border-medium);
      transform: translateY(-2px);
    }
  }

  .stat-icon {
    padding: var(--space-s);
    background: linear-gradient(
      135deg,
      hsl(var(--theme-hue), var(--theme-saturation-high), 60%, 0.2),
      rgba(var(--color-accent), 0.2)
    );
    border-radius: var(--radius-m);
    color: hsl(var(--theme-hue), var(--theme-saturation-high), 60%, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-info {
    flex: 1;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--txt-main);
    line-height: 1;
    margin-bottom: var(--space-2xs);
  }

  .stat-label {
    font-size: 0.85rem;
    color: var(--txt-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .rank-cards {
    .section-title {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: var(--space-xs);
      color: var(--txt-main);
    }

    .section-description {
      color: var(--txt-muted);
      margin-bottom: var(--space-l);
    }
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
    gap: var(--space-m);

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }

  .guild-card {
    width: 100%;
  }

  .card-content {
    padding: var(--space-s);
  }

  .guild-header {
    align-items: center;
  }

  .guild-name {
    font-weight: 600;
    color: var(--txt-main);
    font-size: 1.1rem;
  }

  .guild-level {
    color: var(--txt-muted);
    font-size: 0.9rem;
  }

  .card-preview {
    width: 100%;
    margin: var(--space-m) 0;
  }

  .card-actions {
    display: flex;
    gap: var(--space-s);
    justify-content: flex-end;
  }

  .lock-note {
    color: var(--txt-muted);
    font-size: 0.9rem;
    text-align: right;
  }

  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-s) var(--space-m);
    border-radius: var(--radius-m);
    font-weight: 600;
    font-size: 0.9rem;
    text-decoration: none;
    transition: all 0.2s ease;
    cursor: pointer;
    border: none;

    &.button-primary {
      background: linear-gradient(
        135deg,
        hsl(var(--theme-hue), var(--theme-saturation-high), 60%, 0.8),
        rgba(var(--color-accent), 0.8)
      );
      color: white;

      &:hover {
        background: linear-gradient(
          135deg,
          hsl(var(--theme-hue), var(--theme-saturation-high), 60%, 1),
          rgba(var(--color-accent), 1)
        );
        transform: translateY(-2px);
        box-shadow: 0 4px 12px
          hsl(var(--theme-hue), var(--theme-saturation-high), 60%, 0.4);
      }
    }
  }

  .button-secondary {
    background: var(--glass-bg-light);
    color: var(--txt-main);
    border: var(--glass-border-medium);
  }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: grid;
    place-items: center;
    z-index: 999;
    padding: var(--space-m);
  }

  .modal {
    background: var(--clr-bg);
    border-radius: var(--radius-l);
    border: var(--glass-border-light);
    min-width: min(720px, 100%);
    max-width: 900px;
    box-shadow: 0 20px 80px rgba(0, 0, 0, 0.35);
    padding: var(--space-l);
    backdrop-filter: blur(10px);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-m);
    margin-bottom: var(--space-m);
  }

  .modal-body form {
    margin: 0;
  }

  .label {
    font-weight: 600;
    color: var(--txt-main);
  }

  .icon-btn {
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--txt-muted);
    padding: var(--space-2xs);
    border-radius: var(--radius-s);

    &:hover {
      background: hsl(var(--theme-hue), var(--theme-saturation), 95%, 0.08);
    }
  }

  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: var(--space-2xl);
    background: linear-gradient(
      135deg,
      var(--glass-bg-subtle),
      var(--glass-bg-subtle)
    );
    border: var(--glass-border-medium);
    border-radius: var(--radius-l);

    .empty-icon {
      display: inline-flex;
      padding: var(--space-l);
      background: var(--glass-bg-light);
      border-radius: 50%;
      color: hsl(var(--theme-hue), var(--theme-saturation-high), 60%, 0.6);
      margin-bottom: var(--space-m);
    }

    h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: var(--space-xs);
      color: var(--txt-main);
    }

    p {
      color: var(--txt-muted);
    }
  }
</style>
