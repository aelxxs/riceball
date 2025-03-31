<script lang="ts">
import DashboardCard from "$lib/blocks/dashboard-card/dashboard-card.svelte";

const users = [
	{ id: 1, name: "Alice", exp: 10 },
	{ id: 2, name: "Bob", exp: 20 },
	{ id: 3, name: "Charlie", exp: 30 },
];
</script>

<!-- {#snippet leaderboardItem(user: any)}
  <div class="user">
    <div class="repel">
      <div class="avatar"></div>
      <div class="name">{user.name}</div>
    </div>
    <div class="score">{user.exp}</div>
  </div>
{/snippet}

<div class="wrapper stack space-m">
  <div class="banner"></div>
  <div class="with-sidebar">
    <div class="stack space-m">
      {#each users as user}
        {@render leaderboardItem(user)}
      {/each}
    </div>
    <div class="stack space-m">
      <DashboardCard title="Rewards">
        {#each users as user}
          <div>{user.name} - {user.exp}</div>
        {/each}
      </DashboardCard>
    </div>
  </div>
</div>

<style>
  .wrapper {
    padding: var(--space-m);
    max-width: 70rem;
    margin: 0 auto;
  }

  .banner {
    height: 300px;
    background-color: var(--clr-bg-accent);
    border-radius: var(--border-radius);
  }

  .with-sidebar {
    display: flex;
    flex-wrap: wrap-reverse;
    gap: var(--space-m);
  }

  .with-sidebar > :last-child {
    flex-grow: 1;
    flex-basis: 20rem;
  }

  .with-sidebar > :first-child {
    flex-basis: 0;
    flex-grow: 999;
    min-inline-size: 50%;
  }
</style> -->
