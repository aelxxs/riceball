export interface Event {
	name: string;
	type: EventType;
	exec: (...args: unknown[]) => unknown | Promise<unknown>;
}

type EventType = "on" | "once";
