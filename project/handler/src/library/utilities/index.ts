export * from "./logger";
export * from "./noop";

export const booleanFromString = (value: string) => {
	return value === "true";
};
