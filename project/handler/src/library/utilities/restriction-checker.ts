// import { type Restriction, RestrictionType } from "@riceball/db";
// import type { GatewayMessageCreateDispatchData, Snowflake } from "discord-api-types/v10";

// type Restrictions = {
// 	roleRestriction: Restriction;
// 	channelRestriction: Restriction;
// }

// export class RestrictionChecker {
// 	private static checkRestriction(restriction: Restriction | undefined, value: Snowflake | Snowflake[]): boolean {
// 		if (!restriction) return false;
// 		const isInOmitList = Array.isArray(value)
// 			? value.some((v) => restriction.omit.includes(v))
// 			: restriction.omit.includes(value);
// 		return restriction.type === RestrictionType.ALLOW_ALL ? isInOmitList : !isInOmitList;
// 	}

// 	public static isRestricted(plugin: Restrictions, message: GatewayMessageCreateDispatchData): boolean {
// 		const { roleRestriction, channelRestriction } = plugin;

// 		return (
// 			RestrictionChecker.checkRestriction(channelRestriction, message.channel_id) ??
// 			RestrictionChecker.checkRestriction(roleRestriction, message.member?.roles)
// 		);
// 	}
// }
