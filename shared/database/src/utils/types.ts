import type { EntityData } from "@mikro-orm/core";

export type Payload<T> = T | EntityData<T> | undefined;
