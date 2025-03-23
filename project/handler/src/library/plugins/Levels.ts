import type { REST } from "@discordjs/rest";
import { logger } from "@riceball/logger";
import { getGuild, getMember, prisma, updateMember } from "db";
import {
	Routes,
	type APIGuild,
	type APIGuildMember,
	type APIMessage,
	type GatewayMessageCreateDispatchData,
	type Snowflake,
} from "discord-api-types/v10";
import Redis from "ioredis";
import { CacheKeys, Deps } from "library/common";
import { API, getGuild as getAPIGuild, sendMessage } from "library/core";
import { RestrictionChecker } from "library/utilities/restriction-checker";
import { inject, injectable } from "tsyringe";

@injectable()
export class Levels {
	private redis: Redis;
	private proxy: REST;

	public constructor(@inject(Deps.Redis) redis: Redis, @inject(API) proxy: REST) {
		this.redis = redis;
		this.proxy = proxy;
	}

	/**
	 * Get the xp requirement for a level
	 * @param level - The level to get the xp requirement for
	 * @returns The xp requirement for the level
	 *
	 * @example
	 * const xpReq = this.xpReq(10);
	 * console.log(xpReq); // 10000
	 */
	public expReq(level: number): number {
		return 6 * level ** 2 + 80 * level + 100;
	}

	/**
	 * Get the total xp requirement for a level
	 * @param level - The level to get the total xp requirement for
	 * @returns The total xp requirement for the level
	 *
	 * @example
	 * const totalXpReq = this.totalXpReq(10);
	 * console.log(totalXpReq); // 10000
	 * */
	public totalXpReq(level: number): number {
		let xp = 0;
		while (level > 0) {
			xp += this.expReq(level);

			level--;
		}
		return xp;
	}

	/**
	 * Get the level from xp
	 * @param {number} xp - The xp to get the level from
	 * @returns {number} The level
	 *
	 * @example
	 * const level = this.getLevel(10000);
	 * console.log(level); // 10
	 **/
	public getLvl(xp: number): number {
		let level = 1;
		while (xp >= this.expReq(level)) {
			xp -= this.expReq(level);
			level++;
		}
		return level;
	}

	/**
	 * Get the progress of a level
	 * @param {number} xp - The xp to get the progress from
	 * @returns {number} The progress
	 *
	 * @example
	 * const progress = this.getProgress(10000);
	 * console.log(progress); // 0
	 * */
	public getProgress(xp: number): number {
		let level = 1;
		while (xp >= this.expReq(level)) {
			xp -= this.expReq(level);
			level++;
		}
		return xp;
	}

	/**
	 * Handles the process of giving experience points (EXP) to a user based on their text message activity in a guild.
	 *
	 * @param guild - The guild where the message was sent.
	 * @param message - The message data from the gateway event.
	 *
	 * @returns A promise that resolves when the EXP has been given and roles have been updated if necessary.
	 *
	 * @remarks
	 * - This function checks if the user is restricted from gaining EXP.
	 * - It ensures that the user is not on cooldown before giving EXP.
	 * - The amount of EXP given is determined by the guild's level settings.
	 * - If the user's level changes after receiving EXP, their roles are updated accordingly.
	 */
	public async giveTextExp(message: GatewayMessageCreateDispatchData) {
		if (!message.guild_id || !message.member) return;

		// member does not have "user" property on "MESSAGE_CREATE"
		const { member, author } = message;

		const { levels } = await getGuild(message.guild_id);

		if (!RestrictionChecker.isRestricted(levels, message)) {
			const cooldownKey = CacheKeys.TextExpCooldown(message.guild_id, author.id);

			if (await this.redis.exists(cooldownKey)) return;

			const guild = await getAPIGuild(message.guild_id);

			const { textRateMin, textRateMax, textCooldown } = levels;

			await this.redis.set(cooldownKey, "1", "EX", textCooldown);

			const { exp } = await getMember(guild.id, author.id);

			const currentLvl = this.getLvl(exp);
			const expToGive = textRateMax ? ~~(Math.random() * textRateMax) + textRateMin : textRateMin;

			await updateMember(guild.id, author.id, {
				exp: exp + expToGive,
			});

			if (currentLvl !== this.getLvl(exp + expToGive)) {
				return this.updateRoles(guild, member, message);
			}
		}
	}

	/**
	 * Updates the roles of a guild member based on their experience level.
	 *
	 * @param guild - The guild where the member belongs.
	 * @param member - The guild member whose roles are to be updated.
	 * @param message - The message that triggered the role update.
	 * @returns A promise that resolves when the roles have been updated.
	 *
	 * @remarks
	 * This method retrieves the guild's leveling rewards and the member's experience points.
	 * It then calculates the member's level and updates their roles accordingly.
	 * If `levels.stackRewards` is true, roles from all levels up to the member's current level are added.
	 * Otherwise, only roles from the member's current level are added.
	 * If an error occurs during the role update, it logs the error and attempts to delete invalid rewards.
	 * Finally, if `levels.notifyEnabled` is true, it sends a notification message to the specified channel.
	 *
	 * @throws Will log an error if the role update fails.
	 */
	public async updateRoles(guild: APIGuild, member: APIGuildMember, message: APIMessage) {
		const { levels } = await getGuild(guild.id);

		const { exp } = await getMember(guild.id, message.author.id);
		const lvl = this.getLvl(exp);

		try {
			if (levels.stackRewards) {
				const roles = new Set(member.roles);

				const toAdd = levels.rewards.flatMap(({ level, roles }) => {
					return level <= lvl ? roles : [];
				});
				const toRmv = levels.rewards.flatMap(({ level, roles }) => {
					return level > lvl ? roles : [];
				});

				toAdd.forEach((role) => roles.add(role));
				toRmv.forEach((role) => roles.delete(role));

				if (roles.size !== member.roles.length) {
					this.proxy.patch(Routes.guildMember(guild.id, message.author.id), {
						body: {
							roles: Array.from(roles),
						},
					});
				}
			} else {
				const roles = new Set(member.roles);

				const toAdd = levels.rewards.flatMap(({ level, roles }) => {
					return level === lvl ? roles : [];
				});
				const toRmv = levels.rewards.flatMap(({ level, roles }) => {
					return level < lvl || level > lvl ? roles : [];
				});

				toAdd.forEach((role) => roles.add(role));
				if (levels.rewards.some(({ level }) => level === lvl)) {
					toRmv.forEach((role) => roles.delete(role));
				}

				const highestRewardRole = levels.rewards
					.filter(({ level }) => level <= lvl)
					.reduce(
						(highest, reward) => {
							return reward.level > highest.level ? reward : highest;
						},
						{ id: "", level: -1, roles: [] },
					).roles;

				highestRewardRole.forEach((role) => roles.add(role));

				if (roles.size !== member.roles.length) {
					this.proxy.patch(Routes.guildMember(guild.id, message.author.id), {
						body: {
							roles: Array.from(roles),
						},
					});
				}
			}
		} catch (error) {
			logger.error("Failed to update roles");
			logger.trace(error);

			for (const { roles } of levels.rewards) {
				for (const roleId of roles) {
					if (!guild.roles.some((r) => r.id === roleId)) {
						await this.deleteReward(guild, lvl, roles, roleId);
					}
				}
			}
		} finally {
			if (levels.notifyDestination) {
				const location = levels.notifyChannel ?? message.channel_id;

				void sendMessage(guild.id, location, message.id, {
					description: `Congratulations ${member.nick}! You have reached level ${lvl}`,
				});
			}
		}
	}

	/**
	 * Deletes a reward role from a specific level in a guild.
	 *
	 * @param guild - The guild from which the reward role is to be deleted.
	 * @param lvl - The level associated with the reward role.
	 * @param allRoles - An array of all role IDs associated with the level.
	 * @param toRemove - The role ID to be removed from the level.
	 * @returns A promise that resolves when the reward role has been deleted.
	 */
	private async deleteReward(guild: APIGuild, lvl: number, allRoles: Snowflake[], toRemove: Snowflake) {
		const roles = allRoles.filter((role) => role !== toRemove);

		await prisma.levelingReward.update({
			where: {
				guildLevel: {
					level: lvl,
					guildId: guild.id,
				},
			},
			data: {
				roles: {
					set: roles,
				},
			},
		});
	}

	/**
	 * Get the rank of a member
	 * @param guildId - The id of the guild to get the rank from
	 * @param userId - The id of the user to get the rank from
	 * */
	public async getMemberRank(guildId: string, userId: string) {
		const leaderboard = await this.getLeaderboard(guildId);
		return leaderboard.findIndex((member) => member.userId === userId) + 1;
	}

	/**
	 * Get the leaderboard of a guild
	 * @param guildId - The id of the guild to get the leaderboard from
	 * */
	public getLeaderboard(guildId: string) {
		return prisma.member.findMany({
			where: {
				guildId,
			},
			select: {
				userId: true,
				exp: true,
			},
			orderBy: {
				exp: "desc",
			},
		});
	}
}

export interface LeaderboardMember {
	member: string;
	xp: number;
}
