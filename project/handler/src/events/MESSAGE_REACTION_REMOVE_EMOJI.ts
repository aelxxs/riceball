import { Event } from "@lib/core";
import type { APIGuild } from "discord-api-types/v10";

export default class implements Event {
	public async exec(guild: APIGuild) {}
}
