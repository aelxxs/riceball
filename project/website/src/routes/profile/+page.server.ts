import type { FontFamily } from "@riceball/db";
import { CardSchema } from "@riceball/db/zod";
import { redirect } from "@sveltejs/kit";
import { type RESTGetAPICurrentUserGuildsResult, Routes } from "discord-api-types/v10";
import { superValidate } from "sveltekit-superforms";
import { zod4 as zod } from "sveltekit-superforms/adapters";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();

	if (!session?.user) {
		throw redirect(303, "/");
	}
	// Discord user ID is in the sub claim or id field
	const userId = (session.user as any).sub || (session.user as any).id || session.user.email;

	if (!userId) {
		throw redirect(303, "/");
	}

	// Get user settings (reputation, bio, etc.)
	const userSettings = await locals.db.getUserSettings(userId);

	// Get all guilds the user is in and has manage permissions for
	const userGuilds = (await locals.userApi.get(Routes.userGuilds(), {
		authPrefix: "Bearer",
	})) as RESTGetAPICurrentUserGuildsResult;

	// For each guild, fetch the member settings to get the rank card configuration
	const guildsWithCards = await Promise.all(
		userGuilds.map(async (guild) => {
			try {
				// Check if bot is in guild
				const guildData = await locals.api.get(Routes.guild(guild.id));
				const memberSettings = await locals.db.getMemberSettings(guild.id, userId);
				const guildSettings = await locals.db.getGuildSettings(guild.id);

				return {
					id: guild.id,
					name: guild.name,
					icon: guild.icon,
					card: memberSettings.card,
					exp: memberSettings.exp,
					guildSettings: guildSettings.levels,
					form: await superValidate(memberSettings.card, zod(CardSchema)),
				};
			} catch (error) {
				// Guild not accessible or bot not in guild
				return null;
			}
		}),
	);

	const validGuilds = guildsWithCards.filter((g): g is Exclude<typeof g, null> => g !== null);

	return {
		user: {
			id: userId,
			name: session.user.name,
			image: session.user.image,
			email: session.user.email,
		},
		userSettings,
		guilds: validGuilds,
	};
};

export const actions: Actions = {
	updateCard: async ({ locals, request }) => {
		const session = await locals.auth();

		if (!session?.user) {
			throw redirect(303, "/");
		}
		const userId = (session.user as any).sub || (session.user as any).id || session.user.email;

		if (!userId) {
			throw redirect(303, "/");
		}

		const formData = await request.formData();
		const guildId = formData.get("guildId") as string;

		const form = await superValidate(formData, zod(CardSchema));

		if (!form.valid || !guildId) {
			return { success: false, form };
		}

		await locals.db.setMemberSettings(guildId, userId, {
			card: {
				...form.data,
				fontFamily: form.data.fontFamily as FontFamily,
			},
		});

		return { success: true, form, guildId };
	},
};
