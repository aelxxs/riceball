// Ported from project/handler/src/library/plugins/Levels.ts; keep in sync with the bot.

export function expReq(level: number): number {
	return 6 * level ** 2 + 80 * level + 100;
}

export function getLevelProgress(exp: number) {
	let remaining = Math.max(0, exp);
	let level = 1;
	while (remaining >= expReq(level)) {
		remaining -= expReq(level);
		level++;
	}
	return { level, progress: remaining, required: expReq(level) };
}

export function getLevel(exp: number): number {
	return getLevelProgress(exp).level;
}
