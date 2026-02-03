<script lang="ts">
import { CDN } from "@discordjs/rest";
import { onMount } from "svelte";
import { fade, fly } from "svelte/transition";
import { Button } from "$lib/blocks/button";
import { DiscordIcon } from "$lib/blocks/discord-icon";
import type { PageProps } from "./$types";

const { data }: PageProps = $props();

let mounted = $state(false);
let particles: Array<{
	id: number;
	x: number;
	y: number;
	size: number;
	duration: number;
}> = [];

onMount(() => {
	mounted = true;
	generateParticles();
});

function generateParticles() {
	particles = Array.from({ length: 15 }, (_, i) => ({
		id: i,
		x: Math.random() * 100,
		y: Math.random() * 100,
		size: Math.random() * 4 + 2,
		duration: Math.random() * 20 + 15,
	}));
}

function createGuildInviteUrl(id: string) {
	return `https://discord.com/oauth2/authorize?client_id=${id}&scope=bot%20applications.commands&permissions=8`;
}

const cdn = new CDN();
</script>

<!-- Animated Background -->
<div class="background">
  <div class="gradient-orb orb-1"></div>
  <div class="gradient-orb orb-2"></div>
  <div class="gradient-orb orb-3"></div>

  <!-- Particles -->
  <div class="particles-container">
    {#each particles as particle (particle.id)}
      <div
        class="particle"
        style="--x: {particle.x}%; --y: {particle.y}%; --size: {particle.size}px; --duration: {particle.duration}s"
      ></div>
    {/each}
  </div>

  <!-- Grid -->
  <div class="grid"></div>
</div>

<article class="wrap flow">
  <header class="flow" in:fly={{ y: 20, duration: 600 }}>
    <h1>Select a server</h1>
    <p>Get started by selecting a server to setup or manage.</p>
  </header>
  <section class="guilds grid margin-l">
    {#each data.guilds as guild, index}
      {#if mounted}
        <div
          class="stack space-s"
          in:fly={{ y: 20, duration: 600, delay: 100 + index * 50 }}
        >
          <div class="guild">
            <div class="icon">
              <DiscordIcon
                size={5}
                id={guild.id}
                icon={guild.icon}
                name={guild.name}
                type="guild"
              />
            </div>
            {#if guild.icon}
              <div
                class="bg"
                style="--bg: url({cdn.icon(guild.id, guild.icon)})"
              ></div>
            {/if}
          </div>

          <div class="repel">
            <div>
              <h5 class="fw:600">{guild.name}</h5>
              <small>{guild.riceball ? "Ready" : "Not setup"}</small>
            </div>
            {#if guild.riceball}
              <Button
                href="/manage/{guild.id}"
                data-sveltekit-preload-data="hover"
              >
                Manage
              </Button>
            {:else}
              <Button href={createGuildInviteUrl(guild.id)} variant="secondary">
                Setup
              </Button>
            {/if}
          </div>
        </div>
      {/if}
    {/each}
  </section>
</article>

<style lang="scss">
  .background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;

    .gradient-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.3;
      animation: float 20s ease-in-out infinite;

      &.orb-1 {
        width: 400px;
        height: 400px;
        background: var(--gradient-orb-primary);
        top: -100px;
        left: -100px;
        animation-delay: 0s;
      }

      &.orb-2 {
        width: 300px;
        height: 300px;
        background: var(--gradient-orb-secondary);
        bottom: -50px;
        right: -50px;
        animation-delay: -5s;
      }

      &.orb-3 {
        width: 350px;
        height: 350px;
        background: var(--gradient-orb-accent);
        top: 50%;
        right: 10%;
        animation-delay: -10s;
      }
    }

    .particles-container {
      position: absolute;
      width: 100%;
      height: 100%;

      .particle {
        position: absolute;
        left: var(--x);
        top: var(--y);
        width: var(--size);
        height: var(--size);
        background: var(--gradient-orb-primary);
        border-radius: 50%;
        animation: float var(--duration) ease-in-out infinite;
        opacity: 0.5;
      }
    }

    .grid {
      position: absolute;
      width: 100%;
      height: 100%;
      background-image: var(--grid-pattern);
      background-size: 50px 50px;
      opacity: 0.5;
    }
  }

  .wrap {
    position: relative;
    z-index: 10;
    max-width: 62rem;
    margin: 0 auto;
    margin-top: var(--space-xl);
    display: flex;
    flex-direction: column;
    gap: var(--space-s);
    padding-inline: var(--space-m);
  }

  header {
    h1 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 8px;
      background: var(--gradient-hero);
      background-size: 200% 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: gradient-shift 4s ease infinite;
    }

    p {
      color: var(--clr-neutral);
      font-size: 1rem;
    }
  }

  .guilds {
    --minimum: 30ch;
    --gap: var(--space-l);
    margin-top: var(--space-xl);
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(var(--minimum), 1fr));
    gap: var(--gap);
  }

  .guild {
    position: relative;
    text-decoration: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      135deg,
      var(--glass-bg-light),
      var(--glass-bg-subtle)
    );
    border: var(--glass-border-light);
    border-radius: 12px;
    padding: var(--space-xl);
    overflow: hidden;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);

    &:hover {
      background: linear-gradient(
        135deg,
        var(--glass-bg-medium),
        var(--glass-bg-light)
      );
      border: var(--glass-border-strong);
      transform: translateY(-4px);
      box-shadow: var(--shadow-glow-md);
    }
  }

  .bg {
    position: absolute;
    inset: 0px;
    background: var(--bg) center center / cover no-repeat;
    transform: scale(1.4);
    filter: blur(10px);
    opacity: 0.2;
  }

  .icon {
    position: relative;
    z-index: 2;
  }

  .repel {
    position: relative;
    z-index: 3;
    width: 100%;
    margin-top: var(--space-m);
  }

  .repel > div {
    flex: 1;

    h5 {
      margin-bottom: 4px;
      color: white;
    }

    small {
      color: var(--clr-cyan);
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }

  @keyframes gradient-shift {
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
    0%,
    100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }
</style>
