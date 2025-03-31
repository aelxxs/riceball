import { Embeddable, Embedded, type Opt, Property } from "@mikro-orm/core";

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

	@Property({ nullable: true })
	borderRadius?: number | null | Opt = null;

	@Property({ nullable: true })
	wrapperImage?: string | null | Opt = null;

	@Embedded(() => HSLAColor, { nullable: true })
	wrapperColor?: HSLAColor | null | Opt = null;

	@Embedded(() => HSLAColor, { nullable: true })
	overlayColor?: HSLAColor | null | Opt = null;

	@Embedded(() => HSLAColor, { nullable: true })
	overlayAccentColor?: HSLAColor | null | Opt = null;

	@Embedded(() => HSLAColor, { nullable: true })
	progressBarColor?: HSLAColor | null | Opt = null;

	@Property()
	fontFamily: FontFamily = FontFamily.MONOSPACE;

	@Embedded(() => HSLAColor, { nullable: true })
	textColor?: HSLAColor | null | Opt = null;

	@Embedded(() => HSLAColor, { nullable: true })
	subtextColor?: HSLAColor | null | Opt = null;
}

export enum FontFamily {
	SANS_SERIF = "SANS_SERIF",
	SERIF = "SERIF",
	MONOSPACE = "MONOSPACE",
	HANDWRITTEN = "HANDWRITTEN",
	CURSIVE = "CURSIVE",
}
