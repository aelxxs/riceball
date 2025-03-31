import { Entity, type Opt, PrimaryKey, Property, SerializedPrimaryKey } from "@mikro-orm/core";
import type { ObjectId } from "@mikro-orm/mongodb";

@Entity()
export class User {
	@PrimaryKey()
	_id!: ObjectId;

	@SerializedPrimaryKey()
	id!: string;

	@Property({ nullable: true })
	birthday?: string;

	@Property({ nullable: true })
	timezone?: string;

	@Property({ nullable: true })
	bio?: string;

	@Property({ nullable: true })
	country?: string;

	@Property({ nullable: true })
	locale?: string;

	@Property()
	reputation: number & Opt = 0;

	@Property()
	lastReputation: number & Opt = 0;
}
