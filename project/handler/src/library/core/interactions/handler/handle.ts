import type { Redis } from "@spectacles/brokers";
import { Injectors } from "@lib/common";
import { Event } from "@lib/core";
import { logger } from "@lib/util";
import { container } from "tsyringe";

export function handle() {
	const gateway = container.resolve<Redis>(Injectors.Gateway);
	const events = container.resolve<Map<string, Event>>(Injectors.Actions);

	for (const [event, handler] of events) {
		gateway.on(event, async (args, { ack }: any) => {
			await ack();
			logger.debug(`Event Recieved: "${event}"`);
			handler?.exec(JSON.parse(args));
		});
	}
}
