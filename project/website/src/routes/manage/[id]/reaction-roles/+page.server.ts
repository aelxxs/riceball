import { ReactionRole } from "@riceball/db";
import type { Actions, ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = async ({ params, locals, fetch }) => {
	const database = locals.db.rm.em.fork();
	const allReactionRoles = await database.findAll(ReactionRole, { populate: ["*"], where: { guildId: params.id } });

	console.dir({ allReactionRoles: JSON.parse(JSON.stringify(allReactionRoles)) }, { depth: null });
	return { reactionRoles: JSON.parse(JSON.stringify(allReactionRoles)) as ReactionRole[] };
};

export const actions: Actions = {};
