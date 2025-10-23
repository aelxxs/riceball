<script lang="ts">
import {
	composeLevelCard,
	generateEnhancedPalettes,
	getHSLAOpacity,
	type HEXColorString,
	hexToHsla,
	hslaToObj,
	hslaToStr,
	isLight,
	rgbaArrayToHex,
	setHSLAOpacity,
} from "@riceball/colorify";
import { ToggleGroup } from "bits-ui";
import ColorThief from "colorthief";
import { onMount } from "svelte";
import { toast } from "svelte-sonner";
import SuperDebug, { fileProxy, superForm } from "sveltekit-superforms";
import ColorPicker from "$lib/blocks/color-picker/color-picker.svelte";
import { DashboardCard } from "$lib/blocks/dashboard-card";
import ImageUpload from "$lib/blocks/embed-creator/blocks/image-upload.svelte";
import { Control, Field } from "$lib/blocks/forms";
import { LevelingCardPreview } from "$lib/blocks/leveling-card-preview";
import { RadioGroup } from "$lib/blocks/radio-group";
import { Restrictions } from "$lib/blocks/restrictions";
import { Slider } from "$lib/blocks/slider/slider";
import { Switch } from "$lib/blocks/switch";
import { getSaveModal, shake } from "$lib/utility/context.svelte.js";
import { LevelingUp, TextLeveling } from "./sections/index.js";
import LevelUpRewards from "./sections/level-up-rewards.svelte";

const { data } = $props();

const modal = getSaveModal();

const settingsForm = superForm(data.form, {
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
				console.log(result);
				toast.error("Failed to save settings.");
				break;
			default:
				break;
		}
	},
});

const { form, enhance, tainted, isTainted, submit, delayed, submitting } = settingsForm;

$effect(() => {
	if (isTainted($tainted)) {
		modal.showModal({
			save: submit,
			undo: settingsForm.reset,
			delayed: $delayed,
			submitting: $submitting,
		});
	} else {
		modal.hideModal();
	}
});

const embed = $state($form.notifyMessageEmbed);

$effect(() => {
	$form.notifyMessageEmbed = embed;
});

let dominantColor = $state<HEXColorString>("#000000");
let palette = $state<HEXColorString[]>([]);

const handleImageUpload = (url: string) => {
	const img = new Image();
	img.src = url;
	img.crossOrigin = "Anonymous";
	img.onload = () => {
		const colorThief = new ColorThief();
		const dominant = colorThief.getColor(img);

		if (dominant) {
			dominantColor = rgbaArrayToHex(dominant);
		}

		const colors = colorThief.getPalette(img, 5);

		// conver to hex string
		const hexColors = colors?.map((c) => rgbaArrayToHex(c));

		palette = hexColors || [];
	};
};

const card = $derived(composeLevelCard($form.rankCard));

const palettes = $derived.by(() => {
	const hslas = [hexToHsla(dominantColor)];

	const pregen = hslas.flatMap((hsla) => generateEnhancedPalettes(hsla));

	// Convert each HSLA color back to HEX
	return pregen.map((palette) => Object.values(palette).map((hslaColor) => hslaColor));
});

onMount(() => {
	if ($form.rankCard.wrapperImage) {
		// handleImageUpload($form.rankCard.wrapperImage);
		// handleImageUpload(page.data.session?.user?.image);
	} else {
	}
});

const rankCardWrapperImage = fileProxy(form, "rankCard.wrapperImage");

const multipliers = [0.25, 0.5, 1, 1.5, 2];
</script>

<!-- <SuperDebug data={$form} /> -->

<form class="stack" method="POST" action="?/save" use:enhance>
  <!-- Leveling Up -->
  <LevelingUp form={settingsForm} />
  <TextLeveling form={settingsForm} />
  <LevelUpRewards form={settingsForm} />

  <DashboardCard
    title="Server Leveling Card"
    description="Configure the default leveling card for your server."
  >
    <div class="stack space-m">
      <div class="max-w-form stack">
        <Field form={settingsForm} name="allowCustomRankCard">
          <Control
            label="Block users from customizing their leveling card"
            description="Card customization commands will be disabled for your server."
            orientation="horizontal"
          >
            {#snippet children({ props })}
              <Switch {...props} bind:checked={$form.allowCustomRankCard} />
            {/snippet}
          </Control>
        </Field>
      </div>
      <p class="fw:md">Preview</p>
      <div class="cluster align-start">
        <div class="max-w-card stack" style="flex: 1;">
          <LevelingCardPreview
            bind:card={$form.rankCard}
            user={{
              username: "Alexis",
              greeting: "Beep Boop o/",
              level: 10,
              curExp: 100,
              maxExp: 200,
              reputation: 100,
              rank: 1,
              badges: [],
            }}
          />
        </div>
        <!-- <div class="flow">
          <p class="fw:md">Accessibility Checker</p>
          {#if $form.rankCard.textColor && $form.rankCard.overlayColor}
            {@const textColorRgba = hslaToRgba($form.rankCard.textColor)}
            {@const overlayColorRgba = hslaToRgba($form.rankCard.overlayColor)}
            {@const contrastRatio = getContrastRatio(
              textColorRgba,
              overlayColorRgba,
            )}
            <p>
              Contrast Ratio (Text vs. Overlay): {formatContrastRatio(
                contrastRatio,
              )}
            </p>
            {#if contrastRatio < 4.5}
              <p class="warning" style="color: red;">
                Warning: Text color may not have sufficient contrast against the
                overlay color. Consider adjusting colors for better readability.
                WCAG AA requires a contrast ratio of 4.5:1 for normal text.
              </p>
            {/if}
          {:else}
            <p>Select text and overlay colors to check contrast.</p>
          {/if}
        </div> -->
      </div>
      <div>
        <div class="with-sidebar">
          <div class="flow max-w-form">
            <Field form={settingsForm} name="boost">
              <Control label="Border Radius">
                {#snippet children({ props })}
                  <ToggleGroup.Root
                    type="single"
                    bind:value={
                      () => card.borderRadius as never,
                      (v) => {
                        $form.rankCard.borderRadius = v;
                      }
                    }
                    class="cluster space-xs"
                    {...props}
                  >
                    {#each [0, 5, 10, 15, 20] as radius}
                      <ToggleGroup.Item value={radius as never}>
                        {#snippet child({ props })}
                          <button class="box radius-preview" {...props}>
                            <div class="stack space-2xs center">
                              <div
                                class="square"
                                style:--radius={`${radius}px`}
                              ></div>
                            </div>
                          </button>
                        {/snippet}
                      </ToggleGroup.Item>
                    {/each}
                  </ToggleGroup.Root>
                {/snippet}
              </Control>
            </Field>
            <Field form={settingsForm} name="rankCard.fontFamily">
              <Control label="Font Type">
                {#snippet children({ props })}
                  <ToggleGroup.Root
                    bind:value={$form.rankCard.fontFamily}
                    type="single"
                    class="cluster space-xs"
                  >
                    {#each [{ label: "Sans-serif", value: "SANS_SERIF" }, { label: "Serif", value: "SERIF" }, { label: "Monospace", value: "MONOSPACE" }, { label: "Handwritten", value: "HANDWRITTEN" }, { label: "Cursive", value: "CURSIVE" }] as font}
                      <ToggleGroup.Item value={font.value}>
                        {#snippet child({ props })}
                          <button class="box font-preview" {...props}>
                            <div class="stack space-2xs center">
                              <p
                                class={[
                                  "fs:sm fw:bold",
                                  {
                                    "font-monospace":
                                      font.value === "MONOSPACE",
                                    "font-serif": font.value === "SERIF",
                                    "font-sans": font.value === "SANS_SERIF",
                                    "font-cursive": font.value === "CURSIVE",
                                    "font-handwritten":
                                      font.value === "HANDWRITTEN",
                                  },
                                ]}
                              >
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
            <Field form={settingsForm} name="rankCard.overlayColor.a">
              <Control label="Overlay Opacity">
                {#snippet children({ props })}
                  <Slider
                    type="single"
                    min={0}
                    max={100}
                    step={1}
                    bind:value={
                      () => getHSLAOpacity(hslaToObj(card.overlayColor)) * 100,
                      (v) => {
                        const overlayColor = hslaToObj(card.overlayColor);
                        const overlayAccentColor = hslaToObj(
                          card.overlayAccentColor,
                        );
                        $form.rankCard.overlayColor = setHSLAOpacity(
                          overlayColor,
                          v / 100,
                        );
                        $form.rankCard.overlayAccentColor = setHSLAOpacity(
                          overlayAccentColor,
                          v / 100,
                        );
                      }
                    }
                    {...props}
                  />
                {/snippet}
              </Control>
            </Field>
            <div class="stack">
              <Field form={settingsForm} name="rankCard.wrapperImage">
                <Control label="Background Image">
                  {#snippet children({ props })}
                    <ImageUpload
                      {...props}
                      bind:url={$form.rankCard.wrapperImage}
                      onNewImage={handleImageUpload}
                    />
                  {/snippet}
                </Control>
              </Field>
              <div class="cluster no-wrap">
                <div class="swatch lg" style:--color={dominantColor}></div>
                <div class="cluster">
                  {#each palette as color}
                    <div class="swatch" style:--color={color}></div>
                  {/each}
                </div>
              </div>
            </div>
          </div>
          <div class="flow max-w-form">
            <Field form={settingsForm} name="addRolesOnJoin">
              <Control
                label="Dynamically Style Card"
                description="Use user avatar colors to style the leveling card."
                orientation="horizontal"
              >
                {#snippet children({ props })}
                  <Switch {...props} checked />
                {/snippet}
              </Control>
            </Field>
            <div class="cluster">
              {#each palettes as palette}
                <div class="box palette-show cluster">
                  <RadioGroup value="1" class="cluster space-2xs">
                    <div
                      class="cluster space-none"
                      onclick={() => {
                        // apply palette
                        $form.rankCard.overlayColor = palette[0];
                        $form.rankCard.overlayAccentColor = palette[1];
                        $form.rankCard.progressBarColor = palette[2];
                        $form.rankCard.textColor = palette[3];
                        $form.rankCard.subtextColor = palette[4];
                      }}
                    >
                      {#each palette as color}
                        <div
                          class="color"
                          style:--color={hslaToStr(color)}
                        ></div>
                      {/each}
                    </div>
                  </RadioGroup>
                </div>
              {/each}
            </div>
            <Field form={settingsForm} name="rankCard.wrapperColor">
              <Control label="Background Color">
                {#snippet children({ props })}
                  <ColorPicker
                    showSelectedColor
                    bind:color={
                      () => card.wrapperColor,
                      (value) => {
                        $form.rankCard.wrapperColor = hexToHsla(value);
                      }
                    }
                    {...props}
                  />
                {/snippet}
              </Control>
            </Field>
            <Field form={settingsForm} name="rankCard.overlayColor">
              <Control label="Overlay Color">
                {#snippet children({ props })}
                  <ColorPicker
                    {...props}
                    showSelectedColor
                    bind:color={
                      () => card.overlayColor,
                      (value) => {
                        const hsla = hexToHsla(value);
                        const light = isLight(hsla);
                        $form.rankCard.overlayColor = hsla;
                        hsla.l += light ? -10 : 10;
                        $form.rankCard.overlayAccentColor = hsla;
                        if (light) {
                          hsla.l = 10;
                          $form.rankCard.textColor = hsla;
                          hsla.l = 30;
                          $form.rankCard.subtextColor = hsla;
                        } else {
                          hsla.l = 90;
                          $form.rankCard.textColor = hsla;
                          hsla.l = 70;
                          $form.rankCard.subtextColor = hsla;
                        }
                      }
                    }
                    {...props}
                  />
                {/snippet}
              </Control>
            </Field>
            <Field form={settingsForm} name="rankCard.progressBarColor">
              <Control label="Progress Bar Color">
                {#snippet children({ props })}
                  <ColorPicker
                    showSelectedColor
                    bind:color={
                      () => card.progressBarColor,
                      (value) => {
                        $form.rankCard.progressBarColor = hexToHsla(value);
                      }
                    }
                    {...props}
                  />
                {/snippet}
              </Control>
            </Field>
            <Field form={settingsForm} name="rankCard.textColor">
              <Control label="Text Color">
                {#snippet children({ props })}
                  <ColorPicker
                    showSelectedColor
                    bind:color={
                      () => card.textColor,
                      (value) => {
                        $form.rankCard.textColor = hexToHsla(value);
                      }
                    }
                    {...props}
                  />
                {/snippet}
              </Control>
            </Field>
          </div>
        </div>
      </div>
    </div>
  </DashboardCard>
  <Restrictions
    title="Role Restrictions"
    description="Restrict which roles are allowed to gain exp."
    type="role"
    form={settingsForm}
    items={data.guild.itemizedRoles}
  />
  <Restrictions
    title="Channel Restrictions"
    description="Restrict which channels users can gain exp in."
    type="channel"
    form={settingsForm}
    items={data.guild.itemizedChannels}
  />
</form>

<style>
  .with-sidebar {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-l);
  }

  .with-sidebar > :last-child {
    flex-grow: 1;
    flex-basis: 25rem;
  }

  .with-sidebar > :first-child {
    flex-basis: 0;
    flex-grow: 999;
    min-inline-size: 45%;
  }

  .palette-show {
    --bg: var(--clr-bg-input);
    --padding: 0;
    --gap: 0px;
    --radius: 0.35rem;
    overflow: hidden;
  }

  .color {
    width: 1rem;
    height: 2.5rem;
    background-color: var(--color);
  }

  .swatch {
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    background-color: var(--color);
  }

  .swatch.lg {
    width: 2.5rem;
    height: 2.5rem;
  }

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

  .font-preview[data-state="on"],
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

    border-bottom-right-radius: 2px;
  }
</style>
