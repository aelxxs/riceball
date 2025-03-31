import type { Guild } from "@riceball/db/zod";
import type {
	APIApplication,
	APIChannel,
	APIGuild,
	APIGuildCategoryChannel,
	APIGuildTextChannel,
	GuildTextChannelType,
	RESTAPIPartialCurrentUserGuild,
} from "discord-api-types/v10";

export type ManagedGuild = RESTAPIPartialCurrentUserGuild & {
	riceball: boolean;
};

export type DashboardChannels = Array<
	| APIGuildTextChannel<GuildTextChannelType>
	| (APIGuildCategoryChannel & {
			children: Array<APIChannel>;
	  })
>;

export type DashboardGuild = ManagedGuild &
	APIGuild & {
		client: APIApplication;
		settings: Guild;
		channels: APIChannel[];
		itemizedChannels: Array<
			{ value: string; label: string } | { label: string; items: Array<{ value: string; label: string }> }
		>;
		itemizedRoles: Array<{ value: string; label: string }>;
	};
