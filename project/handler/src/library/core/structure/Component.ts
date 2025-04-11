import type { MaybePromise, MessagePayload } from "../api/interactions";
import type { Context } from "./Context";

export type Component = (ctx: Context, ...args: string[]) => MaybePromise<void> | MaybePromise<MessagePayload>;
