import { z } from "zod";

export const EDITABLE_ITEM_TYPES = ["ROLES", "BADGE", "STATIC"] as const;

const unlimitedOrAtLeast = (min: number) =>
	z
		.number()
		.int()
		.refine((value) => value === -1 || value >= min, {
			message: `Must be -1 (unlimited) or at least ${min}`,
		});

export const ShopItemSchema = z
	.object({
		id: z.string().default(""),
		type: z.enum(EDITABLE_ITEM_TYPES).default("ROLES"),
		name: z.string().trim().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
		icon: z.string().trim().max(64).default(""),
		about: z.string().trim().max(150, "Description must be 150 characters or less").default(""),
		price: z.number().int().min(0, "Price cannot be negative").max(1_000_000_000).default(100),
		stock: unlimitedOrAtLeast(0).default(-1),
		limit: unlimitedOrAtLeast(1).default(1),
		roles: z.string().array().max(5, "Select up to 5 roles").default([]),
		badge: z.string().trim().max(512).default(""),
		autoUse: z.boolean().default(false),
	})
	.superRefine((item, ctx) => {
		if (item.type === "ROLES" && item.roles.length === 0) {
			ctx.addIssue({ code: "custom", path: ["roles"], message: "Select at least one role" });
		}
	});

export type ShopItemForm = z.infer<typeof ShopItemSchema>;
