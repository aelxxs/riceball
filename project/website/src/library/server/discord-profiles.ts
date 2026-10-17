import type { REST } from "@discordjs/rest";
import { type APIGuildMember, type APIUser, Routes } from "discord-api-types/v10";

export type DiscordProfile = {
	id: string;
	name: string;
	avatar: string;
	inGuild?: boolean;
};

const UNKNOWN_MEMBER = 10007;
const UNKNOWN_USER = 10013;

function defaultAvatar(userId: string) {
	let index = 0;
	try {
		index = Number((BigInt(userId) >> 22n) % 6n);
	} catch {}
	return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}

export function fallbackProfile(userId: string): DiscordProfile {
	return {
		id: userId,
		name: `User ${userId.slice(-4)}`,
		avatar: defaultAvatar(userId),
	};
}

function errorCode(error: unknown) {
	return typeof error === "object" && error && "code" in error ? (error as { code?: number }).code : undefined;
}

function userAvatar(user: APIUser) {
	return user.avatar
		? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
		: defaultAvatar(user.id);
}

export async function fetchUserProfile(userId: string, rest?: REST): Promise<DiscordProfile> {
	if (!rest) return fallbackProfile(userId);

	try {
		const user = (await rest.get(Routes.user(userId))) as APIUser;
		return { id: user.id, name: user.global_name || user.username, avatar: userAvatar(user) };
	} catch (error) {
		if (errorCode(error) !== UNKNOWN_USER) {
			console.error("Failed to fetch user profile", { userId, error });
		}
		return fallbackProfile(userId);
	}
}

/**
 * Prefers the guild member (nickname, guild avatar) and falls back to the global user
 * for members that have left the guild.
 */
export async function fetchMemberProfile(guildId: string, userId: string, rest?: REST): Promise<DiscordProfile> {
	if (!rest) return fallbackProfile(userId);

	try {
		const member = (await rest.get(Routes.guildMember(guildId, userId))) as APIGuildMember;
		const user = member.user;
		return {
			id: userId,
			name: member.nick || user.global_name || user.username,
			avatar: member.avatar
				? `https://cdn.discordapp.com/guilds/${guildId}/users/${userId}/avatars/${member.avatar}.png?size=128`
				: userAvatar(user),
			inGuild: true,
		};
	} catch (error) {
		if (errorCode(error) !== UNKNOWN_MEMBER) {
			console.error("Failed to fetch member profile", { guildId, userId, error });
		}
		return { ...(await fetchUserProfile(userId, rest)), inGuild: false };
	}
}
