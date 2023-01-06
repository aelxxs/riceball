export interface Event {
	exec(...args: unknown[]): unknown | Promise<unknown>;
}
