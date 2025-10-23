<script lang="ts">
import { CDN } from "@discordjs/rest";
import { Button } from "$lib/blocks/button";
import { DiscordIcon } from "$lib/blocks/discord-icon";
import type { PageProps } from "./$types";

const { data }: PageProps = $props();

function createGuildInviteUrl(id: string) {
	return `https://discord.com/oauth2/authorize?client_id=${id}&scope=bot%20applications.commands&permissions=8`;
}

const cdn = new CDN();
</script>

<article class="wrap flow">
  <header class="flow">
    <h1>Select a server</h1>
    <p>Get started by selecting a server to setup or manage.</p>
  </header>
  <section class="guilds grid margin-xl">
    {#each data.guilds as guild}
      <div class="stack space-s">
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
            <small>Admin</small>
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
    {/each}
  </section>
</article>

<style lang="scss">
  .wrap {
    max-width: 62rem;
    margin: 0 auto;
    margin-top: var(--space-xl);
    display: flex;
    flex-direction: column;
    gap: var(--space-s);
    padding-inline: var(--space-m);
  }

  .guilds {
    --minimum: 30ch;
    --gap: var(--space-l);
    margin-top: var(--space-xl);
  }

  .guild {
    position: relative;
    text-decoration: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: var(--clr-bg);
    border-radius: var(--border-radius);
    padding: var(--space-xl);
    overflow: hidden;
  }

  .bg {
    position: absolute;
    inset: 0px;
    background: var(--bg) center center / cover no-repeat;
    transform: scale(1.4);
    filter: blur(10px);
    opacity: 0.3;
  }

  .icon {
    position: relative;
    z-index: 2;
  }
</style>
