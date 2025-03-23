export function randomNItems<T>(arr: T[], n: number) {
	const result = new Array(n);
	let len = arr.length;
	const taken = new Array(len);

	if (n > len) {
		throw new RangeError("getRandom: more elements taken than available");
	}

	while (n--) {
		const x = Math.floor(Math.random() * len);
		result[n] = arr[x in taken ? taken[x] : x];
		taken[x] = --len in taken ? taken[len] : len;
	}

	return result;
}

export function shuffle<T>(array: T[]): T[] {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

export function randomItem<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}
