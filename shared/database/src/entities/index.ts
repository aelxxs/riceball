import { Card, HSLAColor } from "./Card.entity.js";
import {
	DiscordEmbed,
	DiscordEmbedAuthor,
	DiscordEmbedField,
	DiscordEmbedFooter,
	DiscordEmbedImage,
	DiscordEmbedThumbnail,
} from "./DiscordEmbed.entity.js";
import { Badge, Economy, InventoryItem, Item, ItemData, PurchaseRequires, PurchaseResponse } from "./Economy.entity.js";
import { Guild } from "./Guild.entity.js";
import { ExpBoost, Levels, Reward } from "./Levels.entity.js";
import { Member } from "./Member.entity.js";
import { Message } from "./Message.entity.js";
import { ReactionRole, ReactionRolePair } from "./ReactionRole.entity.js";
import { Restriction } from "./Restriction.entity.js";
import { Star } from "./Star.entity.js";
import { Stars } from "./Stars.entity.js";
import { User } from "./User.entity.js";

export const entities = [
	Card,
	HSLAColor,
	Guild,
	DiscordEmbed,
	DiscordEmbedAuthor,
	DiscordEmbedImage,
	DiscordEmbedThumbnail,
	DiscordEmbedFooter,
	DiscordEmbedField,
	Economy,
	Item,
	ItemData,
	PurchaseResponse,
	PurchaseRequires,
	InventoryItem,
	Badge,
	Levels,
	Reward,
	ExpBoost,
	Member,
	Message,
	ReactionRole,
	ReactionRolePair,
	Restriction,
	Star,
	Stars,
	User,
];
