import type { Opt } from "@mikro-orm/core";
import { Entity, OneToMany, PrimaryKey, Property, SerializedPrimaryKey } from "@mikro-orm/decorators/legacy";
import { CardPreset } from "./CardPreset.entity.js";

@Entity()
export class User {
	@PrimaryKey()
	_id!: string;

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
