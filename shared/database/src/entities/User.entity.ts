import {
	Embedded,
	Entity,
	ManyToOne,
	OneToMany,
	type Opt,
	PrimaryKey,
	Property,
	SerializedPrimaryKey,
	Unique,
} from "@mikro-orm/core";
import type { ObjectId } from "@mikro-orm/mongodb";
import { Card } from "./Card.entity";

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

	@OneToMany(
		() => CardPreset,
		(preset) => preset.user,
		{ nullable: true },
	)
	cardPresets: CardPreset[] & Opt = [];
}

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
