<script lang="ts">
import { page } from "$app/state";
</script>

E3
<h1>{page.status}: {page.error?.message}</h1>
