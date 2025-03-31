import { Embeddable, Embedded, Property } from "@mikro-orm/core";
import { DiscordEmbed } from "./DiscordEmbed.entity.js";
import { Restriction } from "./Restriction.entity.js";
import { MessageType } from "./shared-enums.js";

@Embeddable()
export class Stars {
	@Property()
	enabled = true;

	@Property({ nullable: true })
	channelId?: string;

	@Property()
	emoji = "⭐";

	@Property()
	threshold = 2;

	@Property()
	duplicateOriginal = false;

	@Property()
	selfStarEnabled = true;

	@Property()
	selfStarWarning = false;

	@Property()
	messageType: MessageType = MessageType.EMBED;

	@Property({ nullable: true })
	messageContent?: string;

	@Embedded(() => DiscordEmbed, { nullable: true })
	embed?: DiscordEmbed;

	@Embedded(() => Restriction)
	roleRestriction: Restriction = new Restriction();

	@Embedded(() => Restriction)
	channelRestriction: Restriction = new Restriction();
}
