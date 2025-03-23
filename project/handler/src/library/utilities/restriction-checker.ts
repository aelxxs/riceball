import { type Restriction, RestrictionType } from "db";
import type { GatewayMessageCreateDispatchData, Snowflake } from "discord-api-types/v10";

type Restrictions = {
	userRestriction: Restriction;
	roleRestriction: Restriction;
	channelRestriction: Restriction;
} & any;

export class RestrictionChecker {
	private static checkRestriction(restriction: Restriction | undefined, value: Snowflake | Snowflake[]): boolean {
		if (!restriction) return false;
		const isInOmitList = Array.isArray(value)
			? value.some((v) => restriction.omit.includes(v))
			: restriction.omit.includes(value);
		return restriction.type === RestrictionType.ALLOW_ALL ? isInOmitList : !isInOmitList;
	}

	public static isRestricted(plugin: Restrictions, message: GatewayMessageCreateDispatchData): boolean {
		const { userRestriction, roleRestriction, channelRestriction } = plugin;

		return (
			this.checkRestriction(userRestriction, message.author.id) ??
			this.checkRestriction(channelRestriction, message.channel_id) ??
			this.checkRestriction(roleRestriction, message.member!.roles)
		);
	}
}
