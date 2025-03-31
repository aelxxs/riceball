import { Embeddable, Property } from "@mikro-orm/core";

@Embeddable()
export class Restriction {
	@Property()
	type: RestrictionType = RestrictionType.ALLOW_ALL;

	@Property()
	omit: string[] = [];
}

export enum RestrictionType {
	BLOCK_ALL = "BLOCK_ALL",
	ALLOW_ALL = "ALLOW_ALL",
}
