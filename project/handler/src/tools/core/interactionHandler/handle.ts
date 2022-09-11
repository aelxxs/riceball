import { Injectors, logger } from "@lib/util";
import { Redis, type AmqpResponseOptions } from "@spectacles/brokers";
import { container } from "tsyringe";

export function handle() {
	const gateway = container.resolve<Redis>(Injectors.Gateway);
	const actions = container.resolve<Map<string, Action>>(Injectors.Actions);

	for (const [event, handler] of actions) {
		gateway.on(event, async (args, { ack }: AmqpResponseOptions) => {
			await ack();
			logger.debug(`Event Recieved: "${event}"`);
			handler?.exec(JSON.parse(args));
		});
	}
}
