import { Entity, PrimaryKey, Property, SerializedPrimaryKey } from "@mikro-orm/core";
import type { ObjectId } from "@mikro-orm/mongodb";

@Entity()
export class Star {
	@PrimaryKey()
	_id!: string;

	@SerializedPrimaryKey()
	id!: ObjectId;

	@Property()
	refAuthorId!: string;

	@Property()
	refMessageId!: string;

	@Property()
	refChannelId!: string;

	@Property({ nullable: true })
	messageId?: string;

	@Property()
	count = 1;

	@Property()
	users: string[] = [];
}
