import { Event } from "@lib/core";
import type { APIGuild } from "discord-api-types/v10";
import { injectable } from "tsyringe";

@injectable()
export default class implements Event {
	public async exec(guild: APIGuild) {}
}
