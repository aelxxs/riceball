import type { APIGuild } from "discord-api-types/v10";
import type { Event } from "library/core";
import { injectable } from "tsyringe";

@injectable()
export default class implements Event {
	public async exec(guild: APIGuild) {}
}
