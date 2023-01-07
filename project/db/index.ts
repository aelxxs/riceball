export * from "@prisma/client";

import { type Prisma, PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export const getGuild = (id: string) => {
	return prisma.guild.upsert({
		where: { id },
		create: {
			id,
			levels: {},
			stars: {},
			economy: {},
		},
		update: {},
	});
};

export const updateGuild = (id: string, query: Partial<Prisma.GuildCreateInput>) => {
	return prisma.guild.upsert({
		where: { id },
		create: {
			id,
			levels: {},
			stars: {},
			economy: {},
			...query,
		},
		update: {
			...query,
		},
	});
};

export const getLevelingRewards = (guildId: string) => {
	return prisma.levelingReward.findMany({
		where: { guildId },
	});
};

export const createLevelingReward = (guildId: string, level: number, reward: string) => {
	return prisma.levelingReward.create({
		data: {
			guildId,
			level,
			roles: [reward],
		},
	});
};

export const deleteLevelingReward = (guildId: string, level: number) => {
	return prisma.levelingReward.delete({
		where: {
			guildLevel: {
				guildId,
				level,
			},
		},
	});
};

export const getActiveShopItems = (guildId: string) => {
	return prisma.item.findMany({
		where: {
			guildId,
			active: true,
		},
	});
};

export const getMember = async (userId: string, guildId: string) => {
	return prisma.member.upsert({
		where: {
			guildMember: {
				guildId,
				userId,
			},
		},
		create: {
			guildId,
			userId,
			card: {},
		},
		update: {},
	});
};

export const updateMember = async (userId: string, guildId: string, query: Partial<Prisma.MemberCreateInput>) => {
	return prisma.member.upsert({
		where: {
			guildMember: {
				guildId,
				userId,
			},
		},
		create: {
			guildId,
			userId,
			card: {},
			...query,
		},
		update: {
			...query,
		},
	});
};

export const getMemberBadges = (userId: string, guildId: string) => {
	return prisma.member.aggregateRaw({
		pipeline: [
			{ $match: { guildId, userId } },
			{ $unwind: "$badges" },
			{ $lookup: { from: "items", localField: "badges.itemId", foreignField: "id", as: "badges" } },
			{ $unwind: "$badges" },
			{ $replaceRoot: { newRoot: "$badges" } },
		],
	});
};

export const getEquippedBadges = (userId: string, guildId: string) => {
	return prisma.member.aggregateRaw({
		pipeline: [
			{ $match: { guildId, userId } },
			{ $unwind: "$badges" },
			{ $match: { "badges.equipped": true } },
			{ $lookup: { from: "items", localField: "badges.itemId", foreignField: "id", as: "badges" } },
			{ $unwind: "$badges" },
			{ $replaceRoot: { newRoot: "$badges" } },
		],
	});
};

export const getMemberInventory = (userId: string, guildId: string) => {
	return prisma.member.aggregateRaw({
		pipeline: [
			{ $match: { guildId, userId } },
			{ $unwind: "$inventory" },
			{ $lookup: { from: "items", localField: "inventory.itemId", foreignField: "id", as: "inventory" } },
			{ $unwind: "$inventory" },
			{ $replaceRoot: { newRoot: "$inventory" } },
		],
	});
};

export const getUser = (id: string) => {
	return prisma.user.upsert({
		where: { id },
		create: {
			id,
		},
		update: {},
	});
};

export const updateUser = (id: string, query: Partial<Prisma.UserCreateInput>) => {
	return prisma.user.upsert({
		where: { id },
		create: {
			id,
			...query,
		},
		update: {
			...query,
		},
	});
};
