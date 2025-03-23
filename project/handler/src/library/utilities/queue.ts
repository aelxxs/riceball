import { logger } from "@riceball/logger";

export class Queue {
	private queue: (() => Promise<void>)[];
	private processing: boolean;

	constructor() {
		this.queue = [];
		this.processing = false;
	}

	public get length() {
		return this.queue.length;
	}

	public add(callback: () => Promise<void>) {
		this.queue.push(callback);
		if (!this.processing) this.process();
	}

	private process() {
		this.processing = true;
		const callback = this.queue.shift();

		if (!callback) {
			this.processing = false;
		} else {
			callback()
				.then(() => this.process())
				.catch((error) => {
					logger.error("Error processing queue");
					logger.trace(error);
					this.process();
				});
		}
	}
}
