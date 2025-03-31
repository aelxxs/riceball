export function parseHex(color: string) {
	return {
		valid: /^#?([\da-f]{6})$/i.test(color),
		color: color.replace(/#/, ""),
	};
}
