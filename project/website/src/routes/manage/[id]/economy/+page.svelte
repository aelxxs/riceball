<script lang="ts">
  import SuperDebug, { superForm } from "sveltekit-superforms";

  let { data } = $props();

  const settingsForm = superForm(data.form, {
    dataType: "json",
  });

  const { form } = settingsForm;
</script>

<SuperDebug data={$form} />
