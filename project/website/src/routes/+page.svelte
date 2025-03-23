<script>
  import ColorPicker from "$lib/blocks/color-picker/color-picker.svelte";
  import { DashboardCard } from "$lib/blocks/dashboard-card";
  import { Divider } from "$lib/blocks/divider";
  import ImageUpload from "$lib/blocks/embed-creator/blocks/image-upload.svelte";
  import { Control, Field } from "$lib/blocks/forms";
  import { LevelingCardPreview } from "$lib/blocks/leveling-card-preview";
  import { Slider } from "$lib/blocks/slider/slider";
  import { Switch } from "$lib/blocks/switch";
  import { shake } from "$lib/utility/context.svelte.js";
  import { ToggleGroup } from "bits-ui";
  import { LevelsWithRelationsSchema } from "db/custom";
  import { toast } from "svelte-sonner";
  import { superForm } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";

  const settingsForm = superForm(
    {},
    {
      validators: zodClient(LevelsWithRelationsSchema),
      dataType: "json",
      resetForm: false,
      taintedMessage: () => {
        return new Promise(() => {
          shake.shake = true;
          setTimeout(() => {
            shake.shake = false;
          }, 500);
        });
      },
      onUpdate: ({ result }) => {
        switch (result.type) {
          case "success":
            modal.hideModal();
            toast.success("Settings saved successfully!");
            break;
          case "failure":
            toast.error("Failed to save settings.");
            break;
          default:
            break;
        }
      },
    },
  );

  const { form, enhance, tainted, isTainted, submit, delayed, submitting } =
    settingsForm;
</script>

<LevelingCardPreview />

<DashboardCard
  title="Server Leveling Card"
  description="Configure the default leveling card for your server."
>
  <div class="max-w-form stack">
    <Field form={settingsForm} name="addRolesOnJoin">
      <Control
        label="Block users from customizing their leveling card"
        description="Card customization commands will be disabled for your server."
        orientation="horizontal"
      >
        {#snippet children({ props })}
          <Switch {...props} checked />
        {/snippet}
      </Control>
    </Field>

    <!-- <LevelingCardPreview /> TODO: move into own file -->
  </div>

  <div class="max-w-card stack">
    <p class="fw:md">Preview</p>
    <LevelingCardPreview />
    <Divider />
  </div>

  <div class="cluster align-start">
    <div class="stack max-w-form">
      <Field form={settingsForm} name="boost">
        <Control label="Border Radius">
          {#snippet children({ props })}
            <ToggleGroup.Root type="single" class="cluster space-xs">
              {#each ["0px", "5px", "10px", "15px", "20px"] as radius}
                <ToggleGroup.Item value={radius}>
                  {#snippet child({ props })}
                    <button class="box radius-preview" {...props}>
                      <div class="stack space-2xs center">
                        <div class="square" style:--radius={radius}></div>
                      </div>
                    </button>
                  {/snippet}
                </ToggleGroup.Item>
              {/each}
            </ToggleGroup.Root>
          {/snippet}
        </Control>
      </Field>

      <Field form={settingsForm} name="boost">
        <Control label="Font Family">
          {#snippet children({ props })}
            <ToggleGroup.Root type="single" class="cluster space-xs">
              {#each [// "Sans-serif", "Serif", "Monospace", "Handwritten", "Cursive"
                { label: "Sans-serif", value: "Roboto" }, { label: "Serif", value: "Lora" }, { label: "Monospace", value: "JetBrains Mono" }, { label: "Handwritten", value: "Pacifico" }, { label: "Cursive", value: "Dancing Script" }] as font}
                <ToggleGroup.Item value={font.label}>
                  {#snippet child({ props })}
                    <button class="box font-preview" {...props}>
                      <div class="stack space-2xs center">
                        <p class="fs:sm fw:bold" style:font-family={font.value}>
                          Ag
                        </p>
                        <small>{font.label}</small>
                      </div>
                    </button>
                  {/snippet}
                </ToggleGroup.Item>
              {/each}
            </ToggleGroup.Root>
          {/snippet}
        </Control>
      </Field>
      <Field form={settingsForm} name="boost">
        <Control label="Overlay Opacity">
          {#snippet children({ props })}
            <div class="cluster no-wrap">
              <Slider type="single" min={0} max={100} step={1} value={50} />
            </div>
          {/snippet}
        </Control>
      </Field>

      <Field form={settingsForm} name="boost">
        <Control label="Background Image">
          {#snippet children({ props })}
            <ImageUpload height={150} />
          {/snippet}
        </Control>
      </Field>
    </div>

    <Divider orientation="vertical" />

    <div class="stack">
      <Field form={settingsForm} name="addRolesOnJoin">
        <Control
          label="Block users from customizing their leveling card"
          description="Card customization commands will be disabled for your server."
          orientation="horizontal"
        >
          {#snippet children({ props })}
            <Switch {...props} checked />
          {/snippet}
        </Control>
      </Field>

      <Field form={settingsForm} name="boost">
        <Control label="Background Color">
          {#snippet children({ props })}
            <ColorPicker showSelectedColor />
          {/snippet}
        </Control>
      </Field>

      <!-- <Field form={settingsForm} name="boost">
          <Control label="Text">
            {#snippet children({ props })}
              <ColorPicker showSelectedColor />
            {/snippet}
          </Control>
        </Field> -->

      <Field form={settingsForm} name="boost">
        <Control label="Progress Color">
          {#snippet children({ props })}
            <ColorPicker showSelectedColor />
          {/snippet}
        </Control>
      </Field>

      <!-- <Field form={settingsForm} name="boost">
          <Control label="Secondary">
            {#snippet children({ props })}
              <ColorPicker showSelectedColor />
            {/snippet}
          </Control>
        </Field> -->

      <Field form={settingsForm} name="boost">
        <Control label="Overlay Color">
          {#snippet children({ props })}
            <ColorPicker showSelectedColor />
          {/snippet}
        </Control>
      </Field>
    </div>
  </div>
</DashboardCard>

<style>
  .max-w-card {
    max-width: 40rem;
  }

  .radius-preview {
    cursor: pointer;
    outline: none;
    border: 0;
    --padding: var(--space-2xs);
    --bg: var(--clr-bg-input);
    border: 2px solid transparent;
  }

  .font-preview {
    cursor: pointer;
    outline: none;
    border: 0;
    --padding: var(--space-2xs);
    --bg: var(--clr-bg-input);
    border: 2px solid transparent;
    width: 5.75rem;
  }

  .radius-preview[data-state="on"] {
    border: 2px solid var(--clr-theme-2);
  }

  .center {
    align-items: center;
  }

  .square {
    width: 3ch;
    height: 3ch;
    background-color: var(--clr-theme-2-translucent);
    border-top-left-radius: var(--radius);
    border-left: 3.5px solid var(--clr-theme-2);
    border-top: 3.5px solid var(--clr-theme-2);
  }
</style>
