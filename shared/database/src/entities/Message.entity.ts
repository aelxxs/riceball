import { Embedded, Entity, PrimaryKey, Property, SerializedPrimaryKey } from "@mikro-orm/core";
import type { ObjectId } from "@mikro-orm/mongodb";
import { DiscordEmbed } from "./DiscordEmbed.entity.js";

@Entity()
export class Message {
	@PrimaryKey()
	_id!: string;

	@SerializedPrimaryKey()
	id!: ObjectId;

	@Property()
	guildId!: string;

	@Property()
	channelId!: string;

	@Property()
	messageId!: string;

	@Property()
	content!: string;

	@Embedded(() => DiscordEmbed)
	embeds: DiscordEmbed[] = [];
}
