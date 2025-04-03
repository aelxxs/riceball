<script lang="ts">
import { page } from "$app/state";
</script>

<div class="container stack space-3xs">
  <span class="status">{page.status}</span>
  <span class="message"> {page.error?.message}</span>
</div>

<style>
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
