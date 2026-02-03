<script lang="ts">
import { fade, fly, scale } from "svelte/transition";
import type { PageData } from "./$types";

// Guard against missing data so the page still renders when the load fails.
const { leaderboard = [], guildId = "Unknown Guild" }: PageData = $props();

// Local mock fallback for cases where the server returns an empty array.
const demoUserId = "406665840088317962";
const mockLeaderboard = [
	{
		rank: 1,
		userId: demoUserId,
		name: "alexis",
		avatar: `https://cdn.discordapp.com/embed/avatars/${Number(demoUserId) % 5}.png`,
		exp: 1800,
		level: 6,
	},
	...Array.from({ length: 11 }).map((_, idx) => {
		const userId = `1000000000000${idx + 1}`;
		const exp = 1400 - idx * 90;
		return {
			rank: idx + 2,
			userId,
			name: `User ${userId.slice(-4)}`,
			avatar: `https://cdn.discordapp.com/embed/avatars/${Number(userId) % 5}.png`,
			exp,
			level: Math.floor((exp / 50) ** 0.5) + 1,
		};
	}),
].flat();

const display = leaderboard.length ? leaderboard : mockLeaderboard;

const topThree = display.slice(0, 3);

const stats = [
	{
		title: "Top EXP",
		value: display[0]?.exp ?? 0,
		desc: "Highest total experience",
	},
	{
		title: "Top Level",
		value: display[0]?.level ?? 0,
		desc: "Highest level achieved",
	},
	{
		title: "Players Tracked",
		value: display.length,
		desc: "Members with recorded EXP",
	},
];

const formatNumber = (n: number) => n.toLocaleString();
</script>

<div class="page">
  <div class="background">
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>
    <div class="grid"></div>
  </div>

  <section class="hero" in:fade={{ duration: 400 }}>
    <div class="hero-text" in:fly={{ y: 20, duration: 600 }}>
      <p class="eyebrow">Server Leaderboard</p>
      <h1>
        <span class="gradient">Champions</span> of {guildId}
      </h1>
      <p class="sub">
        Celebrate your top members with a live, gorgeous leaderboard.
      </p>
      <div class="badge">Live • Auto-updated</div>
    </div>
  </section>

  <section class="stats" in:fade={{ delay: 100, duration: 400 }}>
    {#each stats as stat, i}
      <div class="stat" in:fly={{ y: 20, delay: 100 + i * 80 }}>
        <p class="label">{stat.title}</p>
        <p class="value">{formatNumber(stat.value)}</p>
        <p class="desc">{stat.desc}</p>
      </div>
    {/each}
  </section>

  <section class="podium">
    <div class="podium-card" in:fly={{ y: 30, duration: 500 }}>
      <div class="shine"></div>
      <p class="label">Top 3</p>
      <div class="podium-grid">
        {#each topThree as user, idx}
          <div
            class={`podium-item rank-${idx + 1}`}
            in:scale={{ duration: 400, start: 0.8 }}
          >
            <div
              class="avatar"
              style={`background-image: url(${user.avatar})`}
            ></div>
            <div class="info">
              <p class="name">{user.name}</p>
              <p class="meta">
                Level {user.level} • {formatNumber(user.exp)} XP
              </p>
            </div>
            <div class="rank">#{user.rank}</div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <section class="board" in:fade={{ duration: 400 }}>
    <div class="board-frame">
      <div class="board-head">
        <div>
          <p class="eyebrow mini">Live standings</p>
          <h3>Server Ranking</h3>
        </div>
        <div class="legend">
          <span class="pill hot">Top 3</span>
          <span class="pill ghost">Live</span>
        </div>
      </div>

      <div class="table">
        <div class="row head">
          <span>#</span>
          <span>Player</span>
          <span>Level</span>
          <span>XP</span>
        </div>
        {#if display.length === 0}
          <div class="row empty">
            <span>—</span>
            <span>No leaderboard data yet</span>
            <span>—</span>
            <span>—</span>
          </div>
        {:else}
          {#each display as user, idx}
            <div class="row" class:top={idx < 3}>
              <span class="rank">{user.rank}</span>
              <div class="player">
                <div
                  class="avatar"
                  style={`background-image: url(${user.avatar})`}
                ></div>
                <div>
                  <p class="name">{user.name}</p>
                  <p class="subtle">ID: {user.userId}</p>
                </div>
              </div>
              <span class="level">{user.level}</span>
              <span class="xp">{formatNumber(user.exp)}</span>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </section>
</div>

<style lang="scss">
  .page {
    position: relative;
    min-height: 100vh;
    padding: clamp(1.5rem, 3vw, 2.5rem);
    color: #e5e7eb;
    overflow: hidden;
  }

  .background {
    position: fixed;
    inset: 0;
    z-index: 0;
    overflow: hidden;
  }

  .grid {
    position: absolute;
    inset: 0;
    background-image: var(--grid-pattern);
    background-size: 80px 80px;
    opacity: 0.5;
    animation: drift 18s linear infinite;
  }

  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(120px);
    opacity: 0.35;
    animation: float 20s ease-in-out infinite;
  }

  .orb-1 {
    width: 520px;
    height: 520px;
    background: var(--gradient-orb-primary);
    top: -200px;
    left: -120px;
  }

  .orb-2 {
    width: 420px;
    height: 420px;
    background: var(--gradient-orb-secondary);
    bottom: -160px;
    right: -80px;
    animation-delay: -8s;
  }

  .orb-3 {
    width: 380px;
    height: 380px;
    background: var(--gradient-orb-accent);
    top: 30%;
    right: 15%;
    animation-delay: -4s;
  }

  .hero {
    position: relative;
    z-index: 1;
    margin-bottom: clamp(1rem, 4vw, 2.5rem);
  }

  .hero-text h1 {
    font-size: clamp(2.4rem, 6vw, 3.6rem);
    line-height: 1.1;
    margin: 0.35rem 0;
  }

  .hero-text .gradient {
    background: var(--gradient-hero);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-size: 200% 200%;
    animation: gradient 6s ease infinite;
  }

  .hero-text .sub {
    color: var(--clr-neutral);
    max-width: 48ch;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border-radius: 999px;
    background: var(--glass-bg-medium);
    border: var(--glass-border-medium);
    font-weight: 600;
    margin-top: 0.75rem;
    color: #c7d2fe;
  }

  .eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.2em;
    font-size: 0.85rem;
    color: #c7d2fe;
    margin: 0;
  }

  .stats {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: var(--space-m);
    margin-bottom: clamp(1rem, 4vw, 2.5rem);
  }

  .stat {
    background: hsl(var(--theme-hue), var(--theme-saturation), 10%, 0.7);
    border: var(--glass-border-light);
    border-radius: var(--radius-m);
    padding: var(--space-m);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  }

  .stat .label {
    color: var(--clr-neutral);
    margin-bottom: 6px;
  }

  .stat .value {
    font-size: 1.8rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
  }

  .stat .desc {
    color: #a5b4fc;
    margin: 6px 0 0;
  }

  .podium {
    position: relative;
    z-index: 1;
    margin-bottom: clamp(1rem, 4vw, 2.5rem);
  }

  .podium-card {
    position: relative;
    padding: clamp(1.25rem, 3vw, 2rem);
    border-radius: var(--radius-l);
    background: linear-gradient(
      135deg,
      hsl(var(--theme-hue), var(--theme-saturation-high), 60%, 0.12),
      hsl(var(--theme-hue-secondary), var(--theme-saturation-high), 70%, 0.08)
    );
    border: var(--glass-border-medium);
    overflow: hidden;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
  }

  .podium-card .shine {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at 30% 20%,
      hsl(var(--theme-hue), var(--theme-saturation), 95%, 0.2),
      transparent 35%
    );
    pointer-events: none;
  }

  .podium-card .label {
    color: var(--clr-neutral);
    margin-bottom: 12px;
    font-weight: 600;
  }

  .podium-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-m);
    position: relative;
    z-index: 1;
  }

  .podium-item {
    background: hsl(var(--theme-hue), var(--theme-saturation), 10%, 0.6);
    border: var(--glass-border-medium);
    border-radius: var(--radius-m);
    padding: var(--space-m);
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: var(--space-s);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
  }

  .podium-item .avatar {
    width: 64px;
    height: 64px;
    border-radius: 18px;
    background-size: cover;
    background-position: center;
    border: 2px solid hsl(var(--theme-hue), var(--theme-saturation), 95%, 0.2);
  }

  .podium-item .info .name {
    margin: 0;
    font-weight: 700;
  }

  .podium-item .info .meta {
    margin: 4px 0 0;
    color: var(--clr-neutral);
  }

  .podium-item .rank {
    font-size: 1.5rem;
    font-weight: 800;
    color: #c7d2fe;
  }

  .podium-item.rank-1 {
    border-color: hsl(
      var(--theme-hue),
      var(--theme-saturation-high),
      60%,
      0.45
    );
    box-shadow: 0 18px 40px
      hsl(var(--theme-hue), var(--theme-saturation-high), 60%, 0.25);
  }

  .podium-item.rank-2 {
    border-color: hsl(
      var(--theme-hue),
      var(--theme-saturation-high),
      70%,
      0.35
    );
  }

  .podium-item.rank-3 {
    border-color: hsl(
      var(--theme-hue-secondary),
      var(--theme-saturation-high),
      70%,
      0.35
    );
  }

  .board {
    position: relative;
    z-index: 1;
    margin-top: clamp(1rem, 3vw, 2rem);
  }

  .board-frame {
    position: relative;
    overflow: hidden;
    border-radius: var(--radius-l);
    background: linear-gradient(
      160deg,
      hsl(var(--theme-hue), var(--theme-saturation), 8%, 0.9),
      hsl(var(--theme-hue), var(--theme-saturation), 10%, 0.9)
    );
    border: var(--glass-border-medium);
    box-shadow:
      0 24px 60px rgba(0, 0, 0, 0.45),
      0 0 0 1px hsl(var(--theme-hue), var(--theme-saturation), 95%, 0.03);
    padding: clamp(1rem, 3vw, 1.5rem);
  }

  .board-frame::before,
  .board-frame::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .board-frame::before {
    background: radial-gradient(
        circle at 20% 10%,
        hsl(var(--theme-hue), var(--theme-saturation), 95%, 0.12),
        transparent 35%
      ),
      radial-gradient(
        circle at 80% 20%,
        hsl(var(--theme-hue), var(--theme-saturation-high), 60%, 0.18),
        transparent 40%
      );
    mix-blend-mode: screen;
  }

  .board-frame::after {
    background: linear-gradient(
      120deg,
      hsl(var(--theme-hue), var(--theme-saturation-high), 60%, 0.12),
      hsl(var(--theme-hue-secondary), var(--theme-saturation-high), 70%, 0.08)
    );
    opacity: 0.6;
  }

  .board-head {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-m);
    margin-bottom: var(--space-m);
    z-index: 1;
  }

  .board-head h3 {
    margin: 4px 0 0;
    font-size: 1.4rem;
  }

  .legend {
    display: inline-flex;
    gap: 8px;
    align-items: center;
  }

  .pill {
    display: inline-flex;
    align-items: center;
    padding: 6px 12px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 0.9rem;
    border: 1px solid hsl(var(--theme-hue), var(--theme-saturation), 95%, 0.18);
    background: hsl(var(--theme-hue), var(--theme-saturation), 95%, 0.04);
    color: #e5e7eb;
  }

  .pill.hot {
    border-color: hsl(
      var(--theme-hue-secondary),
      var(--theme-saturation-high),
      70%,
      0.5
    );
    background: linear-gradient(
      120deg,
      hsl(var(--theme-hue-secondary), var(--theme-saturation-high), 70%, 0.2),
      hsl(var(--theme-hue), var(--theme-saturation-high), 60%, 0.15)
    );
  }

  .pill.ghost {
    border-color: hsl(var(--theme-hue), var(--theme-saturation-high), 60%, 0.4);
    color: #c7d2fe;
  }

  .table {
    width: 100%;
    display: grid;
    gap: var(--space-xs);
    position: relative;
    z-index: 1;
  }

  .row {
    display: grid;
    grid-template-columns: 60px 1.4fr 0.6fr 0.8fr;
    align-items: center;
    padding: var(--space-s);
    border-radius: var(--radius-s);
    background: linear-gradient(
      120deg,
      hsl(var(--theme-hue), var(--theme-saturation), 10%, 0.75),
      hsl(var(--theme-hue), var(--theme-saturation), 14%, 0.7)
    );
    border: var(--glass-border-light);
    transition:
      transform 140ms ease,
      box-shadow 140ms ease,
      border-color 140ms ease;
  }

  .row.head {
    background: transparent;
    border: none;
    color: #a5b4fc;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  .row.top {
    border-color: hsl(
      var(--theme-hue),
      var(--theme-saturation-high),
      60%,
      0.35
    );
    box-shadow: 0 10px 24px
      hsl(var(--theme-hue), var(--theme-saturation-high), 60%, 0.12);
  }

  .player {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--space-s);
    align-items: center;
  }

  .player .avatar {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background-size: cover;
    background-position: center;
    border: 1px solid hsl(var(--theme-hue), var(--theme-saturation), 95%, 0.12);
  }

  .name {
    margin: 0;
    font-weight: 700;
  }

  .subtle {
    margin: 2px 0 0;
    color: #94a3b8;
    font-size: 0.9rem;
  }

  .rank,
  .level,
  .xp {
    font-weight: 700;
  }

  .xp {
    color: #c7d2fe;
  }

  @keyframes gradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  @keyframes float {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-14px);
    }
    100% {
      transform: translateY(0px);
    }
  }

  @keyframes drift {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-120px);
    }
  }

  @media (max-width: 900px) {
    .row {
      grid-template-columns: 52px 1fr;
      grid-template-areas:
        "rank player"
        "level xp";
      row-gap: 8px;
    }

    .row span:nth-child(1) {
      grid-area: rank;
    }
    .row .player {
      grid-area: player;
    }
    .row .level {
      grid-area: level;
    }
    .row .xp {
      grid-area: xp;
    }
  }
</style>
