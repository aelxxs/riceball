import { injectable } from "tsyringe";
import { GuildSettingsCache } from "./models/GuildSettingsCache";
import { MemberSettingsCache } from "./models/MemberSettingsCache";
import { UserSettingsCache } from "./models/UserSettingsCache";

@injectable()
export class CacheManager {
	public constructor(
		public guilds: GuildSettingsCache,
		public members: MemberSettingsCache,
		public users: UserSettingsCache
	) {}

	public sweep() {
		this.guilds.clear();
		this.members.clear();
		this.users.clear();
	}
}
