import type { Guild } from "@riceball/db";
import { fail } from "@sveltejs/kit";

import type { Actions, PageServerLoad } from "./$types";

const PLUGIN_KEYS = ["levels", "economy", "stars"] as const satisfies readonly (keyof Guild)[];

type PluginKey = (typeof PLUGIN_KEYS)[number];

const isPluginKey = (value: string): value is PluginKey => (PLUGIN_KEYS as readonly string[]).includes(value);

export const load: PageServerLoad = async ({ locals, params }) => {
	const [settings, membersWithExp, reactionRoleMenus, shopItems] = await Promise.all([
		locals.db.getGuildSettings(params.id),
		locals.db.rm.members.count({ guildId: params.id, exp: { $gt: 0 } }),
		locals.db.rm.reactionRoles.count({ guildId: params.id }),
		locals.db.rm.items.count({ guildId: params.id, active: true }),
	]);

	return {
		plugins: Object.fromEntries(
			PLUGIN_KEYS.map((key) => [key, { enabled: settings[key]?.enabled ?? true }]),
		) as Record<PluginKey, { enabled: boolean }>,
		stats: {
			membersWithExp,
			reactionRoleMenus,
			shopItems,
			starboardChannelId: settings.stars?.channelId ?? null,
		},
	};
};

export const actions: Actions = {
	togglePlugin: async ({ request, params, locals }) => {
		const formData = await request.formData();
		const pluginId = formData.get("pluginId")?.toString();
		const enabled = formData.get("enabled")?.toString();

		if (!pluginId || !isPluginKey(pluginId)) {
			return fail(400, { message: "Unknown plugin." });
		}

		if (enabled !== "true" && enabled !== "false") {
			return fail(400, { message: "Invalid enabled value." });
		}

		await locals.db.setGuildSettings(params.id, {
			[pluginId]: { enabled: enabled === "true" },
		});

		return { pluginId, enabled: enabled === "true" };
	},
};
