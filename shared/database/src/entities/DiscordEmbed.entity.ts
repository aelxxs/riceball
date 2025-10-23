import { Embeddable, Embedded, Property } from "@mikro-orm/core";
import { z } from "zod";

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

/*
Message Limits

If you plan on using embed responses for your bot you should know the limits of the embeds on Discord or you will get Invalid Form Body errors:

    Embed title is limited to 256 characters
    Embed description is limited to 4096 characters
    An embed can contain a maximum of 25 fields
    A field name/title is limited to 256 character and the value of the field is limited to 1024 characters
    Embed footer is limited to 2048 characters
    Embed author name is limited to 256 characters
    The total characters of all embeds in a single message is limited to 6000
    A message is limited to 10 embeds

*/

export const DiscordEmbedSchema = z
	.object({
		author: z
			.object({
				name: z.string().max(256).optional(),
				url: z.string().optional(),
				icon_url: z.string().optional(),
			})
			.optional(),
		title: z.string().max(256).optional(),
		description: z.string().max(4096).optional(),
		color: z.number().optional(),
		url: z.string().optional(),
		timestamp: z.string().optional(),
		footer: z
			.object({
				text: z.string().max(2048).optional(),
				icon_url: z.string().optional(),
			})
			.optional(),
		thumbnail: z
			.object({
				url: z.string().optional(),
			})
			.optional(),
		image: z
			.object({
				url: z.string().optional(),
			})
			.optional(),
		fields: z
			.array(
				z.object({
					name: z.string().max(256).optional(),
					value: z.string().max(1024).optional(),
					inline: z.boolean().optional(),
				}),
			)
			.optional(),
	})
	.refine(
		(data) => {
			const totalLength =
				(data.title?.length ?? 0)
				+ (data.description?.length ?? 0)
				+ (data.fields?.reduce((acc, field) => acc + (field.name?.length ?? 0) + (field.value?.length ?? 0), 0)
					?? 0);

			return totalLength <= 6000;
		},
		{
			message: "Total length of all fields exceeds 6000 characters",
		},
	)
	.refine(
		(data) => {
			return (data.fields?.length ?? 0) <= 25;
		},
		{
			message: "Total number of fields exceeds 25",
		},
	) satisfies z.ZodType<DeepPartial<DiscordEmbed>>;

//

type DeepPartial<T> = {
	[K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
