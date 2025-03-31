import { Embeddable, Embedded, Enum, type Opt, Property } from "@mikro-orm/core";
import { Card } from "./Card.entity.js";
import { DiscordEmbed } from "./DiscordEmbed.entity.js";
import { Restriction } from "./Restriction.entity.js";
import { type DiscordEntity, MessageType } from "./shared-enums.js";

@Embeddable()
export class Levels {
	@Property()
	enabled: boolean & Opt = true;

	@Property()
	stackRewards: boolean & Opt = false;

	@Property()
	clearOnLeave: boolean & Opt = false;

	@Property()
	addRolesOnJoin: boolean & Opt = false;

	@Embedded(() => Card, { nullable: true })
	defaultRankCard?: Card & Opt;

	@Property()
	allowCustomRankCard: boolean & Opt = true;

	@Property()
	boost: number & Opt = 1;

	@Embedded(() => ExpBoost, { array: true })
	boosts: ExpBoost[] & Opt = [];

	@Property()
	textExpEnabled: boolean & Opt = true;

	@Property()
	textRateMin: number & Opt = 1;

	@Property()
	textRateMax: number & Opt = 25;

	@Property()
	textCooldown: number & Opt = 25;

	@Property()
	voiceExpEnabled: boolean & Opt = true;

	@Property()
	voiceRateMin: number & Opt = 1;

	@Property()
	voiceRateMax: number & Opt = 25;

	@Property()
	voiceCooldown: number & Opt = 60;

	@Enum(() => Destination)
	notifyDestination: Destination & Opt = Destination.ACTIVE_CHANNEL;

	@Enum(() => MessageType)
	notifyMessageType: MessageType & Opt = MessageType.EMBED;

	@Property()
	notifyChannel?: string;

	@Property()
	notifyMessageContent?: string;

	@Embedded(() => DiscordEmbed, { object: true })
	notifyMessageEmbed?: DiscordEmbed & Opt;

	@Embedded(() => Restriction, { object: true })
	roleRestriction: Restriction & Opt = new Restriction();

	@Embedded(() => Restriction, { object: true })
	channelRestriction: Restriction & Opt = new Restriction();

	@Embedded(() => Reward, { object: true, array: true })
	rewards: Reward[] & Opt = [];
}

@Embeddable()
export class Reward {
	@Property()
	level!: number;

	@Property()
	roles: string[] = [];
}

@Embeddable()
export class ExpBoost {
	@Enum()
	type!: DiscordEntity;

	@Property()
	id!: string;

	@Property()
	boost!: number;
}

export enum Destination {
	ACTIVE_CHANNEL = "ACTIVE_CHANNEL",
	CUSTOM_CHANNEL = "CUSTOM_CHANNEL",
	PRIVATE_MESSAGE = "PRIVATE_MESSAGE",
	DISABLED = "DISABLED",
}
