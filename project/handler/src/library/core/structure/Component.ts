import type { Context } from "./Context";

export type Component = (ctx: Context, ...args: string[]) => unknown;
