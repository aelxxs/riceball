<script lang="ts">
import { page } from "$app/state";
</script>

<span class="status">{page.status}</span>
<span class="message"> {page.error?.message}</span>

<style>
  .status {
    font-size: 2rem;
    font-weight: bold;
  }

  .message {
    font-size: 1.5rem;
    color: red;
  }
</style>
