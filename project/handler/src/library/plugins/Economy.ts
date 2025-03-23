import { prisma } from "db";
import { injectable } from "tsyringe";

@injectable()
export class Economy {
	// public constructor(public prisma: PrismaClient) {}

	public fetchShopItems(guildId: string) {
		return prisma.item.findMany({
			where: { guildId },
		});
	}

	public deleteShopItem(itemId: string) {
		return prisma.item.delete({
			where: { id: itemId },
		});
	}

	public fetchInactiveShopItems(guildId: string) {
		return prisma.item.findMany({
			where: { guildId, active: true },
		});
	}
}
