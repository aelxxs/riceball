import { ReactionRole, wrap } from "@riceball/db";
import type { Actions, ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = async ({ params, locals, fetch }) => {
	const database = locals.db.rm.em.fork();
	const allReactionRoles = await database.findAll(ReactionRole, {
		where: { guildId: params.id },
	});

	console.log({ allReactionRoles });

	allReactionRoles;
	return {
		reactionRoles: JSON.parse(JSON.stringify(allReactionRoles)) as ReactionRole[],
	};
};

export const actions: Actions = {};
