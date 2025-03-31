// entities/Guild.ts
import { Embedded, Entity, PrimaryKey, Property, SerializedPrimaryKey } from "@mikro-orm/core";
import type { Opt } from "@mikro-orm/mongodb";
import { DiscordEmbed } from "./DiscordEmbed.entity.js";
import { Economy } from "./Economy.entity.js";
import { Levels } from "./Levels.entity.js";
import { Restriction } from "./Restriction.entity.js";
import { Stars } from "./Stars.entity.js";

@Entity()
export class Guild {
	@PrimaryKey()
	_id!: string;

	@SerializedPrimaryKey()
	id!: string;

	@Property()
	locale: string & Opt = "en-US";

	@Property()
	timezone: string & Opt = "UTC";

	@Embedded(() => Levels, { object: true })
	levels: Levels & Opt = new Levels();

	@Embedded(() => Stars, { object: true })
	stars: Stars & Opt = new Stars();

	@Embedded(() => Economy, { object: true })
	economy: Economy & Opt = new Economy();

	@Embedded(() => DiscordEmbed, { object: true, array: true })
	embeds: DiscordEmbed[] & Opt = [];

	@Embedded(() => Restriction, { object: true })
	roleRestriction: Restriction & Opt = new Restriction();

	@Embedded(() => Restriction, { object: true })
	channelRestriction: Restriction & Opt = new Restriction();

	@Property()
	embedColor?: number;
}
