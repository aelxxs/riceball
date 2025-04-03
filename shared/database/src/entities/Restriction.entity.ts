import { Embeddable, Enum, Property } from "@mikro-orm/core";
import { z } from "zod";

@Embeddable()
export class Restriction {
	@Enum()
	type: RestrictionType = RestrictionType.ALLOW_ALL;

	@Property()
	omit: string[] = [];
}

export enum RestrictionType {
	BLOCK_ALL = "BLOCK_ALL",
	ALLOW_ALL = "ALLOW_ALL",
}

export const RestrictionSchema = z.object({
	type: z.nativeEnum(RestrictionType),
	omit: z.array(z.string()),
}) satisfies z.ZodType<Restriction>;

export type RestrictionTypeSchema = z.infer<typeof RestrictionSchema>;
