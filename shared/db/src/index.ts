import { Guild, Prisma, PrismaClient, Restriction, RestrictionType } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export * from "prisma-frontend";

const defaultRestriction = {
	type: RestrictionType.ALLOW_ALL,
	omit: [] as string[],
};

const roleRestriction = defaultRestriction;
const channelRestriction = defaultRestriction;

const notifyMessageEmbed = {
	title: "",
	description: "",
	color: undefined,
	fields: [],
	author: {
		name: "",
		icon_url: "",
	},
	footer: {
		text: "",
		icon_url: "",
	},
	image: {
		url: "",
	},
	thumbnail: {
		url: "",
	},
};

export const getGuild = (guildId: string): Promise<Guild> => {
	return prisma.guild.upsert({
		where: { id: guildId },
		create: {
			id: guildId,
			levels: {
				set: { channelRestriction, roleRestriction, notifyMessageEmbed, rankCard: {} },
			},
			stars: {
				set: { channelRestriction, roleRestriction },
			},
			economy: {
				set: { channelRestriction, roleRestriction },
			},
		},
		update: {},
	});
};

export type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends Array<infer I> ? Array<DeepPartial<I>> : DeepPartial<T[P]>;
};

export const updateGuild = (guildId: string, query: DeepPartial<Prisma.GuildCreateInput>) => {
	return prisma.guild.upsert({
		where: { id: guildId },
		create: {
			id: guildId,
			...query,
			levels: {
				set: {
					rankCard: {},
					channelRestriction,
					roleRestriction,
					notifyMessageEmbed,
					...query?.levels,
				},
			},
			stars: {
				set: {
					channelRestriction,
					roleRestriction,
					...query?.stars,
				},
			},
			economy: {
				set: {
					channelRestriction,
					roleRestriction,
					...query?.economy,
				},
			},
		},
		update: {
			...query,
			levels: {
				update: {
					channelRestriction,
					roleRestriction,
					notifyMessageEmbed,
					...query?.levels,
				},
			},
			stars: {
				update: {
					channelRestriction: channelRestriction as Restriction,
					roleRestriction: roleRestriction as Restriction,
					...query?.stars,
				},
			},
			economy: {
				update: {
					channelRestriction,
					roleRestriction,
					...query?.economy,
				},
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

export const getMember = async (guildId: string, userId: string) => {
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

export const updateMember = async (guildId: string, userId: string, query: Partial<Prisma.MemberCreateInput>) => {
	const D = {
		where: {
			guildMember: {
				guildId,
				userId,
			},
		},
		update: {
			...query,
			card: query.card ? { update: query.card } : undefined,
		},
		create: {
			guildId,
			userId,
			card: {},
			...query,
		},
	};

	if (!D.update.card) delete D.update.card;

	return prisma.member.upsert(D);
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

export const getUser = (userId: string) => {
	return prisma.user.upsert({
		where: { id: userId },
		create: {
			id: userId,
		},
		update: {},
	});
};

export const updateUser = (userId: string, query: Partial<Prisma.UserCreateInput>) => {
	return prisma.user.upsert({
		where: { id: userId },
		create: {
			id: userId,
			...query,
		},
		update: {
			...query,
		},
	});
};

export const fetchLeaderboard = (guildId: string, page: number, limit: number) => {
	const members = prisma.member.findMany({
		where: { guildId },
		orderBy: { exp: "desc" },
		take: limit,
		skip: (page - 1) * limit,
	});

	return members;
};
