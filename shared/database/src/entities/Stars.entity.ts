import { Embeddable, Embedded, Property } from "@mikro-orm/core";
import { DiscordEmbed } from "./DiscordEmbed.entity.js";
import { Restriction } from "./Restriction.entity.js";
import { MessageType } from "./shared-enums.js";

@Embeddable()
export class Stars {
	@Property()
	enabled = true;

	@Property({ nullable: true })
	channelId?: string | null;

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

	@Property({ nullable: true })
	messageContent?: string | null;

	@Embedded(() => DiscordEmbed, { nullable: true })
	embed?: DiscordEmbed | null;

	@Embedded(() => Restriction)
	roleRestriction: Restriction = new Restriction();

	@Embedded(() => Restriction)
	channelRestriction: Restriction = new Restriction();
}
