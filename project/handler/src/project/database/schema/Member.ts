export interface MemberSchema {
	readonly id: string;
	readonly member: string;
	readonly guild: string;
	xp: number;
	balance: number;
	badges: any[];
	inventory: any[];
	cooldowns: {
		daily: number;
	};
	card: {
		background: string;
		color: string;
		theme: string;
		accent: string;
		opacity: number;
		textColor: string;
		shadowColo: string;
		progressOpacity: number;
	};
}
