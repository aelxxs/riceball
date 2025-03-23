<script lang="ts">
  import {
    Slider as SliderPrimitive,
    Tooltip,
    type WithoutChildrenOrChild,
  } from "bits-ui";

  let {
    ref = $bindable(null),
    value = $bindable([0]),
    ticks: tickLabels,
    ...restProps
  }: WithoutChildrenOrChild<
    SliderPrimitive.RootProps & {
      ticks?: any[];
    }
  > = $props();

  const val = $derived.by(() => tickLabels?.[Math.round(value as number)]);
</script>

<div style="width: 100%;">
  <Tooltip.Provider delayDuration={0}>
    <SliderPrimitive.Root bind:value={value as never} bind:ref {...restProps}>
      {#snippet children({ thumbs, ticks })}
        <div class="stack" style="cursor: pointer; width: 100%;">
          {#if tickLabels}
            <div class="ticks">
              {#each ticks as index}
                <SliderPrimitive.Tick {index}>
                  {#snippet child({ props })}
                    <small
                      class="tick txt-muted"
                      class:active={val === tickLabels[index]}
                      {...props}
                    >
                      {tickLabels[index]}x
                    </small>
                  {/snippet}
                </SliderPrimitive.Tick>
              {/each}
            </div>
            <div></div>
          {/if}
          <div class="root">
            <div class="container">
              <SliderPrimitive.Range>
                {#snippet child({ props })}
                  <span
                    class="range"
                    class:range-transition={tickLabels}
                    {...props}
                  ></span>
                {/snippet}
              </SliderPrimitive.Range>
            </div>
            {#each thumbs as thumb}
              <!-- <Tooltip.Root> -->
              <SliderPrimitive.Thumb index={thumb}>
                {#snippet child({ props: thumbProps })}
                  <!-- <Tooltip.Trigger> -->
                  <!-- {#snippet child({ props: triggerProps })} -->
                  <div
                    {...thumbProps}
                    class="thumb"
                    class:thumb-transition={tickLabels}
                  >
                    <span class="thumb"></span>
                  </div>
                  <!-- {/snippet} -->
                  <!-- </Tooltip.Trigger> -->
                {/snippet}
              </SliderPrimitive.Thumb>
              <!-- <Tooltip.Content sideOffset={8}>
                  <div class="box tooltip-content">
                    <small>{Math.round(value as number)}%</small>
                  </div>
                </Tooltip.Content> -->
              <!-- </Tooltip.Root> -->
            {/each}
          </div>
        </div>
      {/snippet}
    </SliderPrimitive.Root>
  </Tooltip.Provider>
</div>

<style>
  .ticks {
    position: relative;
  }

  .root {
    cursor: pointer;
    position: relative;
    user-select: none;
    touch-action: none;
    width: 100%;
    height: 100%;
    display: flex;
    flex-grow: 1;
    align-items: center;
  }

  .container {
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    width: 100%;
    height: 6px;
    border-radius: 9999px;
  }

  .range {
    position: absolute;
    background-color: var(--clr-theme-2);
    border-radius: 9999px;
    height: 12px;
  }

  .range-transition {
    transition:
      left 0.15s ease-out,
      right 0.15s ease-out;
  }

  .thumb {
    outline: none;
    cursor: pointer;
    display: block;
    width: 16px;
    height: 16px;
    background-color: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
  }

  .thumb-transition {
    transition:
      transform 0.15s,
      left 0.15s ease-out;
  }

  .thumb:hover {
    transform: scale(1.1);
  }

  .thumb:active {
    transform: scale(1.2);
  }

  .thumb:focus {
    outline: none;
    box-shadow: 0 0 0 0.225rem hsl(var(--clr-bg-border-hover-hsl) / 0.05);
  }

  .root::before {
    content: "";
    position: absolute;
    width: 100%;
    height: 6px;
    background-color: var(--clr-bg-input);
    border-radius: 9999px;
  }

  .tick {
    cursor: pointer;
    transition: all 0.3s ease-out;
  }

  .tick:hover {
    color: var(--txt-bold);
  }

  .tick.active {
    font-weight: 500;
    color: var(--txt-bold) !important;
  }

  .tooltip-content {
    position: relative;
    background-color: var(--clr-bg-input);
    color: var(--txt-bold);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
  }

  /* arrow */
  .tooltip-content::after {
    content: "";
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 6px 6px 0 6px;
    border-color: var(--clr-bg-input) transparent transparent transparent;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
  }
</style>
