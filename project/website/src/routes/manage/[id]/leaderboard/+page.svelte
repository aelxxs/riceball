<script lang="ts">
import AtSignIcon from "lucide-svelte/icons/at-sign";
import ChevronLeftIcon from "lucide-svelte/icons/chevron-left";
import ChevronRightIcon from "lucide-svelte/icons/chevron-right";
import ExternalLinkIcon from "lucide-svelte/icons/external-link";
import RotateCcwIcon from "lucide-svelte/icons/rotate-ccw";
import { tick } from "svelte";
import { toast } from "svelte-sonner";
import { enhance } from "$app/forms";
import { Button } from "$lib/blocks/button";
import { ButtonWithConfirmation } from "$lib/blocks/button-with-confirmation";
import { DashboardCard } from "$lib/blocks/dashboard-card";

const { data } = $props();

const leaderboard = $derived(data.leaderboard);
const guild = $derived(data.guild);
const rewards = $derived([...(guild.settings?.levels?.rewards ?? [])].sort((a, b) => a.level - b.level));
const stackRewards = $derived(guild.settings?.levels?.stackRewards ?? false);

let resetForm = $state<HTMLFormElement | null>(null);
let resetUserId = $state("");

const formatNumber = (n: number) => n.toLocaleString();
const pageHref = (page: number) => `?page=${page}`;
const roleName = (roleId: string) => guild.roles.find((r) => r.id === roleId)?.name;

const resetExp = async (userId: string) => {
	resetUserId = userId;
	await tick();
	resetForm?.requestSubmit();
};
</script>

<form
  hidden
  method="POST"
  action="?/resetExp"
  bind:this={resetForm}
  use:enhance={() =>
    async ({ result, update }) => {
      if (result.type === "success") {
        toast.success("Member XP has been reset.");
      } else {
        toast.error("Failed to reset member XP.");
      }
      await update();
    }}
>
  <input type="hidden" name="userId" value={resetUserId} />
</form>

<div class="with-sidebar">
  <div class="stack">
    <DashboardCard
      title="Leaderboard"
      description="Members ranked by total experience earned in this server."
    >
      <div class="stack space-m">
        <div class="repel">
          <p class="txt-muted">
            {formatNumber(leaderboard.total)}
            {leaderboard.total === 1 ? "member" : "members"} ranked
          </p>
          <Button
            variant="secondary"
            size="sm"
            href={`/leaderboard/${guild.id}`}
            target="_blank"
          >
            <span class="cluster space-2xs no-wrap">
              <ExternalLinkIcon size={14} />
              Public page
            </span>
          </Button>
        </div>

        {#if leaderboard.entries.length === 0}
          <div class="box empty stack space-xs">
            <p class="fw:md">No ranked members yet</p>
            <p class="txt-muted">
              Members appear here once they earn experience by chatting in your
              server.
            </p>
          </div>
        {:else}
          <ol class="rows" start={leaderboard.entries[0].rank}>
            {#each leaderboard.entries as entry (entry.userId)}
              <li class="row" class:podium={entry.rank <= 3}>
                <span class="rank">#{entry.rank}</span>
                <div class="member cluster no-wrap space-xs">
                  <img
                    class="avatar"
                    src={entry.avatar}
                    alt=""
                    width="40"
                    height="40"
                    loading="lazy"
                  />
                  <div class="stack space-3xs identity">
                    <span class="name fw:md">{entry.name}</span>
                    {#if !entry.inGuild}
                      <small class="txt-muted">Left the server</small>
                    {/if}
                  </div>
                </div>
                <div class="progress stack space-3xs">
                  <div class="repel">
                    <small class="fw:md">Level {entry.level}</small>
                    <small class="txt-muted">
                      {formatNumber(entry.progress)} / {formatNumber(
                        entry.required,
                      )} XP
                    </small>
                  </div>
                  <div
                    class="bar"
                    role="progressbar"
                    aria-label={`Progress to level ${entry.level + 1}`}
                    aria-valuemin={0}
                    aria-valuemax={entry.required}
                    aria-valuenow={entry.progress}
                  >
                    <span
                      style:width={`${Math.min(100, (entry.progress / entry.required) * 100)}%`}
                    ></span>
                  </div>
                </div>
                <span class="total">
                  {formatNumber(entry.exp)}
                  <small class="txt-muted">XP</small>
                </span>
                <div class="reset">
                  <ButtonWithConfirmation
                    title="Reset member XP"
                    description={`Reset ${entry.name}'s experience to 0? Their level and rank will be lost. This cannot be undone.`}
                    onConfirm={() => resetExp(entry.userId)}
                  >
                    {#snippet button()}
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Reset XP for ${entry.name}`}
                        title="Reset XP"
                      >
                        <RotateCcwIcon size={15} />
                      </Button>
                    {/snippet}
                  </ButtonWithConfirmation>
                </div>
              </li>
            {/each}
          </ol>

          {#if leaderboard.pageCount > 1}
            <nav class="repel" aria-label="Leaderboard pages">
              {#if leaderboard.page > 1}
                <Button
                  variant="secondary"
                  size="sm"
                  href={pageHref(leaderboard.page - 1)}
                >
                  <ChevronLeftIcon size={16} /> Previous
                </Button>
              {:else}
                <Button variant="secondary" size="sm" disabled>
                  <ChevronLeftIcon size={16} /> Previous
                </Button>
              {/if}
              <small class="txt-muted">
                Page {leaderboard.page} of {leaderboard.pageCount}
              </small>
              {#if leaderboard.page < leaderboard.pageCount}
                <Button
                  variant="secondary"
                  size="sm"
                  href={pageHref(leaderboard.page + 1)}
                >
                  Next <ChevronRightIcon size={16} />
                </Button>
              {:else}
                <Button variant="secondary" size="sm" disabled>
                  Next <ChevronRightIcon size={16} />
                </Button>
              {/if}
            </nav>
          {/if}
        {/if}
      </div>
    </DashboardCard>
  </div>

  <aside class="stack">
    <DashboardCard
      title="Level Rewards"
      description={stackRewards
        ? "Members keep every reward they have unlocked."
        : "Members only keep the reward for their highest level."}
    >
      <div class="stack space-s">
        {#each rewards as reward (reward.level)}
          <div class="box reward stack space-2xs">
            <p class="fw:md">
              <span class="txt-muted">Level</span>
              {reward.level}
            </p>
            <div class="cluster space-2xs">
              {#each reward.roles as roleId}
                <span class="role cluster no-wrap">
                  <AtSignIcon size={12} />
                  <small>{roleName(roleId) ?? "Deleted role"}</small>
                </span>
              {:else}
                <small class="txt-muted">No roles</small>
              {/each}
            </div>
          </div>
        {:else}
          <p class="txt-muted">No level rewards have been configured yet.</p>
        {/each}
        <div>
          <Button variant="secondary" size="sm" href={`/manage/${guild.id}/leveling`}>
            Manage rewards
          </Button>
        </div>
      </div>
    </DashboardCard>
  </aside>
</div>

<style>
  .with-sidebar {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-l);
    align-items: flex-start;
  }

  .with-sidebar > :first-child {
    flex-basis: 0;
    flex-grow: 999;
    min-inline-size: 60%;
  }

  .with-sidebar > :last-child {
    flex-grow: 1;
    flex-basis: 18rem;
  }

  .rows {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: var(--space-2xs);
  }

  .row {
    display: grid;
    grid-template-columns: 3rem minmax(0, 1.4fr) minmax(0, 1fr) 6rem auto;
    align-items: center;
    gap: var(--space-s);
    padding: var(--space-xs) var(--space-s);
    border-radius: var(--border-radius);
    background-color: var(--clr-bg-input);
    border: 1px solid transparent;
  }

  .row:hover {
    border: var(--glass-border-light);
  }

  .rank {
    font-weight: 700;
    color: var(--txt-muted);
    font-variant-numeric: tabular-nums;
  }

  .podium .rank {
    color: var(--clr-primary);
  }

  .avatar {
    flex-shrink: 0;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: var(--radius-full);
    object-fit: cover;
    background-color: var(--clr-bg-input-hover);
  }

  .identity {
    min-width: 0;
  }

  .name {
    color: var(--txt-bold);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .bar {
    height: 0.375rem;
    border-radius: var(--radius-full);
    background-color: var(--clr-bg-input-hover);
    overflow: hidden;
  }

  .bar span {
    display: block;
    height: 100%;
    background-color: var(--clr-primary);
  }

  .total {
    text-align: end;
    font-weight: 700;
    color: var(--txt-bold);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .empty {
    --bg: var(--clr-bg-input);
    --padding: var(--space-m);
    text-align: center;
  }

  .reward {
    --bg: var(--clr-bg-input);
  }

  .role {
    --cluster-gap: var(--space-3xs);
    padding: 0.2rem 0.6rem;
    border-radius: var(--radius-full);
    color: var(--txt-themed);
    background-color: var(--clr-bg-input-hover);
  }

  @media (max-width: 40rem) {
    .row {
      grid-template-columns: 2.5rem minmax(0, 1fr) auto;
      grid-template-areas:
        "rank member reset"
        "rank progress total";
    }

    .rank {
      grid-area: rank;
    }

    .member {
      grid-area: member;
    }

    .progress {
      grid-area: progress;
    }

    .total {
      grid-area: total;
    }

    .reset {
      grid-area: reset;
    }
  }
</style>
