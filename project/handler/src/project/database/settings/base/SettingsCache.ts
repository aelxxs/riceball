import { Collection } from "discord.js";

export function isObject(value: any): boolean {
	return value && value.constructor === Object;
}

export function merge(target: any, ...source: any[]): any {
	for (const obj of source) {
		for (const [key, value] of Object.entries(obj)) {
			if (isObject(value) && isObject(target[key])) {
				merge(target[key], value);
			} else target[key] = value;
		}
	}

	return target;
}

export type RecursivePartial<T> = {
	[P in keyof T]?: RecursivePartial<T[P]>;
};

export abstract class SettingsCache<T> extends Collection<string, T> {
	private queue: Map<string, Promise<T>> = new Map();

	public read(key: string): T | Promise<T> {
		return this.get(key) ?? this.process(key);
	}

	public async write<K extends keyof T>(key: string, query: RecursivePartial<T>): Promise<void> {
		const settings = await this.read(key);

		this.set(key, merge(settings, query));

		const updated = Object.keys(query).reduce((obj, key) => {
			return { ...obj, [key]: settings[key as K] };
		}, {});

		return new Promise((resolve) => {
			return resolve(this.upsert(key, updated));
		});
	}

	private async process(key: string) {
		const queued = this.queue.get(key);

		if (queued) {
			const settings = await queued;

			// @ts-ignore alsdkj
			settings.ttl = Date.now() + 3.6e6;

			return settings;
		}

		try {
			const promise = this.fetch(key);

			this.queue.set(key, promise);
			const settings = await promise;

			// @ts-ignore alsdkj
			settings.ttl = Date.now() + 3.6e6;

			return settings;
		} finally {
			this.queue.delete(key);
		}
	}

	public abstract fetch(key: string): Promise<T>;
	public abstract upsert(key: string, query: RecursivePartial<T>): Promise<void>;
}
