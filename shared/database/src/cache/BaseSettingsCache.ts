import type { AnyEntity } from "@mikro-orm/mongodb";
import type { Redis } from "ioredis";
import type { Payload } from "../utils/types.js";
import { RedisCache } from "./RedisCache.js";

export abstract class BaseSettingsCache<T extends AnyEntity> extends RedisCache<T> {
	private readonly queue: Map<string, Promise<T>> = new Map();
	constructor(protected readonly redis: Redis) {
		super(redis);
	}

	public async read(key: string): Promise<T> {
		return (await this.get(key)) ?? this.process(key);
	}

	public async write(key: string, value: Payload<T>): Promise<void> {
		let settings = await this.process(key);

		if (value) {
			settings = deepMerge(settings, value as Partial<T>);
		}

		await this.set(key, settings);
		await this.save(key, value);
	}

	private async process(key: string): Promise<T> {
		const queued = this.queue.get(key);

		if (queued) {
			return queued;
		}

		try {
			const promise = this.load(key);
			this.queue.set(key, promise);

			return promise;
		} finally {
			this.queue.delete(key);
		}
	}

	protected abstract load(key: string): Promise<T>;
	protected abstract save(key: string, value: Payload<T>): Promise<void>;
}

function deepMerge<T extends object>(target: T, source: Partial<T>): T {
	// Iterate over the keys in the source object
	for (const key of Object.keys(source) as (keyof T)[]) {
		const targetValue = target[key];
		const sourceValue = source[key];

		// If both target and source have the same key and the value is an object,
		// recursively merge the objects
		if (isObject(targetValue) && isObject(sourceValue)) {
			// @ts-expect-error
			target[key] = deepMerge(targetValue, sourceValue);
		} else {
			// Otherwise, simply overwrite the target with the source value
			if (sourceValue !== undefined) {
				target[key] = sourceValue;
			}
		}
	}

	return target;
}

// Helper function to check if a value is an object (excluding null and arrays)
function isObject(value: unknown): value is { [key: string]: unknown } {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}
