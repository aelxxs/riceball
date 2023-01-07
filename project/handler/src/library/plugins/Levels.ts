import { PrismaClient, prisma } from "db";
import { injectable, singleton } from "tsyringe";

@singleton()
export class Levels {
	// public constructor(public prisma: PrismaClient) {}
	/**
	 * Get the xp requirement for a level
	 * @param {number} level - The level to get the xp requirement for
	 * @returns {number} The xp requirement for the level
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
	 * @param {number} level - The level to get the total xp requirement for
	 * @returns {number} The total xp requirement for the level
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
	 * Get the rank of a member
	 * @param {string} guildId - The id of the guild to get the rank from
	 * @param {string} userId - The id of the user to get the rank from
	 * */
	public async getMemberRank(guildId: string, userId: string) {
		const leaderboard = await this.getLeaderboard(guildId);
		return leaderboard.findIndex((member) => member.userId === userId) + 1;
	}

	/**
	 * Get the leaderboard of a guild
	 * @param {string} guildId - The id of the guild to get the leaderboard from
	 * */
	public async getLeaderboard(guildId: string) {
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
