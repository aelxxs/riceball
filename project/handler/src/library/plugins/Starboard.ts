import path from "node:path";
import { channelMention, hyperlink, messageLink } from "@discordjs/formatters";
import { Database } from "@riceball/db";
import type { APIEmbed, APIEmoji, APIGuild, APIMessage, APIPartialEmoji, Snowflake } from "discord-api-types/v10";
import { deleteMessage, editMessage, getUserAvatar, sendMessage } from "library/core";
import { Queue } from "library/utilities/queue";
import * as emojis from "node-emoji";
import { inject, injectable } from "tsyringe";

@injectable()
export class Starboard {
	private db: Database;
	private queues: Map<Snowflake, Queue> = new Map();
	private recentlySelfStarred: Set<Snowflake> = new Set();

	private SELF_STAR_COOLDOWN = 60000;

	public constructor(@inject(Database) db: Database) {
		this.db = db;
	}

	/**
	 * Adds a message to the queue and executes the provided callback function.
	 * If the queue for the message ID does not exist, it creates a new queue.
	 * Once the callback is executed, it resolves the promise with the result.
	 * If the queue is empty after executing the callback, it deletes the queue.
	 *
	 * @param message - The message to be queued.
	 * @param callback - The callback function to be executed.
	 * @returns A promise that resolves with the result of the callback function.
	 */
	public queue(message: APIMessage, callback: () => Promise<unknown>) {
		let queue = this.queues.get(message.id);

		if (!queue) {
			queue = new Queue();
			this.queues.set(message.id, queue);
		}

		return new Promise((resolve) => {
			queue.add(() =>
				callback().then((result) => {
					if (!queue.length) this.queues.delete(message.id);
					resolve(result);
				}),
			);
		});
	}

	/**
	 * Adds a star to a message in the specified guild.
	 *
	 * @param guild - The guild where the message is located.
	 * @param message - The message to be starred.
	 * @param starredByUserId - The ID of the user who starred the message.
	 * @param emoji - The emoji used to star the message.
	 * @returns A promise that resolves to a string if self-starring is disabled, otherwise void.
	 */
	public async add(guild: APIGuild, message: APIMessage, starredByUserId: Snowflake, emoji: APIEmoji) {
		const { stars } = await this.db.getGuildSettings(guild.id);
		if (!stars.channelId) return;
		if (!Starboard.emojiEquals(emoji, parseEmoji(stars.emoji))) return;
		if (message.author.id === starredByUserId) {
			if (stars.selfStarEnabled) {
				return this.queue(message, () => this.addStar(guild, message, starredByUserId, stars));
			}
			if (stars.selfStarWarning) {
				this.recentlySelfStarred.add(starredByUserId);
				setTimeout(() => this.recentlySelfStarred.delete(starredByUserId), this.SELF_STAR_COOLDOWN);
				return "Self starring is disabled in this server.";
			}
		}
		return this.queue(message, () => this.addStar(guild, message, starredByUserId, stars));
	}

	/**
	 * Adds a star to a message in the starboard system.
	 *
	 * @param guild - The guild where the message was starred.
	 * @param message - The message that was starred.
	 * @param starredByUserId - The ID of the user who starred the message.
	 * @param stars - The starboard configuration including channel ID and threshold.
	 * @returns A promise that resolves to a string if the user has already starred the message, otherwise void.
	 */
	private async addStar(guild: APIGuild, message: APIMessage, starredByUserId: Snowflake, stars: any) {
		if (!stars.channelId) return;

		const star = await this.db.rm.stars.findOne({ refMessageId: message.id });
		const embed = this.buildStarboardEmbed(guild, message, star?.count ?? 1);

		if (!star) {
			let messageId: string | undefined;
			if (stars.threshold === 1) {
				const starboardMessage = await sendMessage(stars.channelId, embed);
				messageId = starboardMessage.id;
			}

			const newStar = this.db.rm.stars.create({
				refAuthorId: message.author.id,
				refMessageId: message.id,
				refChannelId: message.channel_id,
				messageId,
				count: 1,
				users: [starredByUserId],
			});
			await this.db.em.persistAndFlush(newStar);
		} else {
			if (star.users.includes(starredByUserId)) {
				return "You have already starred this message.";
			}

			let starboardMessage: APIMessage | null = null;
			if (star.count + 1 >= stars.threshold) {
				const embed = this.buildStarboardEmbed(guild, message, star.count + 1);
				starboardMessage = star.messageId
					? await editMessage(stars.channelId, star.messageId, embed)
					: await sendMessage(stars.channelId, embed);
			}

			star.count = star.count + 1;
			star.users.push(starredByUserId);
			if (starboardMessage?.id) {
				star.messageId = starboardMessage.id;
			}
			await this.db.em.persistAndFlush(star);
		}
	}

	/**
	 * Removes a star from a message in the starboard.
	 *
	 * @param guild - The guild where the message is located.
	 * @param message - The message from which the star is being removed.
	 * @param starredByUserId - The ID of the user who starred the message.
	 * @param emoji - The emoji used to star the message.
	 * @returns A promise that resolves when the star has been removed.
	 */
	public async remove(guild: APIGuild, message: APIMessage, starredByUserId: Snowflake, emoji: APIEmoji) {
		const { stars } = await this.db.getGuildSettings(guild.id);
		if (!stars.channelId) return;
		if (!stars.selfStarEnabled && message.author.id === starredByUserId) return;
		if (!Starboard.emojiEquals(emoji, parseEmoji(stars.emoji))) return;
		return this.queue(message, () => this.removeStar(guild, message, starredByUserId, stars));
	}

	/**
	 * Removes a star from a message in the starboard.
	 *
	 * @param guild - The guild where the message is located.
	 * @param message - The message from which the star is being removed.
	 * @param starredByUserId - The ID of the user who starred the message.
	 * @param stars - The starboard configuration and state.
	 * @returns A promise that resolves when the star has been removed and the starboard message has been updated or deleted.
	 */
	private async removeStar(guild: APIGuild, message: APIMessage, starredByUserId: Snowflake, stars: any) {
		if (!stars.channelId) return;

		const star = await this.db.rm.stars.findOne({ refMessageId: message.id });
		if (!star || !star.users.includes(starredByUserId)) {
			return;
		}

		const newUsers = star.users.filter((id) => id !== starredByUserId);
		if (newUsers.length === 0) {
			await this.db.em.removeAndFlush(star);
			if (star.messageId) {
				await deleteMessage(stars.channelId, star.messageId);
			}
		} else {
			star.users = newUsers;
			star.count = star.count - 1;
			await this.db.em.persistAndFlush(star);

			const embed = this.buildStarboardEmbed(guild, message, star.count);
			if (star.count < stars.threshold) {
				if (star.messageId) {
					await deleteMessage(stars.channelId, star.messageId);
				}
			} else {
				if (star.messageId) {
					await editMessage(stars.channelId, star.messageId, embed);
				}
			}
		}
	}

	private buildStarboardEmbed(guild: APIGuild, message: APIMessage, count: number) {
		const star = Starboard.getStarEmoji(count);

		const embed: APIEmbed = {
			author: {
				name: `${message.author.username} in ${channelMention(message.channel_id)}`,
				icon_url: getUserAvatar(message.author),
			},
			timestamp: new Date(message.timestamp).toISOString(),
			footer: {
				text: `${star} ${count} | ${message.id}`,
			},
			fields: [
				{
					name: "Teleport",
					value: hyperlink("Jump to message", messageLink(guild.id, message.channel_id, message.id)),
				},
			],
		};

		if (message.content) {
			embed.description = message.content.substring(0, 1000) + (message.content.length > 1000 ? "..." : "");
		}

		const attachment = Starboard.findAttachment(message);
		if (attachment) {
			embed.image = { url: attachment };
		}

		return embed;
	}

	static findAttachment(message: APIMessage) {
		let attachmentImage: string | undefined;
		const extensions = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
		const linkRegex = /https?:\/\/(?:\w+\.)?[\w-]+\.[\w]{2,3}(?:\/[\w-_.]+)+\.(?:png|jpg|jpeg|gif|webp)/;

		const attachment = message.attachments.find((file) => extensions.includes(path.extname(file.url)));
		if (attachment) {
			attachmentImage = attachment.url;
		}

		if (!attachmentImage) {
			const linkMatch = message.content.match(linkRegex);
			if (linkMatch && extensions.includes(path.extname(linkMatch[0]))) {
				attachmentImage = linkMatch[0];
			}
		}

		return attachmentImage;
	}

	/**
	 * Returns an emoji representation based on the provided count.
	 *
	 * @param count - The number of stars.
	 * @returns The corresponding emoji for the given count.
	 */
	static getStarEmoji(count: number) {
		if (count < 5) return "⭐";
		if (count < 10) return "🌟";
		if (count < 15) return "✨";
		if (count < 20) return "💫";
		if (count < 30) return "🎇";
		if (count < 40) return "🎆";
		if (count < 50) return "☄️";
		if (count < 75) return "🌠";
		if (count < 100) return "🌌";
		if (count < 150) return "🌌•⭐";
		if (count < 200) return "🌌•🌟";
		if (count < 300) return "🌌•✨";
		if (count < 400) return "🌌•💫";
		if (count < 650) return "🌌•🎇";
		if (count < 900) return "🌌•🎆";
		if (count < 1400) return "🌌•☄️";
		if (count < 2400) return "🌌•🌠";
		return "🌌•🌌";
	}

	/**
	 * Compares two emoji objects or strings to determine if they are equal.
	 *
	 * @param x - The first emoji to compare. Can be a string or an object with `id` and `name` properties.
	 * @param y - The second emoji to compare. Can be a string or an object with `id` and `name` properties.
	 * @returns `true` if the emojis are equal, `false` otherwise.
	 */
	static emojiEquals(x: string | APIPartialEmoji, y: string | APIPartialEmoji | null) {
		if (!x || !y) return false;

		if (typeof x === "string" && typeof y === "string") {
			return x === y;
		}

		if (typeof x === "string" && typeof y === "object") {
			return x === y.name;
		}

		if (typeof y === "string" && typeof x === "object") {
			return x.name === y;
		}

		if (typeof x === "object" && typeof y === "object") {
			return x?.id === y?.id || x?.name === y?.name;
		}
	}

	static validateEmoji(guild: APIGuild, emoji: string) {
		const unicode = emojis.find(emoji);

		if (unicode) {
			return unicode.emoji;
		}

		const custom = guild.emojis.find(({ id }) => {
			return id ? emoji.includes(id) : null;
		});

		if (custom) {
			return custom.id;
		}

		return null;
	}
}

/**
 * Parses emoji info out of a string. The string must be one of:
 * * A UTF-8 emoji (no id)
 * * A URL-encoded UTF-8 emoji (no id)
 * * A Discord custom emoji (`<:name:id>` or `<a:name:id>`)
 * @param {string} text Emoji string to parse
 * @returns {?APIPartialEmoji}
 */
function parseEmoji(text: string): APIPartialEmoji | null {
	let decodedText = text;
	if (decodedText.includes("%")) decodedText = decodeURIComponent(decodedText);
	if (!text.includes(":")) return { animated: false, name: text, id: null };
	const match = text.match(/<?(?:(a):)?(\w{2,32}):(\d{17,19})?>?/);
	return match && { animated: Boolean(match[1]), name: match[2], id: match[3] };
}
