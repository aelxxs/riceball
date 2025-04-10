import { Embeddable, Embedded, Entity, PrimaryKey, Property } from "@mikro-orm/core";
import type { ObjectId } from "@mikro-orm/mongodb";
import { DiscordEmbed } from "./DiscordEmbed.entity.js";

@Entity()
export class ReactionRole {
	@PrimaryKey({ nullable: true })
	_id?: ObjectId;

	@Property()
	guildId!: string;

	@Property()
	messageId!: string;

	@Property()
	channelId!: string;

	@Property()
	messageContent = "";

	@Embedded(() => DiscordEmbed, { nullable: true })
	messageEmbed?: DiscordEmbed;

	@Property()
	alias!: string;

	@Property()
	type: ReactionRoleType = ReactionRoleType.TOGGLE;

	@Property()
	enabled = true;

	@Embedded(() => ReactionRolePair)
	pairs: ReactionRolePair[] = [];
}

@Embeddable()
export class ReactionRolePair {
	@Property()
	emoji!: string;

	@Property()
	roles!: string[];
}

export enum ReactionRoleType {
	ADD = "ADD",
	REMOVE = "REMOVE",
	UNIQUE = "UNIQUE",
	TOGGLE = "TOGGLE",
}
