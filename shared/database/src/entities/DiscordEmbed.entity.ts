import { Embeddable, Embedded, Property } from "@mikro-orm/core";

@Embeddable()
export class DiscordEmbedAuthor {
	@Property()
	name = "";

	@Property()
	url = "";

	@Property()
	icon_url = "";
}

@Embeddable()
export class DiscordEmbedField {
	@Property()
	name = "";

	@Property()
	value = "";

	@Property()
	inline = false;
}

@Embeddable()
export class DiscordEmbedImage {
	@Property()
	url = "";
}

@Embeddable()
export class DiscordEmbedThumbnail {
	@Property()
	url = "";
}

@Embeddable()
export class DiscordEmbedFooter {
	@Property()
	text = "";

	@Property()
	icon_url = "";
}

@Embeddable()
export class DiscordEmbed {
	@Property()
	url = "";

	@Property()
	title = "";

	@Property()
	description = "";

	@Property()
	color = 0;

	@Property()
	timestamp = "";

	@Embedded()
	footer: DiscordEmbedFooter = new DiscordEmbedFooter();

	@Embedded()
	image: DiscordEmbedImage = new DiscordEmbedImage();

	@Embedded()
	thumbnail: DiscordEmbedThumbnail = new DiscordEmbedThumbnail();

	@Embedded()
	author: DiscordEmbedAuthor = new DiscordEmbedAuthor();

	@Embedded(() => DiscordEmbedField, { array: true })
	fields: DiscordEmbedField[] = [];
}
