export interface Preset {
	name: string;
}

export interface UserSchema {
	readonly id: string;
	country: string;
	reputation: number;
	bio: string;
	presets: Preset[];
	cooldowns: {
		rep: number;
	};
}
