export enum ReactionRoleType {
	Add,
	Remove,
}

export interface ReactionRolePair {
	emoji: string;
	roles: string[];
}

export interface ReactionRole {
	type: ReactionRoleType;
	enabled: boolean;
	message: string;
	channel: string;
	pairs: ReactionRolePair[];
}

export interface LevelingRole {
	level: number;
	roles: string[];
}

export interface GuildSchema {
	locale: string;
	reactionRoles: ReactionRole[];
	levelingRoles: LevelingRole[];
	levels: {
		enabled: boolean;
		replaceRewards: boolean;
		expRate: {
			min: number | null;
			max: number | null;
			cooldown: number | null;
		};
		autoPrune: boolean;
		maxExpCap: number | null;
		clearOnLeave: boolean;
		announcement: {
			channel: string | null;
			message: string | null;
			enabled: boolean;
		};
		blacklist: List;
		whitelist: List;
	};
	starboard: {
		enabled: boolean;
		channel: string | null;
		threshold: number | null;
		embedColor: string | null;
		selfStar: boolean;
		selfStarWarning: boolean;
		blacklist: List;
		whitelist: List;
	};
	economy: {
		enabled: boolean;
		debugMode: boolean;
		autoUseItems: boolean;
		clearOnLeave: boolean;
		textBasedEarnings: {
			min: number | null;
			max: number | null;
			cooldown: number | null;
		};
		cooldowns: {
			daily: number | null;
		};
		wager: {
			min: number | null;
			max: number | null;
		};
		blacklist: List;
		whitelist: List;
	};
}

export interface List {
	users: string[];
	roles: string[];
	channels: string[];
}
