import type { Opt } from "@mikro-orm/core";
import {
	Embedded,
	Entity,
	ManyToOne,
	PrimaryKey,
	Property,
	SerializedPrimaryKey,
	Unique,
} from "@mikro-orm/decorators/legacy";
import type { ObjectId } from "@mikro-orm/mongodb";
import { Card } from "./Card.entity.js";
import { User } from "./User.entity.js";

@Entity()
@Unique({ properties: ["user.id", "name"], name: "cardPreset" })
export class CardPreset {
	@PrimaryKey()
	_id!: ObjectId;

	@SerializedPrimaryKey()
	id!: string;

	@ManyToOne(() => User, { fieldName: "userId" })
	user!: User;

	@Property()
	name!: string;

	@Property({ nullable: true })
	description?: string;

	@Property({ nullable: true })
	public: boolean & Opt = false;

	@Embedded(() => Card, { object: true })
	card: Card & Opt = new Card();

	@Property()
	createdAt: Date & Opt = new Date();

	@Property({ onUpdate: () => new Date() })
	updatedAt: Date & Opt = new Date();
}
