import type { REST } from "@discordjs/rest";
import {
	Badge,
	CurrencyIconLocation,
	Database,
	type Economy as EconomySettings,
	InventoryItem,
	Item,
	type ItemData,
	ItemType,
	Member,
} from "@riceball/db";
import { Routes, type Snowflake } from "discord-api-types/v10";
import { Deps } from "library/common";
import { container, inject, injectable } from "tsyringe";

type EntityManager = Database["em"];

const OBJECT_ID = /^[a-f\d]{24}$/i;

// Item documents are mutated from short-lived transaction forks, so always re-read them.
const FIND_OPTIONS = { orderBy: { price: "asc" }, refresh: true } as const;

export const UNLIMITED = -1;

export interface CreateItemInput {
	name: string;
	type: ItemType;
	price: number;
	stock: number;
	about?: string;
	icon?: string;
	limit?: number;
	data?: Partial<ItemData>;
}

export type UpdateItemInput = Partial<Pick<Item, "name" | "price" | "stock" | "about" | "limit" | "icon" | "active">>;

export interface MemberSnapshot {
	bal: number;
	inventory: InventoryItem[];
}

export interface PurchaseResult {
	item: Item;
	bal: number;
	used: boolean;
}

export interface UseResult {
	item: Item;
	remaining: number;
}

export interface TradeOffer {
	itemId: string;
	requestItemId?: string;
	price?: number;
}

/**
 * Shop and inventory logic. Failures that should be shown to the user are thrown as strings,
 * matching how command runners surface errors.
 */
@injectable()
export class Economy {
	private readonly db: Database;

	public constructor(@inject(Database) db: Database) {
		this.db = db;
	}

	public async getSettings(guildId: Snowflake): Promise<EconomySettings> {
		const { economy } = await this.db.getGuildSettings(guildId);

		if (!economy.enabled) {
			throw "The Economy plugin is disabled in this server.";
		}

		return economy;
	}

	public formatCurrency(economy: EconomySettings, amount: number) {
		const value = amount.toLocaleString();
		return economy.currencyIconLocation === CurrencyIconLocation.RIGHT
			? `${value} ${economy.currencyIcon}`
			: `${economy.currencyIcon} ${value}`;
	}

	public fetchItems(guildId: Snowflake) {
		return this.db.rm.items.find({ guildId }, FIND_OPTIONS);
	}

	public fetchActiveItems(guildId: Snowflake) {
		return this.db.rm.items.find({ guildId, active: true }, FIND_OPTIONS);
	}

	public fetchArchivedItems(guildId: Snowflake) {
		return this.db.rm.items.find({ guildId, active: false }, FIND_OPTIONS);
	}

	/**
	 * Resolve an item from an autocomplete value (its id) or, if the user typed freely, its name.
	 */
	public async fetchItem(guildId: Snowflake, idOrName: string, em: EntityManager = this.db.rm.em) {
		if (OBJECT_ID.test(idOrName)) {
			const item = await em.findOne(Item, { id: idOrName, guildId }, { refresh: true });
			if (item) return item;
		}

		const name = idOrName.trim().toLowerCase();
		const items = await em.find(Item, { guildId }, { refresh: true });

		return items.find((item) => item.name.toLowerCase() === name) ?? null;
	}

	public async searchItems(guildId: Snowflake, input: string, filter: { active?: boolean } = {}) {
		const query = input.trim().toLowerCase();
		const items = await this.db.rm.items.find(
			{ guildId, ...(filter.active !== undefined && { active: filter.active }) },
			FIND_OPTIONS,
		);

		return items.filter((item) => item.name.toLowerCase().includes(query)).slice(0, 25);
	}

	public async searchInventory(guildId: Snowflake, userId: Snowflake, input: string) {
		const query = input.trim().toLowerCase();
		const { inventory } = await this.db.getMemberSettings(guildId, userId);

		return inventory
			.filter((entry) => entry.name.toLowerCase().includes(query))
			.slice(0, 25)
			.map((entry) => ({ name: `${entry.name} (x${entry.amount})`, value: entry.itemId }));
	}

	public async createItem(guildId: Snowflake, input: CreateItemInput) {
		const item = this.db.rm.items.create({
			guildId,
			name: input.name,
			type: input.type,
			price: input.price,
			stock: input.stock,
			about: input.about,
			icon: input.icon,
			limit: input.limit ?? 1,
			data: input.data,
			active: true,
			autoUse: false,
			persist: false,
		});

		await this.db.rm.em.persist(item).flush();

		return item;
	}

	public async updateItem(guildId: Snowflake, itemOrId: Item | string, changes: UpdateItemInput) {
		const item = typeof itemOrId === "string" ? await this.fetchItem(guildId, itemOrId) : itemOrId;

		if (!item) {
			throw "Item not found. Please ensure the item exists in your server's shop.";
		}

		const renamed = changes.name !== undefined && changes.name !== item.name;

		this.db.rm.items.assign(item, changes);
		await this.db.rm.em.flush();

		if (renamed) {
			await this.renameInventoryEntries(guildId, item);
		}

		return item;
	}

	/**
	 * Delete an item and remove it from every member's inventory and badges.
	 */
	public async deleteItem(guildId: Snowflake, itemId: string) {
		const { item, members } = await this.transaction(async (em) => {
			const item = await this.fetchItem(guildId, itemId, em);

			if (!item) {
				throw "Item not found. Please ensure the item exists in your server's shop.";
			}

			const id = item._id.toString();
			const members = await em.find(Member, {
				guildId,
				$or: [{ inventory: { itemId: id } }, { badges: { itemId: id } }],
			});

			for (const member of members) {
				member.inventory = member.inventory.filter((entry) => entry.itemId !== id);
				member.badges = member.badges.filter((badge) => badge.itemId !== id);
			}

			em.remove(item);

			return { item, members };
		});

		await Promise.all(
			members.map((member) =>
				this.db.setMemberSettings(guildId, member.userId, {
					inventory: member.inventory,
					badges: member.badges,
				}),
			),
		);

		return item;
	}

	public async fetchInventory(guildId: Snowflake, userId: Snowflake) {
		const { inventory } = await this.db.getMemberSettings(guildId, userId);

		if (!inventory.length) {
			return [];
		}

		const items = await this.db.rm.items.find(
			{ guildId, id: { $in: inventory.map((entry) => entry.itemId) } },
			{ refresh: true },
		);
		const byId = new Map(items.map((item) => [item._id.toString(), item]));

		return inventory.map((entry) => ({ ...entry, item: byId.get(entry.itemId) ?? null }));
	}

	public async purchase(guildId: Snowflake, userId: Snowflake, itemId: string): Promise<PurchaseResult> {
		const economy = await this.getSettings(guildId);
		await this.db.getMemberSettings(guildId, userId);

		const result = await this.transaction(async (em) => {
			const item = await this.fetchItem(guildId, itemId, em);

			if (!item?.active) {
				throw "That item is not available in the shop.";
			}

			if (item.stock === 0) {
				throw `\`${item.name}\` is out of stock.`;
			}

			const member = await em.findOneOrFail(Member, { guildId, userId });

			if (member.bal < item.price) {
				throw `You don't have enough to buy \`${item.name}\`. You are ${this.formatCurrency(economy, item.price - member.bal)} short.`;
			}

			const id = item._id.toString();

			if (item.type === ItemType.BADGE && member.badges.some((badge) => badge.itemId === id)) {
				throw `You already own the \`${item.name}\` badge.`;
			}

			const used = economy.autoUseItems || item.autoUse;

			if (used) {
				await this.applyItem(guildId, member, item);
			} else {
				this.addToInventory(member, item, economy);
			}

			member.bal -= item.price;

			if (item.stock !== UNLIMITED) {
				item.stock -= 1;
				if (item.stock === 0) item.active = false;
			}

			return { item, used, bal: member.bal, inventory: member.inventory, badges: member.badges };
		});

		await this.db.setMemberSettings(guildId, userId, {
			bal: result.bal,
			inventory: result.inventory,
			badges: result.badges,
		});

		return { item: result.item, bal: result.bal, used: result.used };
	}

	public async use(guildId: Snowflake, userId: Snowflake, itemId: string): Promise<UseResult> {
		await this.getSettings(guildId);
		await this.db.getMemberSettings(guildId, userId);

		const result = await this.transaction(async (em) => {
			const member = await em.findOneOrFail(Member, { guildId, userId });
			const item = await this.fetchOwnedItem(
				em,
				guildId,
				member,
				itemId,
				"You don't have that item in your inventory.",
			);

			await this.applyItem(guildId, member, item);
			const remaining = this.removeFromInventory(member, item._id.toString());

			return { item, remaining, inventory: member.inventory, badges: member.badges };
		});

		await this.db.setMemberSettings(guildId, userId, {
			inventory: result.inventory,
			badges: result.badges,
		});

		return { item: result.item, remaining: result.remaining };
	}

	public async gift(guildId: Snowflake, fromId: Snowflake, toId: Snowflake, itemId: string) {
		const economy = await this.getSettings(guildId);

		if (fromId === toId) {
			throw "You can't gift an item to yourself.";
		}

		await this.db.getMemberSettings(guildId, fromId);
		await this.db.getMemberSettings(guildId, toId);

		const result = await this.transaction(async (em) => {
			const [from, to] = await this.fetchMembers(em, guildId, fromId, toId);
			const item = await this.fetchOwnedItem(
				em,
				guildId,
				from,
				itemId,
				"You don't have that item in your inventory.",
			);

			this.removeFromInventory(from, item._id.toString());
			this.addToInventory(to, item, economy, "Their inventory");

			return { item, from: this.snapshot(from), to: this.snapshot(to) };
		});

		await this.syncMembers(guildId, [fromId, result.from], [toId, result.to]);

		return result.item;
	}

	/**
	 * Swap items (and optionally currency) between two members in a single transaction.
	 */
	public async trade(guildId: Snowflake, fromId: Snowflake, toId: Snowflake, offer: TradeOffer) {
		const economy = await this.getSettings(guildId);
		const price = offer.price ?? 0;

		if (fromId === toId) {
			throw "You can't trade with yourself.";
		}

		await this.db.getMemberSettings(guildId, fromId);
		await this.db.getMemberSettings(guildId, toId);

		const result = await this.transaction(async (em) => {
			const [from, to] = await this.fetchMembers(em, guildId, fromId, toId);

			const offered = await this.fetchOwnedItem(
				em,
				guildId,
				from,
				offer.itemId,
				"The item offered in this trade is no longer in the sender's inventory.",
			);

			const requested = offer.requestItemId
				? await this.fetchOwnedItem(
						em,
						guildId,
						to,
						offer.requestItemId,
						"The item requested in this trade is no longer in your inventory.",
					)
				: null;

			if (to.bal < price) {
				throw `You don't have enough to complete this trade. You are ${this.formatCurrency(economy, price - to.bal)} short.`;
			}

			this.removeFromInventory(from, offered._id.toString());
			if (requested) this.removeFromInventory(to, requested._id.toString());

			this.addToInventory(to, offered, economy, "Your inventory");
			if (requested) this.addToInventory(from, requested, economy, "The sender's inventory");

			to.bal -= price;
			from.bal += price;

			return { offered, requested, from: this.snapshot(from), to: this.snapshot(to) };
		});

		await this.syncMembers(guildId, [fromId, result.from], [toId, result.to]);

		return { offered: result.offered, requested: result.requested, price };
	}

	private async renameInventoryEntries(guildId: Snowflake, item: Item) {
		const id = item._id.toString();

		const members = await this.transaction(async (em) => {
			const members = await em.find(Member, { guildId, inventory: { itemId: id } });

			for (const entry of members.flatMap((member) => member.inventory)) {
				if (entry.itemId === id) entry.name = item.name;
			}

			return members;
		});

		await Promise.all(
			members.map((member) => this.db.setMemberSettings(guildId, member.userId, { inventory: member.inventory })),
		);
	}

	private transaction<T>(cb: (em: EntityManager) => Promise<T>) {
		// A fresh fork guarantees we read current documents instead of a stale identity map.
		return this.db.em.fork({ clear: true }).transactional(cb);
	}

	private async fetchMembers(em: EntityManager, guildId: Snowflake, ...userIds: Snowflake[]) {
		return Promise.all(userIds.map((userId) => em.findOneOrFail(Member, { guildId, userId })));
	}

	private async fetchOwnedItem(em: EntityManager, guildId: Snowflake, member: Member, itemId: string, error: string) {
		const item = await this.fetchItem(guildId, itemId, em);

		if (!item || !member.inventory.some((entry) => entry.itemId === item._id.toString())) {
			throw error;
		}

		return item;
	}

	private snapshot(member: Member): MemberSnapshot {
		return { bal: member.bal, inventory: member.inventory };
	}

	private async syncMembers(guildId: Snowflake, ...members: [Snowflake, MemberSnapshot][]) {
		await Promise.all(members.map(([userId, data]) => this.db.setMemberSettings(guildId, userId, data)));
	}

	private addToInventory(member: Member, item: Item, economy: EconomySettings, owner = "Your inventory") {
		const id = item._id.toString();
		const existing = member.inventory.find((entry) => entry.itemId === id);

		if (existing) {
			if (item.limit !== UNLIMITED && existing.amount >= item.limit) {
				throw `${owner} already holds the maximum amount (${item.limit}) of \`${item.name}\`.`;
			}

			existing.amount += 1;
			return;
		}

		if (economy.inventorySize > 0 && member.inventory.length >= economy.inventorySize) {
			throw `${owner} is full (${economy.inventorySize}/${economy.inventorySize} items).`;
		}

		member.inventory = [
			...member.inventory,
			Object.assign(new InventoryItem(), { itemId: id, name: item.name, amount: 1 }),
		];
	}

	private removeFromInventory(member: Member, itemId: string) {
		const entry = member.inventory.find((data) => data.itemId === itemId);

		if (!entry) return 0;

		entry.amount -= 1;

		if (entry.amount < 1) {
			member.inventory = member.inventory.filter((data) => data.itemId !== itemId);
		}

		return Math.max(entry.amount, 0);
	}

	/**
	 * Apply an item's effect. Runs inside the transaction so a failed role grant rolls back the purchase/use.
	 */
	private async applyItem(guildId: Snowflake, member: Member, item: Item) {
		const id = item._id.toString();

		if (item.type === ItemType.BADGE) {
			if (member.badges.some((badge) => badge.itemId === id)) {
				throw `You already own the \`${item.name}\` badge.`;
			}

			member.badges = [...member.badges, Object.assign(new Badge(), { itemId: id, active: false, slot: 0 })];
			return;
		}

		if (item.type === ItemType.ROLES) {
			const roles = item.data?.roles ?? [];
			const rest = container.resolve<REST>(Deps.Rest);

			try {
				for (const role of roles) {
					await rest.put(Routes.guildMemberRole(guildId, member.userId, role), {
						reason: `Shop item: ${item.name}`,
					});
				}
			} catch {
				throw `I couldn't give you the role(s) for \`${item.name}\`. The role may have been deleted, or my role is below it / missing the Manage Roles permission.`;
			}
		}
	}
}
