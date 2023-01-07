import { PrismaClient } from "db";
import { injectable } from "tsyringe";

@injectable()
export class Economy {
	public constructor(public prisma: PrismaClient) {}

	public fetchShopItems(guildId: string) {
		return this.prisma.item.findMany({
			where: { guildId },
		});
	}

	public deleteShopItem(itemId: string) {
		return this.prisma.item.delete({
			where: { id: itemId },
		});
	}

	public fetchInactiveShopItems(guildId: string) {
		return this.prisma.item.findMany({
			where: { guildId, active: true },
		});
	}
}
