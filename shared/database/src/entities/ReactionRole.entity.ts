import { Embeddable, Embedded, Entity, PrimaryKey, Property, SerializedPrimaryKey } from "@mikro-orm/core";
import type { ObjectId } from "@mikro-orm/mongodb";
import { DiscordEmbed } from "./DiscordEmbed.entity.js";

@Entity()
export class ReactionRole {
	@PrimaryKey()
	_id!: string;

	@SerializedPrimaryKey()
	id!: ObjectId;

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
	type: ReactionRoleType = ReactionRoleType.NORMAL;

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
	NORMAL = "NORMAL",
}
