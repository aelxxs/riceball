export interface Preset {
	name: string;
	color: string;
	theme: string;
	accent: string;
	opacity: number;
	textColor: string;
	background: string;
	shadowColor: string;
	progressOpacity: number;
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
