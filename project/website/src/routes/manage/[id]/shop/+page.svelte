<script lang="ts">
import ArchiveIcon from "lucide-svelte/icons/archive";
import ArchiveRestoreIcon from "lucide-svelte/icons/archive-restore";
import AtSignIcon from "lucide-svelte/icons/at-sign";
import AwardIcon from "lucide-svelte/icons/award";
import PackageIcon from "lucide-svelte/icons/package";
import PencilIcon from "lucide-svelte/icons/pencil";
import Trash2Icon from "lucide-svelte/icons/trash-2";
import { tick } from "svelte";
import { toast } from "svelte-sonner";
import { superForm } from "sveltekit-superforms";
import { zod4Client } from "sveltekit-superforms/adapters";
import { enhance } from "$app/forms";
import { Button } from "$lib/blocks/button";
import { ButtonWithConfirmation } from "$lib/blocks/button-with-confirmation";
import { DashboardCard } from "$lib/blocks/dashboard-card";
import { Control, Field } from "$lib/blocks/forms";
import { Input } from "$lib/blocks/input";
import { Select } from "$lib/blocks/select";
import { DiscordEntitySelect } from "$lib/blocks/select-discord";
import { Switch } from "$lib/blocks/switch";
import { ShopItemSchema } from "./schema";

const { data } = $props();

type ShopItem = (typeof data.items)[number];

const guild = $derived(data.guild);
const blank = { ...data.form.data, roles: [] as string[] };

const typeItems = [
	{ value: "ROLES", label: "Role", icon: AtSignIcon },
	{ value: "BADGE", label: "Badge", icon: AwardIcon },
	{ value: "STATIC", label: "Collectible", icon: PackageIcon },
];

const typeLabels: Record<string, string> = {
	ROLES: "Role",
	BADGE: "Badge",
	STATIC: "Collectible",
	CUSTOM: "Custom",
};

const assignableRoles = $derived(
	guild.roles
		.filter((role) => role.id !== guild.id && !role.managed)
		.map((role) => ({ value: role.id, label: role.name })),
);

const form = superForm(data.form, {
	dataType: "json",
	resetForm: false,
	validators: zod4Client(ShopItemSchema),
	onUpdated: ({ form: result }) => {
		if (result.valid) {
			toast.success(editing ? "Item updated." : "Item created.");
			startCreate();
		} else if (result.errors._errors?.length) {
			toast.error(result.errors._errors[0]);
		}
	},
});

const { form: formData, enhance: formEnhance, submitting } = form;

const editing = $derived(Boolean($formData.id));
const activeItems = $derived(data.items.filter((item) => item.active));
const archivedItems = $derived(data.items.filter((item) => !item.active));

const economy = $derived(guild.settings?.economy);

let editorEl = $state<HTMLElement | null>(null);
let actionForm = $state<HTMLFormElement | null>(null);
let pendingAction = $state("");
let pendingId = $state("");

const formatPrice = (amount: number) => {
	const icon = economy?.currencyIcon || economy?.currencyName || "";
	const value = amount.toLocaleString();
	if (!icon) return value;
	return economy?.currencyIconLocation === "RIGHT" ? `${value} ${icon}` : `${icon} ${value}`;
};

const formatAmount = (amount: number) => (amount === -1 ? "Unlimited" : amount.toLocaleString());

const roleName = (roleId: string) => guild.roles.find((role) => role.id === roleId)?.name ?? "Deleted role";

function startCreate() {
	form.reset({ newState: blank });
}

async function startEdit(item: ShopItem) {
	const values = {
		id: item.id,
		type: item.type as (typeof blank)["type"],
		name: item.name,
		icon: item.icon,
		about: item.about,
		price: item.price,
		stock: item.stock,
		limit: item.limit,
		roles: [...item.roles],
		badge: item.badge,
		autoUse: item.autoUse,
	};
	form.reset({ newState: values });
	await tick();
	editorEl?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function runAction(action: "toggleArchive" | "delete", item: ShopItem) {
	pendingAction = action;
	pendingId = item.id;
	await tick();
	actionForm?.requestSubmit();
}
</script>

<form
  hidden
  method="POST"
  action={`?/${pendingAction}`}
  bind:this={actionForm}
  use:enhance={() =>
    async ({ result, update }) => {
      if (result.type === "success") {
        if (pendingAction === "delete") {
          toast.success("Item deleted.");
          if ($formData.id === pendingId) startCreate();
        } else {
          toast.success(
            result.data?.active ? "Item restored to the shop." : "Item archived.",
          );
        }
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      await update();
    }}
>
  <input type="hidden" name="id" value={pendingId} />
</form>

<div class="stack">
  <div bind:this={editorEl}>
    <DashboardCard
      title={editing ? `Edit ${$formData.name || "item"}` : "Create an Item"}
      description={editing
        ? "Changes apply to the shop immediately after saving."
        : "Add a new item members can buy with server currency."}
    >
      <form method="POST" action="?/save" use:formEnhance class="flow max-w-form">
        <Field {form} name="type">
          <Control label="Item Type" description="What members receive when they buy this item.">
            {#snippet children({ props })}
              <Select
                {...props}
                bind:value={$formData.type}
                items={typeItems}
                placeholder="Select an item type"
              />
            {/snippet}
          </Control>
        </Field>

        <div class="cluster no-wrap align-start">
          <Field {form} name="icon">
            <Control label="Icon" description="An emoji.">
              {#snippet children({ props })}
                <Input {...props} bind:value={$formData.icon} placeholder="🎁" maxlength={64} />
              {/snippet}
            </Control>
          </Field>
          <div class="grow">
            <Field {form} name="name">
              <Control label="Name" description="Must be unique in this shop.">
                {#snippet children({ props })}
                  <Input
                    {...props}
                    bind:value={$formData.name}
                    placeholder="VIP Pass"
                    maxlength={100}
                    required
                  />
                {/snippet}
              </Control>
            </Field>
          </div>
        </div>

        <Field {form} name="about">
          <Control label="Description" description="Shown in /shop. Up to 150 characters.">
            {#snippet children({ props })}
              <textarea
                {...props}
                class="textarea"
                bind:value={$formData.about}
                placeholder="What does this item do?"
                maxlength={150}
                rows={3}
              ></textarea>
            {/snippet}
          </Control>
        </Field>

        {#if $formData.type === "ROLES"}
          <Field {form} name="roles">
            <Control label="Roles" description="Roles given to the member when the item is used (up to 5).">
              {#snippet children({ props })}
                <DiscordEntitySelect
                  {...props}
                  type="role"
                  max={5}
                  items={assignableRoles}
                  bind:selected={$formData.roles}
                />
              {/snippet}
            </Control>
          </Field>
        {:else if $formData.type === "BADGE"}
          <Field {form} name="badge">
            <Control label="Badge" description="Emoji or image URL shown on the member's rank card.">
              {#snippet children({ props })}
                <Input {...props} bind:value={$formData.badge} placeholder="🏆" maxlength={512} />
              {/snippet}
            </Control>
          </Field>
        {/if}

        <Field {form} name="price">
          <Control label="Price" description="Cost in server currency. Use 0 for a free item.">
            {#snippet children({ props })}
              <Input
                {...props}
                type="number"
                label={economy?.currencyIcon || undefined}
                bind:value={$formData.price}
                min="0"
                step="1"
                required
              />
            {/snippet}
          </Control>
        </Field>

        <div class="cluster align-start">
          <div class="grow stack space-xs">
            <Field {form} name="stock">
              <Control label="Unlimited stock" orientation="horizontal">
                {#snippet children({ props })}
                  <Switch
                    {...props}
                    bind:checked={
                      () => $formData.stock === -1,
                      (unlimited) => ($formData.stock = unlimited ? -1 : 10)
                    }
                  />
                {/snippet}
              </Control>
            </Field>
            {#if $formData.stock !== -1}
              <Field {form} name="stock">
                <Control label="Stock" screenReaderOnly>
                  {#snippet children({ props })}
                    <Input
                      {...props}
                      type="number"
                      label="In stock:"
                      bind:value={$formData.stock}
                      min="0"
                      step="1"
                    />
                  {/snippet}
                </Control>
              </Field>
            {/if}
          </div>
          <div class="grow stack space-xs">
            <Field {form} name="limit">
              <Control label="No purchase limit" orientation="horizontal">
                {#snippet children({ props })}
                  <Switch
                    {...props}
                    bind:checked={
                      () => $formData.limit === -1,
                      (unlimited) => ($formData.limit = unlimited ? -1 : 1)
                    }
                  />
                {/snippet}
              </Control>
            </Field>
            {#if $formData.limit !== -1}
              <Field {form} name="limit">
                <Control label="Limit per member" screenReaderOnly>
                  {#snippet children({ props })}
                    <Input
                      {...props}
                      type="number"
                      label="Per member:"
                      bind:value={$formData.limit}
                      min="1"
                      step="1"
                    />
                  {/snippet}
                </Control>
              </Field>
            {/if}
          </div>
        </div>

        <Field {form} name="autoUse">
          <Control
            label="Use on purchase"
            description="Use the item immediately instead of adding it to the inventory."
            orientation="horizontal"
          >
            {#snippet children({ props })}
              <Switch {...props} bind:checked={$formData.autoUse} />
            {/snippet}
          </Control>
        </Field>

        <div class="cluster">
          <Button type="submit" disabled={$submitting}>
            {editing ? "Save changes" : "Create item"}
          </Button>
          {#if editing}
            <Button variant="secondary" onclick={startCreate}>Cancel</Button>
          {/if}
        </div>
      </form>
    </DashboardCard>
  </div>

  {#snippet itemList(items: ShopItem[], emptyMessage: string)}
    {#if items.length === 0}
      <p class="txt-muted">{emptyMessage}</p>
    {:else}
      <div class="grid items">
        {#each items as item (item.id)}
          <article class="box item stack space-s" class:selected={$formData.id === item.id}>
            <div class="repel align-start">
              <div class="cluster no-wrap space-xs identity">
                <span class="icon" aria-hidden="true">{item.icon || "🛍️"}</span>
                <div class="stack space-3xs">
                  <p class="fw:md name">{item.name}</p>
                  <small class="txt-muted">{typeLabels[item.type] ?? item.type}</small>
                </div>
              </div>
              <p class="price fw:bold">{formatPrice(item.price)}</p>
            </div>

            {#if item.about}
              <p class="txt-muted about">{item.about}</p>
            {/if}

            {#if item.type === "ROLES" && item.roles.length}
              <div class="cluster space-2xs">
                {#each item.roles as roleId}
                  <span class="role cluster no-wrap">
                    <AtSignIcon size={12} />
                    <small>{roleName(roleId)}</small>
                  </span>
                {/each}
              </div>
            {/if}

            <dl class="cluster meta">
              <div>
                <dt class="txt-muted">Stock</dt>
                <dd>{formatAmount(item.stock)}</dd>
              </div>
              <div>
                <dt class="txt-muted">Limit</dt>
                <dd>{formatAmount(item.limit)}</dd>
              </div>
              {#if item.autoUse}
                <div>
                  <dt class="txt-muted">Use</dt>
                  <dd>On purchase</dd>
                </div>
              {/if}
            </dl>

            <div class="cluster space-2xs actions">
              {#if item.type !== "CUSTOM"}
                <Button size="sm" variant="secondary" onclick={() => startEdit(item)}>
                  <PencilIcon size={14} />&nbsp;Edit
                </Button>
              {/if}
              <Button size="sm" variant="secondary" onclick={() => runAction("toggleArchive", item)}>
                {#if item.active}
                  <ArchiveIcon size={14} />&nbsp;Archive
                {:else}
                  <ArchiveRestoreIcon size={14} />&nbsp;Unarchive
                {/if}
              </Button>
              <ButtonWithConfirmation
                title="Delete item"
                description={`Delete "${item.name}"? It will also be removed from every member's inventory and badges. This cannot be undone.`}
                onConfirm={() => runAction("delete", item)}
              >
                {#snippet button()}
                  <Button size="icon" variant="destructive" aria-label={`Delete ${item.name}`}>
                    <Trash2Icon size={14} />
                  </Button>
                {/snippet}
              </ButtonWithConfirmation>
            </div>
          </article>
        {/each}
      </div>
    {/if}
  {/snippet}

  <DashboardCard title="Shop Items" description="Items members can currently buy with /buy.">
    {@render itemList(activeItems, "Your shop is empty. Create an item above to get started.")}
  </DashboardCard>

  <DashboardCard
    title="Archived Items"
    description="Archived items are hidden from the shop but stay in members' inventories."
  >
    {@render itemList(archivedItems, "No archived items.")}
  </DashboardCard>
</div>

<style>
  .textarea {
    width: 100%;
    resize: vertical;
    font: inherit;
    color: var(--txt-main);
    padding: var(--space-xs);
    border: var(--glass-border-medium);
    border-radius: var(--border-radius);
    background: var(--navbar-bg);
    outline: none;
    transition:
      border-color 0.15s ease,
      background 0.15s ease;
  }

  .textarea:hover {
    background: var(--glass-bg-light);
  }

  .textarea:focus-visible {
    border: var(--glass-border-hover);
    background: var(--glass-bg-medium);
  }

  .textarea::placeholder {
    color: var(--txt-main);
    opacity: 0.75;
  }

  .grow {
    flex: 1;
  }

  .items {
    --minimum: 18rem;
  }

  .item {
    --bg: var(--clr-bg-input);
    border: 1px solid transparent;
  }

  .item.selected {
    border: var(--glass-border-strong);
  }

  .identity {
    min-width: 0;
  }

  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: var(--border-radius);
    background-color: var(--clr-bg-input-hover);
    font-size: 1.1rem;
  }

  .name {
    color: var(--txt-bold);
    overflow-wrap: anywhere;
  }

  .price {
    color: var(--txt-bold);
    white-space: nowrap;
  }

  .about {
    overflow-wrap: anywhere;
  }

  .role {
    --cluster-gap: var(--space-3xs);
    padding: 0.2rem 0.6rem;
    border-radius: var(--radius-full);
    color: var(--txt-themed);
    background-color: var(--clr-bg-input-hover);
  }

  .meta {
    --cluster-gap: var(--space-m);
    margin: 0;
  }

  .meta dt {
    font-size: 0.8rem;
  }

  .meta dd {
    margin: 0;
    color: var(--txt-main);
  }

  .actions {
    margin-top: auto;
  }
</style>
