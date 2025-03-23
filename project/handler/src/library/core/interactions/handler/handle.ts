import { Deps } from "@lib/common";
import { Event } from "@lib/core";
import { logger } from "@riceball/logger";
import type { Redis } from "@spectacles/brokers";
import { container } from "tsyringe";

export function handle() {
	const gateway = container.resolve<Redis>(Deps.Gateway);
	const events = container.resolve<Map<string, Event>>(Deps.Actions);

	for (const [event, handler] of events) {
		gateway.on(event, async (args, { ack }: { ack: () => Promise<unknown> }) => {
			await ack();
			logger.debug(`Event Recieved: "${event}"`);
			handler?.exec(JSON.parse(args));
		});
	}
}
