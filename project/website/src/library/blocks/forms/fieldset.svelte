<script lang="ts" module>
import type { FormPath } from "sveltekit-superforms";

// the form object
type T = Record<string, unknown>;
// the path/name of the field in the form object
type U = unknown;
</script>

<script
  lang="ts"
  generics="T extends Record<string, unknown>, U extends FormPath<T>"
>
  import { FieldErrors, Fieldset, type FieldProps } from "formsnap";

  let { form, name, children: childrenProp }: FieldProps<T, U> = $props();
</script>

<Fieldset {form} {name}>
  {#snippet children(snippetProps)}
    <div class="flow field">
      {@render childrenProp?.(snippetProps)}
      {#if snippetProps.errors.length > 0}
        <FieldErrors>
          {#snippet children({ errors, errorProps })}
            {#each errors as error}
              <span style="color: var(--clr-theme-error);" {...errorProps}
                >{error}</span
              >
            {/each}
          {/snippet}
        </FieldErrors>
      {/if}
    </div>
  {/snippet}
</Fieldset>

<style>
  .field {
    border: 1px solid transparent;
  }
</style>
