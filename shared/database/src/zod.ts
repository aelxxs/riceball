import { z } from "zod";

/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const DiscordEntitySchema = z.enum(["CHANNEL", "ROLE", "USER"]);

export type DiscordEntityType = `${z.infer<typeof DiscordEntitySchema>}`;

export const RestrictionTypeSchema = z.enum(["BLOCK_ALL", "ALLOW_ALL"]);

export type RestrictionTypeType = `${z.infer<typeof RestrictionTypeSchema>}`;

export const ReactionRoleTypeSchema = z.enum(["ADD", "REMOVE", "UNIQUE", "TOGGLE"]);

export type ReactionRoleTypeType = `${z.infer<typeof ReactionRoleTypeSchema>}`;

export const DestinationSchema = z.enum(["ACTIVE_CHANNEL", "CUSTOM_CHANNEL", "PRIVATE_MESSAGE", "DISABLED"]);

export type DestinationType = `${z.infer<typeof DestinationSchema>}`;

export const MessageTypeSchema = z.enum(["EMBED", "TEXT"]);

export type MessageTypeType = `${z.infer<typeof MessageTypeSchema>}`;

export const CurrencyIconLocationSchema = z.enum(["LEFT", "RIGHT"]);

export type CurrencyIconLocationType = `${z.infer<typeof CurrencyIconLocationSchema>}`;

export const ItemTypeSchema = z.enum(["ROLES", "BADGE", "STATIC", "CUSTOM"]);

export type ItemTypeType = `${z.infer<typeof ItemTypeSchema>}`;

export const FontFamilySchema = z.enum(["SANS_SERIF", "SERIF", "MONOSPACE", "HANDWRITTEN", "CURSIVE"]);

export type FontFamilyType = `${z.infer<typeof FontFamilySchema>}`;

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// MESSAGE SCHEMA
/////////////////////////////////////////

export const MessageSchema = z.object({
	id: z.string(),
	guildId: z.string(),
	channelId: z.string(),
	messageId: z.string(),
	content: z.string(),
});

export type Message = z.infer<typeof MessageSchema>;

// MESSAGE RELATION SCHEMA
//------------------------------------------------------

export type MessageRelations = {
	embeds: DiscordEmbed[];
};

export type MessageWithRelations = z.infer<typeof MessageSchema> & MessageRelations;

export const MessageWithRelationsSchema: z.ZodType<MessageWithRelations> = MessageSchema.merge(
	z.object({
		embeds: z.lazy(() => DiscordEmbedSchema).array(),
	}),
);

/////////////////////////////////////////
// GUILD SCHEMA
/////////////////////////////////////////

export const GuildSchema = z.object({
	id: z.string(),
	locale: z.string(),
	timezone: z.string().nullable(),
	defaultEmbedColor: z.number().int().nullable(),
});

export type Guild = z.infer<typeof GuildSchema>;

// GUILD RELATION SCHEMA
//------------------------------------------------------

export type GuildRelations = {
	embeds: DiscordEmbed[];
	levels: Levels;
	stars: Stars;
	economy: Economy;
};

export type GuildWithRelations = z.infer<typeof GuildSchema> & GuildRelations;

export const GuildWithRelationsSchema: z.ZodType<GuildWithRelations> = GuildSchema.merge(
	z.object({
		embeds: z.lazy(() => DiscordEmbedSchema).array(),
		levels: z.lazy(() => LevelsSchema),
		stars: z.lazy(() => StarsSchema),
		economy: z.lazy(() => EconomySchema),
	}),
);

/////////////////////////////////////////
// REACTION ROLE SCHEMA
/////////////////////////////////////////

export const ReactionRoleSchema = z.object({
	type: ReactionRoleTypeSchema,
	channelId: z.string(),
	messageContent: z.string(),
	alias: z
		.string()
		.min(1, { message: "You must provide a name for the reaction role." })
		.max(100, { message: "The reaction role name must be less than 50 characters." }),
	enabled: z.boolean(),
	messageEmbed: z.lazy(() => DiscordEmbedSchema).nullable(),
	pairs: z.lazy(() => ReactionRolePairSchema).array(),
	// .min(1, { message: "You must provide at least one reaction role pair." })
	// .max(20, { message: "A message can have a maximum of 20 reaction role pairs." }),
});

export type ReactionRole = z.infer<typeof ReactionRoleSchema>;

// REACTION ROLE RELATION SCHEMA
//------------------------------------------------------

export type ReactionRoleRelations = {
	messageEmbed?: DiscordEmbed | null;
	pairs: ReactionRolePair[];
};

export type ReactionRoleWithRelations = z.infer<typeof ReactionRoleSchema> & ReactionRoleRelations;

export const ReactionRoleWithRelationsSchema: z.ZodType<ReactionRoleWithRelations> = ReactionRoleSchema.merge(
	z.object({
		messageEmbed: z.lazy(() => DiscordEmbedSchema).nullable(),
		pairs: z
			.lazy(() => ReactionRolePairSchema)
			.array()
			.min(1, { message: "You must provide at least one reaction role pair." })
			.max(20, { message: "A message can have a maximum of 20 reaction role pairs." })
			.nonempty(),
	}),
);

/////////////////////////////////////////
// STAR SCHEMA
/////////////////////////////////////////

export const StarSchema = z.object({
	id: z.string(),
	refAuthorId: z.string(),
	refMessageId: z.string(),
	refChannelId: z.string(),
	messageId: z.string().nullable(),
	count: z.number().int(),
	users: z.string().array(),
});

export type Star = z.infer<typeof StarSchema>;

/////////////////////////////////////////
// ITEM SCHEMA
/////////////////////////////////////////

export const ItemSchema = z.object({
	type: ItemTypeSchema,
	id: z.string(),
	guildId: z.string(),
	active: z.boolean(),
	name: z.string(),
	icon: z.string().nullable(),
	about: z.string().nullable(),
	price: z.number().int(),
	stock: z.number().int(),
	limit: z.number().int(),
	autoUse: z.boolean(),
	persist: z.boolean(),
});

export type Item = z.infer<typeof ItemSchema>;

// ITEM RELATION SCHEMA
//------------------------------------------------------

export type ItemRelations = {
	data?: ItemData | null;
	response?: PurchaseResponse | null;
	requires?: PurchaseRequires | null;
};

export type ItemWithRelations = z.infer<typeof ItemSchema> & ItemRelations;

export const ItemWithRelationsSchema: z.ZodType<ItemWithRelations> = ItemSchema.merge(
	z.object({
		data: z.lazy(() => ItemDataSchema).nullable(),
		response: z.lazy(() => PurchaseResponseSchema).nullable(),
		requires: z.lazy(() => PurchaseRequiresSchema).nullable(),
	}),
);

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
	id: z.string(),
	birthday: z.string().nullable(),
	timezone: z.string().nullable(),
	bio: z.string().nullable(),
	country: z.string().nullable(),
	locale: z.string().nullable(),
	reputation: z.number().int(),
	lastReputation: z.number().int(),
});

export type User = z.infer<typeof UserSchema>;

/////////////////////////////////////////
// MEMBER SCHEMA
/////////////////////////////////////////

export const MemberSchema = z.object({
	id: z.string(),
	userId: z.string(),
	guildId: z.string(),
	bal: z.number().int(),
	exp: z.number().int(),
	lastDaily: z.number().int(),
});

export type Member = z.infer<typeof MemberSchema>;

// MEMBER RELATION SCHEMA
//------------------------------------------------------

export type MemberRelations = {
	card: Card;
	cardPresets: Card[];
	badges: Badge[];
	inventory: InventoryItem[];
};

export type MemberWithRelations = z.infer<typeof MemberSchema> & MemberRelations;

export const MemberWithRelationsSchema: z.ZodType<MemberWithRelations> = MemberSchema.merge(
	z.object({
		card: z.lazy(() => CardSchema),
		cardPresets: z.lazy(() => CardSchema).array(),
		badges: z.lazy(() => BadgeSchema).array(),
		inventory: z.lazy(() => InventoryItemSchema).array(),
	}),
);

/////////////////////////////////////////
// COMPOSITE TYPES
/////////////////////////////////////////
// DISCORD EMBED
//------------------------------------------------------

/////////////////////////////////////////
// DISCORD EMBED SCHEMA
/////////////////////////////////////////

export const DiscordEmbedSchema = z.object({
	title: z.string(),
	description: z.string(),
	url: z.string(),
	color: z.number().int(),
	timestamp: z.string(),
	footer: z.lazy(() => DiscordEmbedFooterSchema),
	image: z.lazy(() => DiscordEmbedImageSchema),
	thumbnail: z.lazy(() => DiscordEmbedThumbnailSchema),
	author: z.lazy(() => DiscordEmbedAuthorSchema),
	fields: z.lazy(() => DiscordEmbedFieldSchema).array(),
});

export type DiscordEmbed = z.infer<typeof DiscordEmbedSchema>;

// DISCORD EMBED RELATION SCHEMA
//------------------------------------------------------

export type DiscordEmbedRelations = {
	footer: DiscordEmbedFooter;
	image: DiscordEmbedImage;
	thumbnail: DiscordEmbedThumbnail;
	author: DiscordEmbedAuthor;
	fields: DiscordEmbedField[];
};

export type DiscordEmbedWithRelations = z.infer<typeof DiscordEmbedSchema> & DiscordEmbedRelations;

export const DiscordEmbedWithRelationsSchema: z.ZodType<DiscordEmbedWithRelations> = DiscordEmbedSchema.merge(
	z.object({
		footer: z.lazy(() => DiscordEmbedFooterSchema),
		image: z.lazy(() => DiscordEmbedImageSchema),
		thumbnail: z.lazy(() => DiscordEmbedThumbnailSchema),
		author: z.lazy(() => DiscordEmbedAuthorSchema),
		fields: z.lazy(() => DiscordEmbedFieldSchema).array(),
	}),
);
// DISCORD EMBED AUTHOR
//------------------------------------------------------

/////////////////////////////////////////
// DISCORD EMBED AUTHOR SCHEMA
/////////////////////////////////////////

export const DiscordEmbedAuthorSchema = z.object({
	name: z.string(),
	url: z.string(),
	icon_url: z.string(),
});

export type DiscordEmbedAuthor = z.infer<typeof DiscordEmbedAuthorSchema>;
// DISCORD EMBED FIELD
//------------------------------------------------------

/////////////////////////////////////////
// DISCORD EMBED FIELD SCHEMA
/////////////////////////////////////////

export const DiscordEmbedFieldSchema = z.object({
	name: z.string(),
	value: z.string(),
	inline: z.boolean(),
});

export type DiscordEmbedField = z.infer<typeof DiscordEmbedFieldSchema>;
// DISCORD EMBED FOOTER
//------------------------------------------------------

/////////////////////////////////////////
// DISCORD EMBED FOOTER SCHEMA
/////////////////////////////////////////

export const DiscordEmbedFooterSchema = z.object({
	text: z.string(),
	icon_url: z.string(),
});

export type DiscordEmbedFooter = z.infer<typeof DiscordEmbedFooterSchema>;
// DISCORD EMBED IMAGE
//------------------------------------------------------

/////////////////////////////////////////
// DISCORD EMBED IMAGE SCHEMA
/////////////////////////////////////////

export const DiscordEmbedImageSchema = z.object({
	url: z.string(),
});

export type DiscordEmbedImage = z.infer<typeof DiscordEmbedImageSchema>;
// DISCORD EMBED THUMBNAIL
//------------------------------------------------------

/////////////////////////////////////////
// DISCORD EMBED THUMBNAIL SCHEMA
/////////////////////////////////////////

export const DiscordEmbedThumbnailSchema = z.object({
	url: z.string(),
});

export type DiscordEmbedThumbnail = z.infer<typeof DiscordEmbedThumbnailSchema>;
// RESTRICTION
//------------------------------------------------------

/////////////////////////////////////////
// RESTRICTION SCHEMA
/////////////////////////////////////////

export const RestrictionSchema = z.object({
	type: RestrictionTypeSchema,
	omit: z.string().array(),
});

export type Restriction = z.infer<typeof RestrictionSchema>;
// REACTION ROLE PAIR
//------------------------------------------------------

/////////////////////////////////////////
// REACTION ROLE PAIR SCHEMA
/////////////////////////////////////////

export const ReactionRolePairSchema = z.object({
	emoji: z.string().min(1, { message: "You must provide an emoji." }),
	roles: z
		.string()
		.array()
		.min(1, { message: "You must provide at least one role." })
		.max(5, { message: "A reaction can have a maximum of 20 roles." })
		.nonempty(),
});

export type ReactionRolePair = z.infer<typeof ReactionRolePairSchema>;
// LEVELS
//------------------------------------------------------

/////////////////////////////////////////
// LEVELS SCHEMA
/////////////////////////////////////////

export const LevelsSchema = z.object({
	notifyDestination: DestinationSchema,
	notifyMessageType: MessageTypeSchema,
	enabled: z.boolean(),
	stackRewards: z.boolean(),
	clearOnLeave: z.boolean(),
	addRolesOnJoin: z.boolean(),
	allowCustomRankCard: z.boolean(),
	boost: z.number().int(),
	textExpEnabled: z.boolean(),
	textRateMin: z.number().int(),
	textRateMax: z.number().int(),
	textCooldown: z.number().int(),
	voiceExpEnabled: z.boolean(),
	voiceRateMin: z.number().int(),
	voiceRateMax: z.number().int(),
	voiceCooldown: z.number().int(),
	notifyChannel: z.string().nullable(),
	notifyMessageContent: z.string().nullable(),
});

export type Levels = z.infer<typeof LevelsSchema>;

// LEVELS RELATION SCHEMA
//------------------------------------------------------

export type LevelsRelations = {
	rankCard: Card;
	boosts: ExpBoost[];
	notifyMessageEmbed: DiscordEmbed;
	roleRestriction: Restriction;
	channelRestriction: Restriction;
	rewards: Reward[];
};

export type LevelsWithRelations = z.infer<typeof LevelsSchema> & LevelsRelations;

export const LevelsWithRelationsSchema: z.ZodType<LevelsWithRelations> = LevelsSchema.merge(
	z.object({
		rankCard: z.lazy(() => CardSchema),
		boosts: z.lazy(() => ExpBoostSchema).array(),
		notifyMessageEmbed: z.lazy(() => DiscordEmbedSchema),
		roleRestriction: z.lazy(() => RestrictionSchema),
		channelRestriction: z.lazy(() => RestrictionSchema),
		rewards: z.lazy(() => RewardSchema).array(),
	}),
);
// REWARD
//------------------------------------------------------

/////////////////////////////////////////
// REWARD SCHEMA
/////////////////////////////////////////

export const RewardSchema = z.object({
	level: z.number().int(),
	roles: z.string().array(),
});

export type Reward = z.infer<typeof RewardSchema>;
// EXP BOOST
//------------------------------------------------------

/////////////////////////////////////////
// EXP BOOST SCHEMA
/////////////////////////////////////////

export const ExpBoostSchema = z.object({
	type: DiscordEntitySchema,
	id: z.string(),
	boost: z.number().int(),
});

export type ExpBoost = z.infer<typeof ExpBoostSchema>;

/////////////////////////////////////////
// STARS SCHEMA
/////////////////////////////////////////

export const StarsSchema = z.object({
	enabled: z.boolean(),
	channelId: z.string().nullable(),
	emoji: z.string(),
	threshold: z.number().min(1, { message: "Reaction threshold must be at least 1" }),
	duplicateOriginal: z.boolean(),
	selfStarEnabled: z.boolean(),
	selfStarWarning: z.boolean(),
	messageContent: z.string().nullable(),
	embed: z.lazy(() => DiscordEmbedSchema).nullable(),
	roleRestriction: z.lazy(() => RestrictionSchema),
	channelRestriction: z.lazy(() => RestrictionSchema),
});

export type Stars = z.infer<typeof StarsSchema>;

// ECONOMY
//------------------------------------------------------

/////////////////////////////////////////
// ECONOMY SCHEMA
/////////////////////////////////////////

export const EconomySchema = z.object({
	currencyIconLocation: CurrencyIconLocationSchema,
	enabled: z.boolean(),
	currencyName: z.string().nullable(),
	currencyIcon: z.string(),
	inventorySize: z.number().int(),
	wagerMin: z.number().int(),
	wagerMax: z.number().int(),
	dailyRewardMin: z.number().int(),
	dailyRewardMax: z.number().int(),
	textRateMin: z.number().int(),
	textRateMax: z.number().int(),
	textCooldown: z.number().int(),
	allowNegativeBalance: z.boolean(),
	negativeBalanceLimit: z.number().int(),
	defaultBalance: z.number().int(),
	debugMode: z.boolean(),
	clearOnLeave: z.boolean(),
	autoUseItems: z.boolean(),
});

export type Economy = z.infer<typeof EconomySchema>;

// ECONOMY RELATION SCHEMA
//------------------------------------------------------

export type EconomyRelations = {
	roleRestriction?: Restriction | null;
	channelRestriction?: Restriction | null;
};

export type EconomyWithRelations = z.infer<typeof EconomySchema> & EconomyRelations;

export const EconomyWithRelationsSchema: z.ZodType<EconomyWithRelations> = EconomySchema.merge(
	z.object({
		roleRestriction: z.lazy(() => RestrictionSchema).nullable(),
		channelRestriction: z.lazy(() => RestrictionSchema).nullable(),
	}),
);
// ITEM DATA
//------------------------------------------------------

/////////////////////////////////////////
// ITEM DATA SCHEMA
/////////////////////////////////////////

export const ItemDataSchema = z.object({
	roles: z.string().array(),
	badge: z.string().nullable(),
	script: z.string().nullable(),
});

export type ItemData = z.infer<typeof ItemDataSchema>;
// PURCHASE RESPONSE
//------------------------------------------------------

/////////////////////////////////////////
// PURCHASE RESPONSE SCHEMA
/////////////////////////////////////////

export const PurchaseResponseSchema = z.object({
	channel: z.string(),
	content: z.string().nullable(),
});

export type PurchaseResponse = z.infer<typeof PurchaseResponseSchema>;
// PURCHASE REQUIRES
//------------------------------------------------------

/////////////////////////////////////////
// PURCHASE REQUIRES SCHEMA
/////////////////////////////////////////

export const PurchaseRequiresSchema = z.object({
	level: z.number().int().nullable(),
	roles: z.string().array(),
});

export type PurchaseRequires = z.infer<typeof PurchaseRequiresSchema>;
// INVENTORY ITEM
//------------------------------------------------------

/////////////////////////////////////////
// INVENTORY ITEM SCHEMA
/////////////////////////////////////////

export const InventoryItemSchema = z.object({
	itemId: z.string(),
	name: z.string(),
	amount: z.number().int(),
});

export type InventoryItem = z.infer<typeof InventoryItemSchema>;
// BADGE
//------------------------------------------------------

/////////////////////////////////////////
// BADGE SCHEMA
/////////////////////////////////////////

export const BadgeSchema = z.object({
	itemId: z.string(),
	active: z.boolean(),
	slot: z.number().int(),
});

export type Badge = z.infer<typeof BadgeSchema>;
// LIST
//------------------------------------------------------

/////////////////////////////////////////
// LIST SCHEMA
/////////////////////////////////////////

export const ListSchema = z.object({
	type: DiscordEntitySchema,
	id: z.string(),
});

export type List = z.infer<typeof ListSchema>;
// CARD
//------------------------------------------------------

/////////////////////////////////////////
// CARD SCHEMA
/////////////////////////////////////////

export const CardSchema = z.object({
	fontFamily: FontFamilySchema,
	name: z.string().uuid(),
	borderRadius: z.number().int().nullable(),
	wrapperImage: z.string().nullable(),
	wrapperColor: z.lazy(() => HSLAColorSchema).nullable(),
	overlayColor: z.lazy(() => HSLAColorSchema).nullable(),
	overlayAccentColor: z.lazy(() => HSLAColorSchema).nullable(),
	progressBarColor: z.lazy(() => HSLAColorSchema).nullable(),
	textColor: z.lazy(() => HSLAColorSchema).nullable(),
	subtextColor: z.lazy(() => HSLAColorSchema).nullable(),
});

export type Card = z.infer<typeof CardSchema>;

// CARD RELATION SCHEMA
//------------------------------------------------------

export type CardRelations = {
	wrapperColor?: HSLAColor | null;
	overlayColor?: HSLAColor | null;
	overlayAccentColor?: HSLAColor | null;
	progressBarColor?: HSLAColor | null;
	textColor?: HSLAColor | null;
	subtextColor?: HSLAColor | null;
};

export type CardWithRelations = z.infer<typeof CardSchema> & CardRelations;

export const CardWithRelationsSchema: z.ZodType<CardWithRelations> = CardSchema.merge(
	z.object({
		wrapperColor: z.lazy(() => HSLAColorSchema).nullable(),
		overlayColor: z.lazy(() => HSLAColorSchema).nullable(),
		overlayAccentColor: z.lazy(() => HSLAColorSchema).nullable(),
		progressBarColor: z.lazy(() => HSLAColorSchema).nullable(),
		textColor: z.lazy(() => HSLAColorSchema).nullable(),
		subtextColor: z.lazy(() => HSLAColorSchema).nullable(),
	}),
);
// HSLA COLOR
//------------------------------------------------------

/////////////////////////////////////////
// HSLA COLOR SCHEMA
/////////////////////////////////////////

export const HSLAColorSchema = z.object({
	h: z.number().int(),
	s: z.number().int(),
	l: z.number().int(),
	a: z.number(),
});

export type HSLAColor = z.infer<typeof HSLAColorSchema>;
