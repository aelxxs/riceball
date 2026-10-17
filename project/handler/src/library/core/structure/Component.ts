import type { MaybePromise, MessagePayload } from "../api/interactions";
import type { Context } from "./Context";

// biome-ignore lint/suspicious/noConfusingVoidType: handlers may return nothing or a reply payload
export type Component = (ctx: Context, ...args: string[]) => MaybePromise<void | MessagePayload>;
