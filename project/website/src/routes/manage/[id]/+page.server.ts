import { updateGuild } from "@riceball/db";
import { type Actions, error } from "@sveltejs/kit";

export const actions: Actions = {
	togglePlugin: async ({ request, params, locals }) => {
		const formData = await request.formData();
		const pluginId = formData.get("pluginId")?.toString();
		const enabled = formData.get("enabled") === "true";

		if (!pluginId) throw error(400, "Plugin ID is required.");

		// await updateGuild(params.id, {
		// 	[pluginId]: {
		// 		enabled,
		// 	},
		// });

		return {
			enabled,
		};
	},
};
