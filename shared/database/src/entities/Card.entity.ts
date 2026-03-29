import { Embeddable, Embedded, Property } from "@mikro-orm/decorators/legacy";

@Embeddable()
export class HSLAColor {
	@Property()
	h!: number;

	@Property()
	s!: number;

	@Property()
	l!: number;

	@Property()
	a!: number;
}

@Embeddable()
export class Card {
	@Property()
	name = "";

	@Property({ nullable: true, type: 'number' })
	borderRadius?: number | null = null;

	@Property({ nullable: true, type: 'string' })
	wrapperImage?: string | null = null;

	@Embedded(() => HSLAColor, { nullable: true })
	wrapperColor?: HSLAColor | null = null;

	@Embedded(() => HSLAColor, { nullable: true })
	overlayColor?: HSLAColor | null = null;

	@Embedded(() => HSLAColor, { nullable: true })
	overlayAccentColor?: HSLAColor | null = null;

	@Embedded(() => HSLAColor, { nullable: true })
	progressBarColor?: HSLAColor | null = null;

	@Property()
	fontFamily: FontFamily = FontFamily.MONOSPACE;

	@Embedded(() => HSLAColor, { nullable: true })
	textColor?: HSLAColor | null = null;

	@Embedded(() => HSLAColor, { nullable: true })
	subtextColor?: HSLAColor | null = null;
}

export enum FontFamily {
	SANS_SERIF = "SANS_SERIF",
	SERIF = "SERIF",
	MONOSPACE = "MONOSPACE",
	HANDWRITTEN = "HANDWRITTEN",
	CURSIVE = "CURSIVE",
}
