<script lang="ts">
import { AlertDialog, AspectRatio } from "bits-ui";
import { XIcon } from "lucide-svelte";
import ImageUpIcon from "lucide-svelte/icons/image-up";
import Trash2Icon from "lucide-svelte/icons/trash-2";
import Cropper, { type CropArea, type OnCropCompleteEvent } from "svelte-easy-crop";
import Button from "$lib/blocks/button/button.svelte";
import { Slider } from "$lib/blocks/slider/slider";

let {
	url = $bindable(),
	w = $bindable(null),
	h = $bindable(null),
	ratio = $bindable(760 / 224),
	cropper = $bindable(true),
	previewMode = false,
	onNewImage = $bindable(() => {}),
} = $props();

let inputElement: HTMLInputElement | null = $state(null);

let cropModalOpen = $state(false);
let crop = $state({ x: 0, y: 0 });
let zoom = $state(1);

let croppedAreaPixels: CropArea | null = $state(null);
let imageSrc: string | null = $state(null);

function handleFileChange(event: Event) {
	const file = (event.target as HTMLInputElement).files?.[0];
	if (file) {
		const reader = new FileReader();
		reader.onload = (e) => {
			imageSrc = e.target?.result as string;
			if (cropper) {
				cropModalOpen = true;
			} else {
				url = imageSrc;
			}
		};
		reader.readAsDataURL(file);
	}
}

function handleClick() {
	inputElement?.click();
}

function deleteImage(e: MouseEvent) {
	e.stopPropagation();
	url = null;
	if (inputElement) {
		inputElement.value = "";
	}
}

async function onCropComplete(e: OnCropCompleteEvent) {
	croppedAreaPixels = e.pixels;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
	new Promise((resolve, reject) => {
		const image = new Image();
		image.setAttribute("crossOrigin", "anonymous");
		image.addEventListener("load", () => resolve(image));
		image.addEventListener("error", (error) => reject(error));
		image.src = url;
	});

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 * @param {File} src - Image File url
 * @param {CropArea} pixelCrop - pixelCrop Object provided by react-easy-crop
 */
async function getCroppedImg(src: string, { width, height, x, y }: CropArea) {
	const image = await createImage(src);
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");

	if (!ctx) {
		throw new Error("Could not create canvas context");
	}

	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

	// return new Promise((resolve, reject) => {
	// 	canvas.toBlob((file) => {
	// 		if (!file) reject(new Error("Canvas is empty"));
	// 		else resolve(file);
	// 	}, "image/jpeg");
	// });

	return canvas.toDataURL();
}

async function handleCrop() {
	if (!imageSrc || !croppedAreaPixels) {
		return;
	}

	const croppedImageUrl = await getCroppedImg(imageSrc, croppedAreaPixels);
	if (croppedImageUrl) {
		console.log({ croppedImageUrl });
		url = croppedImageUrl;
		onNewImage(croppedImageUrl);
		cropModalOpen = false;
	}
}

const closeModal = () => {
	cropModalOpen = false;
};
</script>

<AlertDialog.Root bind:open={cropModalOpen}>
  <AlertDialog.Portal>
    <AlertDialog.Overlay />
    <AlertDialog.Content>
      {#snippet child({ props })}
        <div {...props} class="box flow content space-l">
          <AlertDialog.Title class="repel">
            <h4>Crop Image</h4>
            <Button variant="icon-only" onclick={closeModal}>
              <XIcon size={16} />
            </Button>
          </AlertDialog.Title>
          <AlertDialog.Description>
            <p>Crop the image to the desired size.</p>
          </AlertDialog.Description>
          {#if imageSrc}
            <AspectRatio.Root ratio={760 / 400}>
              <Cropper
                image={imageSrc}
                bind:crop
                bind:zoom
                aspect={760 / 224}
                oncropcomplete={onCropComplete}
              />
            </AspectRatio.Root>
            <p class="txt-muted fw-md">Zoom</p>
            <Slider
              type="single"
              min={1}
              max={3}
              step={0.1}
              bind:value={zoom}
            />
          {/if}
          <div class="cluster align-end">
            <AlertDialog.Cancel>
              {#snippet child({ props })}
                <Button {...props} variant="secondary">Cancel</Button>
              {/snippet}
            </AlertDialog.Cancel>
            <AlertDialog.Action onclick={handleCrop}>
              {#snippet child({ props })}
                <Button {...props}>Crop</Button>
              {/snippet}
            </AlertDialog.Action>
          </div>
        </div>
      {/snippet}
    </AlertDialog.Content>
  </AlertDialog.Portal>
</AlertDialog.Root>

{#if !previewMode}
  {#snippet content()}
    <div
      class={["upload-container", { sm: w || h }]}
      onclick={handleClick}
      onkeydown={(e) => e.key === "Enter" && handleClick()}
      tabindex="0"
      role="button"
    >
      {#if url && url.length}
        <img src={url} alt="" />
        <div class="delete-overlay">
          <button class="delete-button" onclick={deleteImage}>
            <Trash2Icon size={24} />
          </button>
        </div>
      {:else}
        <ImageUpIcon size={48} />
      {/if}
      <input
        type="file"
        accept="image/*"
        onchange={handleFileChange}
        bind:this={inputElement}
        hidden
      />
    </div>
  {/snippet}

  {#if w || h}
    <div style={`width: ${w}px; height: ${h}px;`}>
      {@render content()}
    </div>
  {:else}
    <AspectRatio.Root {ratio}>
      {@render content()}
    </AspectRatio.Root>
  {/if}
{/if}

<style>
  .upload-container {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border: dashed 1.75px var(--clr-bg-border-light);
    border-radius: var(--border-radius);
    padding: 0.3rem;
    transition-property: border-color;
    transition-duration: var(--input-transition-duration);
    transition-timing-function: var(--input-transition-timing-function);
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
  }

  .upload-container.sm {
    border-radius: 0.3rem;
    padding: 0;
  }

  .upload-container > img {
    border: none;
    border-radius: var(--border-radius);
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
  }

  .upload-container:hover {
    border-color: var(--clr-bg-border-hover);
  }

  .upload-container:focus-visible {
    border-color: var(--clr-bg-border-hover);
    box-shadow: 0 0 0 0.225rem hsl(var(--clr-bg-border-hover-hsl) / 0.05);
  }

  .delete-overlay {
    position: absolute;
    top: 0.3rem;
    left: 0.3rem;
    right: 0.3rem;
    bottom: 0.3rem;
    border-radius: var(--border-radius);
    background-color: var(--clr-bg-translucent);
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: all 0.3s ease;
  }

  .upload-container:hover .delete-overlay {
    opacity: 1;
  }

  .delete-button {
    background: none;
    border: none;
    color: var(--txt-bold);
    cursor: pointer;
    transition: color 0.3s ease;
  }

  .delete-button:hover {
    color: var(--clr-theme-error);
  }

  .content {
    --padding: var(--space-m);
    --space: var(--space-l);
    position: fixed;
    left: 50%;
    top: 50%;
    z-index: 50;
    display: grid;
    max-width: calc(100% - var(--space-xs));
    width: 35rem;
    max-height: calc(100% - var(--space-xs));
    transform: translate(-50%, -50%);
  }

  :global {
    [data-alert-dialog-overlay] {
      position: fixed;
      inset: 0;
      z-index: 50;
      background-color: var(--clr-bg-translucent);
      backdrop-filter: blur(0.15rem);
    }

    [data-alert-dialog-overlay][data-state="open"] {
      animation: fadeIn 0.3s ease-out;
    }

    [data-alert-dialog-overlay][data-state="closed"] {
      animation: fadeOut 0.3s ease-in;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes fadeOut {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }

    [data-alert-dialog-content][data-state="open"] {
      animation:
        fadeIn 0.1s ease-out,
        zoomIn 0.1s ease-out;
    }

    [data-alert-dialog-content][data-state="closed"] {
      animation:
        fadeOut 0.1s ease-in,
        zoomOut 0.1s ease-in;
    }

    @keyframes zoomIn {
      from {
        transform: translate(-50%, -50%) scale(0.95);
      }
      to {
        transform: translate(-50%, -50%) scale(1);
      }
    }

    @keyframes zoomOut {
      from {
        transform: translate(-50%, -50%) scale(1);
      }
      to {
        transform: translate(-50%, -50%) scale(0.95);
      }
    }
  }

  .controls {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
</style>
