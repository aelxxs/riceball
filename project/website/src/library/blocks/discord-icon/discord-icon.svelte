<script lang="ts">
import { CDN } from "@discordjs/rest";
import { Avatar } from "bits-ui";

type Props = {
	type?: "app" | "guild" | "user";
	size?: number;

	id: string;
	icon: string | null;
	name: string;
};

const { id, size = 12, type, icon, name }: Props = $props();

const cdn = new CDN();

let iconUrl: string = $state("");
switch (type) {
	case "app":
		if (icon) {
			iconUrl = cdn.appIcon(id, icon);
		} else {
			iconUrl = cdn.defaultAvatar((Number.parseInt(id) >> 22) % 6);
		}
		break;
	case "guild":
		if (icon) {
			iconUrl = cdn.icon(id, icon);
		}
		break;
	case "user":
		if (icon) {
			iconUrl = cdn.avatar(id, icon);
		} else {
			iconUrl = cdn.defaultAvatar((Number.parseInt(id) >> 22) % 6);
		}
		break;
}

const getAcryonym = (name: string) =>
	name.replace(/\w+/g, (name) => name[0]).replace(/\s/g, "");
</script>

<Avatar.Root
  class="icon-container"
  style="--size: {size}rem"
  loadingStatus="loaded"
>
  {#snippet child({ props })}
    <div {...props}>
      <Avatar.Image class="icon" src={iconUrl} alt={name}>
        {#snippet child({ props })}
          <img {...props} />
        {/snippet}
      </Avatar.Image>
      <Avatar.Fallback class="icon with-border">
        {#snippet child({ props })}
          <div {...props}>
            {getAcryonym(name)}
          </div>
        {/snippet}
      </Avatar.Fallback>
    </div>
  {/snippet}
</Avatar.Root>

<style>
  .icon-container {
    width: var(--size);
    height: var(--size);
    font-size: calc(var(--size) / 2.95);
  }

  .icon {
    width: 100%;
    height: 100%;
    background-color: var(--clr-bg);
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    opacity: 100%;
  }

  .icon.with-border {
    border: 1px solid var(--border, var(--clr-bg-border));
  }
</style>
