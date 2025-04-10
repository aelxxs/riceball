<script lang="ts">
import { page } from "$app/state";
</script>

<div class="container stack space-3xs">
  <img class="icon" src="/riceball-sad.svg" alt="riceball-icon" />
  <span class="status">{page.status}</span>
  <span class="message"> {page.error?.message}</span>
</div>

<style>
  .icon {
    height: 10rem;
    width: 10rem;
    margin-bottom: 1rem;
    filter: drop-shadow(0 0 0.5rem var(--clr-bg-border));
  }

  .container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .status {
    font-size: 5rem;
    font-weight: bold;
    color: var(--txt-bold);
  }

  .message {
    font-size: 1.15rem;
  }
</style>
