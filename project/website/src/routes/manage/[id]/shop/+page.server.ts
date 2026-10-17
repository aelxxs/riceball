import { type Database, Item, ItemType, Member } from "@riceball/db";
import { type Actions, fail } from "@sveltejs/kit";
import { setError, superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";
import { ShopItemSchema } from "./schema";

type ShopItem = {
	id: string;
	type: `${ItemType}`;
	name: string;
	icon: string;
	about: string;
	price: number;
	stock: number;
	limit: number;
	roles: string[];
	badge: string;
	autoUse: boolean;
	active: boolean;
};

const toShopItem = (item: Item): ShopItem => ({
	id: String(item._id),
	type: item.type,
	name: item.name,
	icon: item.icon ?? "",
	about: item.about ?? "",
	price: item.price,
	stock: item.stock,
	limit: item.limit,
	roles: item.data?.roles ?? [],
	badge: item.data?.badge ?? "",
	autoUse: item.autoUse,
	active: item.active,
});

const OBJECT_ID = /^[0-9a-f]{24}$/i;

const findItem = (db: Database, guildId: string, id: unknown) => {
	if (typeof id !== "string" || !OBJECT_ID.test(id)) return null;
	return db.rm.items.findOne({ id, guildId });
};

/**
 * Members keep a copy of the item (inventory name, equipped badges); go through the settings cache so the bot
 * doesn't keep serving stale member data from Redis.
 */
async function updateItemHolders(
	db: Database,
	guildId: string,
	itemId: string,
	update: (member: Member) => Partial<Pick<Member, "inventory" | "badges">>,
) {
	const holders = await db.rm.em
		.getCollection(Member)
		.find(
			{ guildId, $or: [{ "inventory.itemId": itemId }, { "badges.itemId": itemId }] },
			{ projection: { userId: 1 } },
		)
		.toArray();

	await Promise.all(
		holders.map(async ({ userId }) => {
			const member = await db.getMemberSettings(guildId, userId);
			await db.setMemberSettings(guildId, userId, update(member));
		}),
	);
}

export const load: PageServerLoad = async ({ locals, params }) => {
	const items = await locals.db.rm.items.find({ guildId: params.id }, { orderBy: { price: "ASC", name: "ASC" } });

	return {
		items: items.map(toShopItem),
		form: await superValidate(zod(ShopItemSchema)),
	};
};

export const actions: Actions = {
	save: async ({ locals, params, request }) => {
		const form = await superValidate(request, zod(ShopItemSchema));

		if (!form.valid || !params.id) {
			return fail(400, { form });
		}

		const { db } = locals;
		const { id, roles, badge, ...fields } = form.data;

		const items = await db.rm.items.find({ guildId: params.id });
		const nameTaken = items.some(
			(item) => String(item._id) !== id && item.name.trim().toLowerCase() === fields.name.toLowerCase(),
		);

		if (nameTaken) {
			return setError(form, "name", "An item with this name already exists.");
		}

		let item: Item | undefined;

		if (id) {
			item = items.find((existing) => String(existing._id) === id);
			if (!item) {
				return setError(form, "", "This item no longer exists.", { status: 404 });
			}
		} else {
			item = new Item();
			item.guildId = params.id;
			db.rm.em.persist(item);
		}

		const previousName = item.name;

		db.rm.items.assign(item, {
			...fields,
			type: fields.type as ItemType,
			icon: fields.icon || undefined,
			about: fields.about || undefined,
			data: {
				roles: fields.type === ItemType.ROLES ? roles : undefined,
				badge: fields.type === ItemType.BADGE ? badge || undefined : undefined,
				script: item.data?.script,
			},
		});

		await db.rm.em.flush();

		if (id && previousName !== item.name) {
			const name = item.name;
			await updateItemHolders(db, params.id, id, (member) => ({
				inventory: member.inventory.map((entry) => (entry.itemId === id ? { ...entry, name } : entry)),
			}));
		}

		return { form };
	},

	toggleArchive: async ({ locals, params, request }) => {
		const item = await findItem(locals.db, params.id, (await request.formData()).get("id"));

		if (!item) {
			return fail(404, { message: "Item not found." });
		}

		item.active = !item.active;
		await locals.db.rm.em.flush();

		return { active: item.active };
	},

	delete: async ({ locals, params, request }) => {
		const { db } = locals;
		const item = await findItem(db, params.id, (await request.formData()).get("id"));

		if (!item) {
			return fail(404, { message: "Item not found." });
		}

		const itemId = String(item._id);
		await db.rm.em.remove(item).flush();

		await updateItemHolders(db, params.id, itemId, (member) => ({
			inventory: member.inventory.filter((entry) => entry.itemId !== itemId),
			badges: member.badges.filter((badge) => badge.itemId !== itemId),
		}));

		return { deleted: itemId };
	},
};
