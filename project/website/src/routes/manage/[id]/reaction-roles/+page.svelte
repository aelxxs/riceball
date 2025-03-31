<script>
import { Button } from "$lib/blocks/button";
import DashboardCard from "$lib/blocks/dashboard-card/dashboard-card.svelte";

const { data } = $props();
</script>

<DashboardCard
  title="Reaction Roles"
  description="Create reaction roles to allow users to assign roles to themselves."
>
  <Button href="/manage/{data.guild.id}/reaction-roles/create" class="button">
    Add Reaction Role
  </Button>
</DashboardCard>
