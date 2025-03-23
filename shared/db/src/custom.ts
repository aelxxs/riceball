/**
 * This file consists of manual overrides for the generated schemas.
 * ! Must be manually maintained after db:push and db:generate !
 *
 * Last updated: 02/21/2025
 */

import { z } from "zod";
import {
	CardWithRelationsSchema,
	DiscordEmbedWithRelationsSchema,
	ExpBoostSchema,
	LevelsRelations,
	LevelsSchema,
	RestrictionSchema,
	RewardSchema,
} from "../generated/zod";

export type LevelsWithRelations = z.infer<typeof LevelsSchema> & LevelsRelations;

/**
 * Levels Schema with deep relations:
 * - boosts
 * - notifyMessageEmbed (nested DiscordEmbed)
 * - roleRestriction
 * - channelRestriction
 * - rewards
 */
export const LevelsWithRelationsSchema = LevelsSchema.merge(
	z.object({
		// rankCardWrapperImage: z
		// 	.instanceof(File)
		// 	.optional()
		// 	.refine((value) => value instanceof File, {
		// 		message: "Invalid file type",
		// 	}),
		rankCard: z.lazy(() => CardWithRelationsSchema),
		boosts: z.lazy(() => ExpBoostSchema).array(),
		notifyMessageEmbed: z.lazy(() => DiscordEmbedWithRelationsSchema),
		roleRestriction: z.lazy(() => RestrictionSchema),
		channelRestriction: z.lazy(() => RestrictionSchema),
		rewards: z.lazy(() => RewardSchema).array(),
	}),
).refine((value) => {
	if (value.notifyDestination === "CUSTOM_CHANNEL" && !value.notifyChannel) {
		return false;
	}

	return true;
});
