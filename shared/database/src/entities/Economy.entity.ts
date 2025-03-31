import { Embeddable, Embedded, Entity, Enum, PrimaryKey, Property, SerializedPrimaryKey } from "@mikro-orm/core";
import type { ObjectId } from "@mikro-orm/mongodb";
import { Restriction } from "./Restriction.entity.js";

@Embeddable()
export class Economy {
	@Property()
	enabled = true;

	@Property({ nullable: true })
	currencyName?: string;

	@Property()
	currencyIcon = "💴";

	@Enum()
	currencyIconLocation: CurrencyIconLocation = CurrencyIconLocation.LEFT;

	@Property()
	inventorySize = 10;

	@Property()
	wagerMin = 1;

	@Property()
	wagerMax = 0;

	@Property()
	dailyRewardMin = 5;

	@Property()
	dailyRewardMax = 25;

	@Property()
	textRateMin = 5;

	@Property()
	textRateMax = 25;

	@Property()
	textCooldown = 25;

	@Property()
	allowNegativeBalance = false;

	@Property()
	negativeBalanceLimit = 0;

	@Property()
	defaultBalance = 0;

	@Property()
	debugMode = false;

	@Property()
	clearOnLeave = false;

	@Property()
	autoUseItems = false;

	@Embedded(() => Restriction)
	roleRestriction: Restriction = new Restriction();

	@Embedded(() => Restriction)
	channelRestriction: Restriction = new Restriction();
}

@Embeddable()
export class ItemData {
	@Property({ nullable: true })
	roles?: string[];

	@Property({ nullable: true })
	badge?: string;

	@Property({ nullable: true })
	script?: string;
}

@Embeddable()
export class PurchaseResponse {
	@Property()
	channel!: string;

	@Property({ nullable: true })
	content?: string;
}

@Embeddable()
export class PurchaseRequires {
	@Property({ nullable: true })
	level?: number;

	@Property()
	roles: string[] = [];
}

@Embeddable()
export class InventoryItem {
	@Property()
	itemId!: string;

	@Property()
	name!: string;

	@Property()
	amount!: number;
}

@Embeddable()
export class Badge {
	@Property()
	itemId!: string;

	@Property()
	active!: boolean;

	@Property()
	slot!: number;
}

@Entity()
export class Item {
	@PrimaryKey()
	_id!: string;

	@SerializedPrimaryKey()
	id!: ObjectId;

	@Property()
	guildId!: string;

	@Property()
	active = true;

	@Property()
	type: ItemType = ItemType.STATIC;

	@Property()
	name!: string;

	@Property({ nullable: true })
	icon?: string;

	@Property({ nullable: true })
	about?: string;

	@Property()
	price = 1;

	@Property()
	stock = 1;

	@Property()
	limit = 1;

	@Embedded({ nullable: true })
	data?: ItemData;

	@Embedded({ nullable: true })
	response?: PurchaseResponse;

	@Embedded({ nullable: true })
	requires?: PurchaseRequires;

	@Property()
	autoUse = false;

	@Property()
	persist = false;
}

export enum CurrencyIconLocation {
	LEFT = "LEFT",
	RIGHT = "RIGHT",
}

export enum ItemType {
	ROLES = "ROLES",
	BADGE = "BADGE",
	STATIC = "STATIC",
	CUSTOM = "CUSTOM",
}
