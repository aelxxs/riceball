import {
	type APIMessage,
	type GatewayChannelDeleteDispatchData,
	type GatewayGuildDeleteDispatchData,
	type GatewayMessageCreateDispatchData,
	type GatewayMessageDeleteBulkDispatchData,
	type Snowflake,
	GatewayDispatchEvents,
} from "discord-api-types/v10";
import { Collector, CollectorConfig, CollectorFilter, Handler } from "./Collector";

type MessageCollectorConfig = CollectorConfig & {
	maxMessages?: number;
	maxProcessedMessages?: number;
};

type MessageCollectorFilter = CollectorFilter<APIMessage>;

const EndReasons = {
	limit: "MESSAGE_COLLECTOR_LIMIT",
	processedLimit: "MESSAGE_COLLECTOR_PROCESSED_LIMIT",
};

/**
 * The `MessageCollector` class extends the `Collector` class to collect messages from a specified channel.
 * It listens to various gateway events to collect, dispose, and manage messages.
 *
 * @template APIMessage - The type of message being collected.
 */
export class MessageCollector extends Collector<APIMessage> {
	private received = 0;

	private readonly guildId: string;
	private readonly channelId: string;

	public config: MessageCollectorConfig;
	public filter: MessageCollectorFilter;

	private handlers: Record<string, Handler>;

	public constructor(
		guildId: Snowflake,
		channelId: Snowflake,
		filter?: MessageCollectorFilter,
		config?: MessageCollectorConfig,
	) {
		super(filter, config);

		this.guildId = guildId;
		this.channelId = channelId;

		this.config = config ?? {};
		this.filter = filter ?? (() => true);

		this.handlers = {};

		const events = {
			[GatewayDispatchEvents.MessageCreate]: this.handleCollect,
			[GatewayDispatchEvents.MessageDelete]: this.handleDispose,
			[GatewayDispatchEvents.MessageUpdate]: this.handleCollect,
			[GatewayDispatchEvents.MessageDeleteBulk]: this.handleBulkDispose,
			[GatewayDispatchEvents.GuildDelete]: this.handleGuildDelete,
			[GatewayDispatchEvents.ChannelDelete]: this.handleChannelDelete,
		};

		this.incrementMaxListeners();
		Object.entries(events).forEach(([event, handler]) => {
			this.handlers[event] = this.decodeListener(handler);
			this.gateway.on(event, this.handlers[event]);
		});

		this.once("end", () => {
			Object.entries(this.handlers).forEach(([event, handler]) => {
				this.gateway.off(event, handler);
			});
			this.decrementMaxListeners();
		});
	}

	/**
	 * Determines the reason for ending the message collection.
	 *
	 * @returns The reason for ending the collection, or null if no end condition is met.
	 *
	 * Possible end reasons:
	 * - `EndReasons.limit`: The maximum number of messages has been collected.
	 * - `EndReasons.processedLimit`: The maximum number of processed messages has been reached.
	 */
	public endReason() {
		if (this.config.maxMessages && this.collected.size >= this.config.maxMessages) {
			return EndReasons.limit;
		}
		if (this.config.maxProcessedMessages && this.received === this.config.maxProcessedMessages) {
			return EndReasons.processedLimit;
		}
		return null;
	}

	/**
	 * Collects a message if it belongs to the specified channel.
	 *
	 * @param message - The message data to be collected.
	 * @returns The ID of the collected message if it belongs to the specified channel, otherwise undefined.
	 */
	public collect = (message: GatewayMessageCreateDispatchData) => {
		if (message.channel_id === this.channelId) {
			this.received++;
			return message.id;
		}
	};

	/**
	 * Disposes of a message if it belongs to the same channel as the collector.
	 * Decrements the received message count and returns the message ID.
	 *
	 * @param message - The message data to be disposed of.
	 * @returns The ID of the disposed message if it belongs to the same channel, otherwise undefined.
	 */
	public dispose = (message: GatewayMessageCreateDispatchData) => {
		if (message.channel_id === this.channelId) {
			this.received--;
			return message.id;
		}
	};

	/**
	 * Handles the bulk disposal of messages.
	 *
	 * @param event - The bulk message delete event data containing the list of message IDs to be disposed.
	 */
	private handleBulkDispose = (event: GatewayMessageDeleteBulkDispatchData) => {
		for (const id of event.ids) {
			this.dispose({ id, channel_id: this.channelId } as GatewayMessageCreateDispatchData);
		}
	};

	/**
	 * Handles the event when a guild is deleted.
	 *
	 * @param guild - The data of the deleted guild.
	 * @returns void
	 */
	private handleGuildDelete = (guild: GatewayGuildDeleteDispatchData) => {
		if (guild.id === this.guildId) {
			this.stop(GatewayDispatchEvents.GuildDelete);
		}
	};

	/**
	 * Handles the deletion of a channel. If the deleted channel's ID matches the
	 * ID of the channel being tracked by this instance, it stops the collector.
	 *
	 * @param channel - The data of the deleted channel dispatched by the gateway.
	 */
	private handleChannelDelete = (channel: GatewayChannelDeleteDispatchData) => {
		if (channel.id === this.channelId) {
			this.stop(GatewayDispatchEvents.ChannelDelete);
		}
	};
}
