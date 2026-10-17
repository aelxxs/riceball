import type { APIInteractionDataResolved, APIUser } from "discord-api-types/v10";
import type { Context } from "library/core";

/**
 * Ensure a user picked in an economy admin command is a human member of the server.
 */
export function assertEconomyTarget({ i }: Context, user: APIUser) {
	if (user.bot) {
		throw "Bots don't have a balance.";
	}

	const resolved = "data" in i ? (i.data as { resolved?: APIInteractionDataResolved }).resolved : undefined;

	if (!resolved?.members?.[user.id]) {
		throw `${user.username} isn't a member of this server.`;
	}
}
