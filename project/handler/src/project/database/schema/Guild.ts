export interface GuildSchema {
	readonly id: string;
	locale: string;
	levels: {
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
		blacklist: {
			users: string[];
			roles: string[];
			channels: string[];
		};
		whitelist: {
			users: string[];
			roles: string[];
			channels: string[];
		};
	};
}
