import { Embedded, Entity, type Opt, PrimaryKey, Property, SerializedPrimaryKey, Unique } from "@mikro-orm/core";
import type { ObjectId } from "@mikro-orm/mongodb";
import { Card } from "./Card.entity.js";
import { Badge, InventoryItem } from "./Economy.entity.js";

@Entity()
@Unique({ properties: ["userId", "guildId"], name: "guildMember" })
export class Member {
	@PrimaryKey({ nullable: true })
	_id?: ObjectId;

	// @SerializedPrimaryKey()
	// id!: string;

	// @Property()
	@PrimaryKey()
	userId!: string;

	// @Property()
	@PrimaryKey()
	guildId!: string;

	@Property()
	bal: number & Opt = 0;

	@Property()
	exp: number & Opt = 0;

	@Embedded(() => Card, { object: true })
	card: Card & Opt = new Card();

	@Embedded(() => Badge, { object: true, array: true })
	badges: Badge[] & Opt = [];

	@Embedded(() => InventoryItem, { object: true, array: true })
	inventory: InventoryItem[] & Opt = [];

	@Property()
	lastDaily: number & Opt = 0;
}
