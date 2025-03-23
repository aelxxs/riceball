<script lang="ts" module>
  type T = Record<string, unknown>;
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
  import {
    formFieldProxy,
    type FormPathLeaves,
    type SuperForm,
  } from "sveltekit-superforms";
  import type { FormFieldProxy } from "sveltekit-superforms/client";
  import { DashboardCard } from "../dashboard-card";
  import { Control, Field, Fieldset } from "../forms";
  import { RadioGroup, RadioGroupItem } from "../radio-group";
  import { DiscordEntitySelect } from "../select-discord";

  let {
    title,
    description,
    form,
    items,
    type,
  }: {
    title: string;
    description: string;
    form: SuperForm<T>;
    items: any;
    type: "role" | "channel";
  } = $props();

  const RestrictionType = {
    ALLOW_ALL: "ALLOW_ALL",
    BLOCK_ALL: "BLOCK_ALL",
  } as const;

  // TODO: Find a way to properly type this
  const fields = {
    role: {
      omit: "roleRestriction.omit",
      type: "roleRestriction.type",
    },
    channel: {
      omit: "channelRestriction.omit",
      type: "channelRestriction.type",
    },
  }[type] as { omit: FormPathLeaves<T>; type: FormPathLeaves<T> };

  const { value: restrictionType } = formFieldProxy(
    form,
    fields.type,
  ) satisfies FormFieldProxy<
    (typeof RestrictionType)[keyof typeof RestrictionType]
  >;

  const { value: omitEntities } = formFieldProxy(
    form,
    fields.omit,
  ) satisfies FormFieldProxy<string[]>;

  const content = {
    channel: {
      allowAllLabel: "Allow all channels except",
      allowAllDescription:
        "This will allow all channels except the ones selected",
      blockAllLabel: "Block all channels except",
      blockAllDescription:
        "This will block all channels except the ones selected",
    },
    role: {
      allowAllLabel: "Allow all roles except",
      allowAllDescription: "This will allow all roles except the ones selected",
      blockAllLabel: "Block all roles except",
      blockAllDescription: "This will block all roles except the ones selected",
    },
  }[type];
</script>

<DashboardCard {title} {description}>
  <div class="max-w-form">
    <Fieldset {form} name={fields.type}>
      <RadioGroup bind:value={$restrictionType}>
        <Control
          label={content.allowAllLabel}
          description={$restrictionType === RestrictionType.ALLOW_ALL
            ? content.allowAllDescription
            : ""}
          orientation="horizontal"
        >
          {#snippet children({ props })}
            <RadioGroupItem
              {...props}
              id={RestrictionType.ALLOW_ALL}
              value={RestrictionType.ALLOW_ALL}
            />
          {/snippet}
        </Control>

        {#if $restrictionType === RestrictionType.ALLOW_ALL}
          <Field {form} name={fields.omit}>
            <Control>
              {#snippet children({ props })}
                <DiscordEntitySelect
                  {...props}
                  {type}
                  {items}
                  bind:selected={$omitEntities}
                />
              {/snippet}
            </Control>
          </Field>
        {/if}

        <Control
          label={content.blockAllLabel}
          description={$restrictionType === RestrictionType.BLOCK_ALL
            ? content.blockAllDescription
            : ""}
          orientation="horizontal"
        >
          {#snippet children({ props })}
            <RadioGroupItem
              {...props}
              id={RestrictionType.BLOCK_ALL}
              value={RestrictionType.BLOCK_ALL}
            />
          {/snippet}
        </Control>

        {#if $restrictionType === RestrictionType.BLOCK_ALL}
          <Field {form} name={fields.omit}>
            <Control>
              {#snippet children({ props })}
                <DiscordEntitySelect
                  {...props}
                  {type}
                  {items}
                  bind:selected={$omitEntities}
                />
              {/snippet}
            </Control>
          </Field>
        {/if}
      </RadioGroup>
    </Fieldset>
  </div>
</DashboardCard>
