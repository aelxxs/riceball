import { EventEmitter } from "node:stream";
import { logger } from "@riceball/logger";
import type Redis from "ioredis";
import { Deps } from "library/common";
import { container } from "tsyringe";

export type CollectorConfig = {
	timeout?: number;
	dispose?: boolean;
};

export type CollectorFilter<T> = (args: T) => boolean;

export type Handler = (data: string, { ack }: { ack: () => Promise<unknown> }) => void;

export abstract class Collector<T> extends EventEmitter {
	public ended = false;
	public collected: Map<string, T> = new Map();

	public readonly gateway: Redis;

	public readonly filter?: CollectorFilter<T>;
	public readonly config?: CollectorConfig;

	public constructor(filter?: CollectorFilter<T>, config?: CollectorConfig) {
		super();

		this.gateway = container.resolve<Redis>(Deps.Gateway);

		this.config = config;
		this.filter = filter;

		this.handleCollect = this.handleCollect.bind(this);
		this.handleDispose = this.handleDispose.bind(this);

		if (config?.timeout) {
			setTimeout(() => this.stop("time"), config.timeout);
		}
	}

	public async handleCollect(args: T) {
		const collected = this.collect(args);
		const passesFilter = this.filter ? this.filter(args) : true;

		if (collected && passesFilter) {
			this.collected.set(collected, args);
			this.emit("collect", args);
		}

		this.checkEnd();
	}

	public async handleDispose(args: T) {
		const disposed = this.dispose(args);
		const passesFilter = this.filter ? this.filter(args) : true;

		if (disposed && passesFilter) {
			this.collected.delete(disposed);
			this.emit("dispose", args);
		}

		this.checkEnd();
	}

	public stop(reason: string) {
		if (this.ended) return;

		this.ended = true;
		this.emit("end", this.collected, reason);
	}

	public checkEnd() {
		const reason = this.endReason();
		if (reason) this.stop(reason);
	}

	public incrementMaxListeners() {
		const maxListeners = this.gateway.getMaxListeners();
		if (maxListeners !== 0) {
			this.gateway.setMaxListeners(maxListeners + 1);
		}
	}

	public decrementMaxListeners() {
		const maxListeners = this.gateway.getMaxListeners();
		if (maxListeners !== 0) {
			this.gateway.setMaxListeners(maxListeners - 1);
		}
	}

	public decodeListener(handler: (data: unknown) => void) {
		return (data: string, { ack }: { ack: () => Promise<unknown> }) => {
			logger.debug("Collector Event Received");
			ack().then(() => {
				handler(JSON.parse(data));
			});
		};
	}

	public abstract collect(args: unknown): string | undefined;
	public abstract dispose(args: unknown): string | undefined;
	public abstract endReason(): string | null;
}
