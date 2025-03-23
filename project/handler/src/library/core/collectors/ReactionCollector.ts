import { logger } from "@riceball/logger";
import { Snowflake } from "discord-api-types/globals";
import {
	APIInteraction,
	GatewayDispatchEvents,
	type APIEmoji,
	type GatewayChannelDeleteDispatchData,
	type GatewayGuildDeleteDispatchData,
	type GatewayMessageDeleteBulkDispatchData,
	type GatewayMessageDeleteDispatchData,
	type GatewayMessageReactionAddDispatchData,
	type GatewayMessageReactionRemoveAllDispatchData,
	type GatewayMessageReactionRemoveDispatchData,
	type GatewayMessageReactionRemoveEmojiDispatchData,
} from "discord-api-types/v10";
import { Collector, CollectorConfig, CollectorFilter } from "./Collector";

export type ReactionCollectorConfig = {
	max?: number;
	maxEmojis?: number;
} & CollectorConfig;

export class ReactionCollector extends Collector<APIEmoji> {
	private total = 0;

	private readonly guildId: Snowflake;
	private readonly channelId: Snowflake;
	private readonly messageId: Snowflake;

	public readonly config: ReactionCollectorConfig;
	public readonly filter: CollectorFilter<GatewayMessageReactionAddDispatchData>;

	public constructor(
		interaction: APIInteraction,
		filter: CollectorFilter<GatewayMessageReactionAddDispatchData>,
		config: ReactionCollectorConfig,
	) {
		super(filter, config);

		this.guildId = interaction.guild_id!;
		this.channelId = interaction.channel_id!;
		this.messageId = interaction.message!.id;

		this.config = config;
		this.filter = filter;

		const events = {
			[GatewayDispatchEvents.MessageReactionAdd]: this.handleCollect,
			[GatewayDispatchEvents.MessageReactionRemove]: this.handleDispose,
			[GatewayDispatchEvents.MessageReactionRemoveAll]: this.handleMessageReactionRemoveAll,
			[GatewayDispatchEvents.MessageReactionRemoveEmoji]: this.handleMessageReactionRemoveEmoji,
			[GatewayDispatchEvents.MessageDelete]: this.handleMessageDelete,
			[GatewayDispatchEvents.MessageDeleteBulk]: this.handleMessageDeleteBulk,
			[GatewayDispatchEvents.ChannelDelete]: this.handleChannelDelete,
			[GatewayDispatchEvents.GuildDelete]: this.handleGuildDelete,
		};

		this.incrementMaxListeners();

		Object.entries(events).forEach(([event, handler]) => {
			this.gateway.on(event, this.eventHandlerWrapper(handler));
		});

		this.once("end", () => {
			Object.entries(events).forEach(([event, handler]) => {
				this.gateway.off(event, this.eventHandlerWrapper(handler));
			});
			this.decrementMaxListeners();
		});
	}

	public endReason() {
		if (this.config.max && this.total >= this.config.max) {
			return "limit";
		}
		if (this.config.maxEmojis && this.total >= this.config.maxEmojis) {
			return "emojiLimit";
		}
		return null;
	}

	public collect(event: GatewayMessageReactionAddDispatchData) {
		if (event.message_id === this.messageId) {
			this.total++;
			return this.getEmoji(event.emoji);
		}
	}

	public dispose(event: GatewayMessageReactionRemoveDispatchData) {
		if (event.message_id === this.messageId) {
			this.total--;
			return this.getEmoji(event.emoji);
		}
	}

	private handleMessageReactionRemoveAll(event: GatewayMessageReactionRemoveAllDispatchData) {
		if (event.message_id === this.messageId) {
			this.stop(GatewayDispatchEvents.MessageReactionRemoveAll);
		}
	}
	private handleMessageReactionRemoveEmoji(event: GatewayMessageReactionRemoveEmojiDispatchData) {
		if (event.message_id === this.messageId) {
			this.stop(GatewayDispatchEvents.MessageReactionRemoveEmoji);
		}
	}
	private handleMessageDelete(message: GatewayMessageDeleteDispatchData) {
		if (message.id === this.messageId) {
			this.stop(GatewayDispatchEvents.MessageDelete);
		}
	}
	private handleMessageDeleteBulk(event: GatewayMessageDeleteBulkDispatchData) {
		if (event.ids.includes(this.messageId)) {
			this.stop(GatewayDispatchEvents.MessageDeleteBulk);
		}
	}
	private handleChannelDelete(channel: GatewayChannelDeleteDispatchData) {
		if (channel.id === this.channelId) {
			this.stop(GatewayDispatchEvents.ChannelDelete);
		}
	}
	private handleGuildDelete(guild: GatewayGuildDeleteDispatchData) {
		if (guild.id === this.guildId) {
			this.stop(GatewayDispatchEvents.GuildDelete);
		}
	}

	private eventHandlerWrapper(handler: (data: any) => void) {
		return (data: string, { ack }: { ack: () => Promise<unknown> }) => {
			logger.debug("Collector Event Received");
			ack().then(() => {
				handler(JSON.parse(data));
			});
		};
	}

	private getEmoji({ name, id }: APIEmoji) {
		return name && id ? `${name}:${id}` : (name as string);
	}
}
