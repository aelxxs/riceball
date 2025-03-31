import type { Prisma } from "@prisma/client";
import { z } from "zod";

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const MessageScalarFieldEnumSchema = z.enum(["id", "guildId", "channelId", "messageId", "content"]);

export const GuildScalarFieldEnumSchema = z.enum(["id", "locale", "timezone", "embedColor"]);

export const ReactionRoleScalarFieldEnumSchema = z.enum([
	"id",
	"guildId",
	"messageId",
	"channelId",
	"messageContent",
	"alias",
	"type",
	"enabled",
]);

export const StarScalarFieldEnumSchema = z.enum([
	"id",
	"refAuthorId",
	"refMessageId",
	"refChannelId",
	"messageId",
	"count",
	"users",
]);

export const ItemScalarFieldEnumSchema = z.enum([
	"id",
	"guildId",
	"active",
	"type",
	"name",
	"icon",
	"about",
	"price",
	"stock",
	"limit",
	"autoUse",
	"persist",
]);

export const UserScalarFieldEnumSchema = z.enum([
	"id",
	"birthday",
	"timezone",
	"bio",
	"country",
	"locale",
	"reputation",
	"lastReputation",
]);

export const MemberScalarFieldEnumSchema = z.enum(["id", "userId", "guildId", "bal", "exp", "lastDaily"]);

export const SortOrderSchema = z.enum(["asc", "desc"]);

export const QueryModeSchema = z.enum(["default", "insensitive"]);

export const DiscordEntitySchema = z.enum(["CHANNEL", "ROLE", "USER"]);

export type DiscordEntityType = `${z.infer<typeof DiscordEntitySchema>}`;

export const RestrictionTypeSchema = z.enum(["BLOCK_ALL", "ALLOW_ALL"]);

export type RestrictionTypeType = `${z.infer<typeof RestrictionTypeSchema>}`;

export const ReactionRoleTypeSchema = z.enum(["ADD", "REMOVE", "UNIQUE", "NORMAL"]);

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
	embedColor: z.number().int().nullable(),
});

export type Guild = z.infer<typeof GuildSchema>;

// GUILD RELATION SCHEMA
//------------------------------------------------------

export type GuildRelations = {
	levels: Levels;
	stars: Stars;
	economy: Economy;
	embeds: DiscordEmbed[];
	roleRestriction: Restriction;
	channelRestriction: Restriction;
};

export type GuildWithRelations = z.infer<typeof GuildSchema> & GuildRelations;

export const GuildWithRelationsSchema: z.ZodType<GuildWithRelations> = GuildSchema.merge(
	z.object({
		levels: z.lazy(() => LevelsSchema),
		stars: z.lazy(() => StarsSchema),
		economy: z.lazy(() => EconomySchema),
		embeds: z.lazy(() => DiscordEmbedSchema).array(),
		roleRestriction: z.lazy(() => RestrictionSchema),
		channelRestriction: z.lazy(() => RestrictionSchema),
	}),
);

/////////////////////////////////////////
// REACTION ROLE SCHEMA
/////////////////////////////////////////

export const ReactionRoleSchema = z.object({
	type: ReactionRoleTypeSchema,
	id: z.string(),
	guildId: z.string(),
	messageId: z.string(),
	channelId: z.string().length(17, { message: "You must select a channel." }),
	messageContent: z.string(),
	alias: z.string(),
	enabled: z.boolean(),
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
	url: z.string(),
	title: z.string(),
	description: z.string(),
	color: z.number().int(),
	timestamp: z.string(),
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
	emoji: z.string(),
	roles: z
		.string()
		.array()
		.min(1, { message: "You must provide at least one role." })
		.max(20, { message: "A reaction can have a maximum of 20 roles." })
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
	notifyMessageEmbed?: DiscordEmbed | null;
	roleRestriction: Restriction;
	channelRestriction: Restriction;
	rewards: Reward[];
};

export type LevelsWithRelations = z.infer<typeof LevelsSchema> & LevelsRelations;

export const LevelsWithRelationsSchema: z.ZodType<LevelsWithRelations> = LevelsSchema.merge(
	z.object({
		rankCard: z.lazy(() => CardSchema),
		boosts: z.lazy(() => ExpBoostSchema).array(),
		notifyMessageEmbed: z.lazy(() => DiscordEmbedSchema).nullable(),
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
// STARS
//------------------------------------------------------

/////////////////////////////////////////
// STARS SCHEMA
/////////////////////////////////////////

export const StarsSchema = z.object({
	messageType: MessageTypeSchema,
	enabled: z.boolean(),
	channelId: z.string().nullable(),
	emoji: z.string().length(1, { message: "Emoji must be at one character long" }),
	threshold: z.number().min(1, { message: "Reaction threshold must be at least 1" }),
	duplicateOriginal: z.boolean(),
	selfStarEnabled: z.boolean(),
	selfStarWarning: z.boolean(),
	messageContent: z.string().nullable(),
});

export type Stars = z.infer<typeof StarsSchema>;

// STARS RELATION SCHEMA
//------------------------------------------------------

export type StarsRelations = {
	embed?: DiscordEmbed | null;
	roleRestriction: Restriction;
	channelRestriction: Restriction;
};

export type StarsWithRelations = z.infer<typeof StarsSchema> & StarsRelations;

export const StarsWithRelationsSchema: z.ZodType<StarsWithRelations> = StarsSchema.merge(
	z.object({
		embed: z.lazy(() => DiscordEmbedSchema).nullable(),
		roleRestriction: z.lazy(() => RestrictionSchema),
		channelRestriction: z.lazy(() => RestrictionSchema),
	}),
);
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

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// MESSAGE
//------------------------------------------------------

export const MessageIncludeSchema: z.ZodType<Prisma.MessageInclude> = z.object({}).strict();

export const MessageArgsSchema: z.ZodType<Prisma.MessageDefaultArgs> = z
	.object({
		select: z.lazy(() => MessageSelectSchema).optional(),
		include: z.lazy(() => MessageIncludeSchema).optional(),
	})
	.strict();

export const MessageSelectSchema: z.ZodType<Prisma.MessageSelect> = z
	.object({
		id: z.boolean().optional(),
		guildId: z.boolean().optional(),
		channelId: z.boolean().optional(),
		messageId: z.boolean().optional(),
		content: z.boolean().optional(),
		embeds: z.union([z.boolean(), z.lazy(() => DiscordEmbedArgsSchema)]).optional(),
	})
	.strict();

// GUILD
//------------------------------------------------------

export const GuildIncludeSchema: z.ZodType<Prisma.GuildInclude> = z.object({}).strict();

export const GuildArgsSchema: z.ZodType<Prisma.GuildDefaultArgs> = z
	.object({
		select: z.lazy(() => GuildSelectSchema).optional(),
		include: z.lazy(() => GuildIncludeSchema).optional(),
	})
	.strict();

export const GuildSelectSchema: z.ZodType<Prisma.GuildSelect> = z
	.object({
		id: z.boolean().optional(),
		locale: z.boolean().optional(),
		timezone: z.boolean().optional(),
		levels: z.union([z.boolean(), z.lazy(() => LevelsArgsSchema)]).optional(),
		stars: z.union([z.boolean(), z.lazy(() => StarsArgsSchema)]).optional(),
		economy: z.union([z.boolean(), z.lazy(() => EconomyArgsSchema)]).optional(),
		embeds: z.union([z.boolean(), z.lazy(() => DiscordEmbedArgsSchema)]).optional(),
		roleRestriction: z.union([z.boolean(), z.lazy(() => RestrictionArgsSchema)]).optional(),
		channelRestriction: z.union([z.boolean(), z.lazy(() => RestrictionArgsSchema)]).optional(),
		embedColor: z.boolean().optional(),
	})
	.strict();

// REACTION ROLE
//------------------------------------------------------

export const ReactionRoleIncludeSchema: z.ZodType<Prisma.ReactionRoleInclude> = z.object({}).strict();

export const ReactionRoleArgsSchema: z.ZodType<Prisma.ReactionRoleDefaultArgs> = z
	.object({
		select: z.lazy(() => ReactionRoleSelectSchema).optional(),
		include: z.lazy(() => ReactionRoleIncludeSchema).optional(),
	})
	.strict();

export const ReactionRoleSelectSchema: z.ZodType<Prisma.ReactionRoleSelect> = z
	.object({
		id: z.boolean().optional(),
		guildId: z.boolean().optional(),
		messageId: z.boolean().optional(),
		channelId: z.boolean().optional(),
		messageContent: z.boolean().optional(),
		messageEmbed: z.union([z.boolean(), z.lazy(() => DiscordEmbedArgsSchema)]).optional(),
		alias: z.boolean().optional(),
		type: z.boolean().optional(),
		enabled: z.boolean().optional(),
		pairs: z.union([z.boolean(), z.lazy(() => ReactionRolePairArgsSchema)]).optional(),
	})
	.strict();

// STAR
//------------------------------------------------------

export const StarArgsSchema: z.ZodType<Prisma.StarDefaultArgs> = z
	.object({
		select: z.lazy(() => StarSelectSchema).optional(),
	})
	.strict();

export const StarSelectSchema: z.ZodType<Prisma.StarSelect> = z
	.object({
		id: z.boolean().optional(),
		refAuthorId: z.boolean().optional(),
		refMessageId: z.boolean().optional(),
		refChannelId: z.boolean().optional(),
		messageId: z.boolean().optional(),
		count: z.boolean().optional(),
		users: z.boolean().optional(),
	})
	.strict();

// ITEM
//------------------------------------------------------

export const ItemIncludeSchema: z.ZodType<Prisma.ItemInclude> = z.object({}).strict();

export const ItemArgsSchema: z.ZodType<Prisma.ItemDefaultArgs> = z
	.object({
		select: z.lazy(() => ItemSelectSchema).optional(),
		include: z.lazy(() => ItemIncludeSchema).optional(),
	})
	.strict();

export const ItemSelectSchema: z.ZodType<Prisma.ItemSelect> = z
	.object({
		id: z.boolean().optional(),
		guildId: z.boolean().optional(),
		active: z.boolean().optional(),
		type: z.boolean().optional(),
		name: z.boolean().optional(),
		icon: z.boolean().optional(),
		about: z.boolean().optional(),
		price: z.boolean().optional(),
		stock: z.boolean().optional(),
		limit: z.boolean().optional(),
		data: z.union([z.boolean(), z.lazy(() => ItemDataArgsSchema)]).optional(),
		response: z.union([z.boolean(), z.lazy(() => PurchaseResponseArgsSchema)]).optional(),
		requires: z.union([z.boolean(), z.lazy(() => PurchaseRequiresArgsSchema)]).optional(),
		autoUse: z.boolean().optional(),
		persist: z.boolean().optional(),
	})
	.strict();

// USER
//------------------------------------------------------

export const UserArgsSchema: z.ZodType<Prisma.UserDefaultArgs> = z
	.object({
		select: z.lazy(() => UserSelectSchema).optional(),
	})
	.strict();

export const UserSelectSchema: z.ZodType<Prisma.UserSelect> = z
	.object({
		id: z.boolean().optional(),
		birthday: z.boolean().optional(),
		timezone: z.boolean().optional(),
		bio: z.boolean().optional(),
		country: z.boolean().optional(),
		locale: z.boolean().optional(),
		reputation: z.boolean().optional(),
		lastReputation: z.boolean().optional(),
	})
	.strict();

// MEMBER
//------------------------------------------------------

export const MemberIncludeSchema: z.ZodType<Prisma.MemberInclude> = z.object({}).strict();

export const MemberArgsSchema: z.ZodType<Prisma.MemberDefaultArgs> = z
	.object({
		select: z.lazy(() => MemberSelectSchema).optional(),
		include: z.lazy(() => MemberIncludeSchema).optional(),
	})
	.strict();

export const MemberSelectSchema: z.ZodType<Prisma.MemberSelect> = z
	.object({
		id: z.boolean().optional(),
		userId: z.boolean().optional(),
		guildId: z.boolean().optional(),
		bal: z.boolean().optional(),
		exp: z.boolean().optional(),
		card: z.union([z.boolean(), z.lazy(() => CardArgsSchema)]).optional(),
		cardPresets: z.union([z.boolean(), z.lazy(() => CardArgsSchema)]).optional(),
		badges: z.union([z.boolean(), z.lazy(() => BadgeArgsSchema)]).optional(),
		inventory: z.union([z.boolean(), z.lazy(() => InventoryItemArgsSchema)]).optional(),
		lastDaily: z.boolean().optional(),
	})
	.strict();

// DISCORD EMBED
//------------------------------------------------------

export const DiscordEmbedIncludeSchema: z.ZodType<Prisma.DiscordEmbedInclude> = z.object({}).strict();

export const DiscordEmbedArgsSchema: z.ZodType<Prisma.DiscordEmbedDefaultArgs> = z
	.object({
		select: z.lazy(() => DiscordEmbedSelectSchema).optional(),
		include: z.lazy(() => DiscordEmbedIncludeSchema).optional(),
	})
	.strict();

export const DiscordEmbedSelectSchema: z.ZodType<Prisma.DiscordEmbedSelect> = z
	.object({
		url: z.boolean().optional(),
		title: z.boolean().optional(),
		description: z.boolean().optional(),
		color: z.boolean().optional(),
		timestamp: z.boolean().optional(),
		footer: z.union([z.boolean(), z.lazy(() => DiscordEmbedFooterArgsSchema)]).optional(),
		image: z.union([z.boolean(), z.lazy(() => DiscordEmbedImageArgsSchema)]).optional(),
		thumbnail: z.union([z.boolean(), z.lazy(() => DiscordEmbedThumbnailArgsSchema)]).optional(),
		author: z.union([z.boolean(), z.lazy(() => DiscordEmbedAuthorArgsSchema)]).optional(),
		fields: z.union([z.boolean(), z.lazy(() => DiscordEmbedFieldArgsSchema)]).optional(),
	})
	.strict();

// LEVELS
//------------------------------------------------------

export const LevelsIncludeSchema: z.ZodType<Prisma.LevelsInclude> = z.object({}).strict();

export const LevelsArgsSchema: z.ZodType<Prisma.LevelsDefaultArgs> = z
	.object({
		select: z.lazy(() => LevelsSelectSchema).optional(),
		include: z.lazy(() => LevelsIncludeSchema).optional(),
	})
	.strict();

export const LevelsSelectSchema: z.ZodType<Prisma.LevelsSelect> = z
	.object({
		enabled: z.boolean().optional(),
		stackRewards: z.boolean().optional(),
		clearOnLeave: z.boolean().optional(),
		addRolesOnJoin: z.boolean().optional(),
		rankCard: z.union([z.boolean(), z.lazy(() => CardArgsSchema)]).optional(),
		allowCustomRankCard: z.boolean().optional(),
		boost: z.boolean().optional(),
		boosts: z.union([z.boolean(), z.lazy(() => ExpBoostArgsSchema)]).optional(),
		textExpEnabled: z.boolean().optional(),
		textRateMin: z.boolean().optional(),
		textRateMax: z.boolean().optional(),
		textCooldown: z.boolean().optional(),
		voiceExpEnabled: z.boolean().optional(),
		voiceRateMin: z.boolean().optional(),
		voiceRateMax: z.boolean().optional(),
		voiceCooldown: z.boolean().optional(),
		notifyDestination: z.boolean().optional(),
		notifyMessageType: z.boolean().optional(),
		notifyChannel: z.boolean().optional(),
		notifyMessageContent: z.boolean().optional(),
		notifyMessageEmbed: z.union([z.boolean(), z.lazy(() => DiscordEmbedArgsSchema)]).optional(),
		roleRestriction: z.union([z.boolean(), z.lazy(() => RestrictionArgsSchema)]).optional(),
		channelRestriction: z.union([z.boolean(), z.lazy(() => RestrictionArgsSchema)]).optional(),
		rewards: z.union([z.boolean(), z.lazy(() => RewardArgsSchema)]).optional(),
	})
	.strict();

// STARS
//------------------------------------------------------

export const StarsIncludeSchema: z.ZodType<Prisma.StarsInclude> = z.object({}).strict();

export const StarsArgsSchema: z.ZodType<Prisma.StarsDefaultArgs> = z
	.object({
		select: z.lazy(() => StarsSelectSchema).optional(),
		include: z.lazy(() => StarsIncludeSchema).optional(),
	})
	.strict();

export const StarsSelectSchema: z.ZodType<Prisma.StarsSelect> = z
	.object({
		enabled: z.boolean().optional(),
		channelId: z.boolean().optional(),
		emoji: z.boolean().optional(),
		threshold: z.boolean().optional(),
		duplicateOriginal: z.boolean().optional(),
		selfStarEnabled: z.boolean().optional(),
		selfStarWarning: z.boolean().optional(),
		messageType: z.boolean().optional(),
		messageContent: z.boolean().optional(),
		embed: z.union([z.boolean(), z.lazy(() => DiscordEmbedArgsSchema)]).optional(),
		roleRestriction: z.union([z.boolean(), z.lazy(() => RestrictionArgsSchema)]).optional(),
		channelRestriction: z.union([z.boolean(), z.lazy(() => RestrictionArgsSchema)]).optional(),
	})
	.strict();

// ECONOMY
//------------------------------------------------------

export const EconomyIncludeSchema: z.ZodType<Prisma.EconomyInclude> = z.object({}).strict();

export const EconomyArgsSchema: z.ZodType<Prisma.EconomyDefaultArgs> = z
	.object({
		select: z.lazy(() => EconomySelectSchema).optional(),
		include: z.lazy(() => EconomyIncludeSchema).optional(),
	})
	.strict();

export const EconomySelectSchema: z.ZodType<Prisma.EconomySelect> = z
	.object({
		enabled: z.boolean().optional(),
		currencyName: z.boolean().optional(),
		currencyIcon: z.boolean().optional(),
		currencyIconLocation: z.boolean().optional(),
		inventorySize: z.boolean().optional(),
		wagerMin: z.boolean().optional(),
		wagerMax: z.boolean().optional(),
		dailyRewardMin: z.boolean().optional(),
		dailyRewardMax: z.boolean().optional(),
		textRateMin: z.boolean().optional(),
		textRateMax: z.boolean().optional(),
		textCooldown: z.boolean().optional(),
		allowNegativeBalance: z.boolean().optional(),
		negativeBalanceLimit: z.boolean().optional(),
		defaultBalance: z.boolean().optional(),
		debugMode: z.boolean().optional(),
		clearOnLeave: z.boolean().optional(),
		autoUseItems: z.boolean().optional(),
		roleRestriction: z.union([z.boolean(), z.lazy(() => RestrictionArgsSchema)]).optional(),
		channelRestriction: z.union([z.boolean(), z.lazy(() => RestrictionArgsSchema)]).optional(),
	})
	.strict();

// RESTRICTION
//------------------------------------------------------

export const RestrictionArgsSchema: z.ZodType<Prisma.RestrictionDefaultArgs> = z
	.object({
		select: z.lazy(() => RestrictionSelectSchema).optional(),
	})
	.strict();

export const RestrictionSelectSchema: z.ZodType<Prisma.RestrictionSelect> = z
	.object({
		type: z.boolean().optional(),
		omit: z.boolean().optional(),
	})
	.strict();

// REACTION ROLE PAIR
//------------------------------------------------------

export const ReactionRolePairArgsSchema: z.ZodType<Prisma.ReactionRolePairDefaultArgs> = z
	.object({
		select: z.lazy(() => ReactionRolePairSelectSchema).optional(),
	})
	.strict();

export const ReactionRolePairSelectSchema: z.ZodType<Prisma.ReactionRolePairSelect> = z
	.object({
		emoji: z.boolean().optional(),
		roles: z.boolean().optional(),
	})
	.strict();

// ITEM DATA
//------------------------------------------------------

export const ItemDataArgsSchema: z.ZodType<Prisma.ItemDataDefaultArgs> = z
	.object({
		select: z.lazy(() => ItemDataSelectSchema).optional(),
	})
	.strict();

export const ItemDataSelectSchema: z.ZodType<Prisma.ItemDataSelect> = z
	.object({
		roles: z.boolean().optional(),
		badge: z.boolean().optional(),
		script: z.boolean().optional(),
	})
	.strict();

// PURCHASE RESPONSE
//------------------------------------------------------

export const PurchaseResponseArgsSchema: z.ZodType<Prisma.PurchaseResponseDefaultArgs> = z
	.object({
		select: z.lazy(() => PurchaseResponseSelectSchema).optional(),
	})
	.strict();

export const PurchaseResponseSelectSchema: z.ZodType<Prisma.PurchaseResponseSelect> = z
	.object({
		channel: z.boolean().optional(),
		content: z.boolean().optional(),
	})
	.strict();

// PURCHASE REQUIRES
//------------------------------------------------------

export const PurchaseRequiresArgsSchema: z.ZodType<Prisma.PurchaseRequiresDefaultArgs> = z
	.object({
		select: z.lazy(() => PurchaseRequiresSelectSchema).optional(),
	})
	.strict();

export const PurchaseRequiresSelectSchema: z.ZodType<Prisma.PurchaseRequiresSelect> = z
	.object({
		level: z.boolean().optional(),
		roles: z.boolean().optional(),
	})
	.strict();

// CARD
//------------------------------------------------------

export const CardIncludeSchema: z.ZodType<Prisma.CardInclude> = z.object({}).strict();

export const CardArgsSchema: z.ZodType<Prisma.CardDefaultArgs> = z
	.object({
		select: z.lazy(() => CardSelectSchema).optional(),
		include: z.lazy(() => CardIncludeSchema).optional(),
	})
	.strict();

export const CardSelectSchema: z.ZodType<Prisma.CardSelect> = z
	.object({
		name: z.boolean().optional(),
		borderRadius: z.boolean().optional(),
		wrapperImage: z.boolean().optional(),
		wrapperColor: z.union([z.boolean(), z.lazy(() => HSLAColorArgsSchema)]).optional(),
		overlayColor: z.union([z.boolean(), z.lazy(() => HSLAColorArgsSchema)]).optional(),
		overlayAccentColor: z.union([z.boolean(), z.lazy(() => HSLAColorArgsSchema)]).optional(),
		progressBarColor: z.union([z.boolean(), z.lazy(() => HSLAColorArgsSchema)]).optional(),
		fontFamily: z.boolean().optional(),
		textColor: z.union([z.boolean(), z.lazy(() => HSLAColorArgsSchema)]).optional(),
		subtextColor: z.union([z.boolean(), z.lazy(() => HSLAColorArgsSchema)]).optional(),
	})
	.strict();

// BADGE
//------------------------------------------------------

export const BadgeArgsSchema: z.ZodType<Prisma.BadgeDefaultArgs> = z
	.object({
		select: z.lazy(() => BadgeSelectSchema).optional(),
	})
	.strict();

export const BadgeSelectSchema: z.ZodType<Prisma.BadgeSelect> = z
	.object({
		itemId: z.boolean().optional(),
		active: z.boolean().optional(),
		slot: z.boolean().optional(),
	})
	.strict();

// INVENTORY ITEM
//------------------------------------------------------

export const InventoryItemArgsSchema: z.ZodType<Prisma.InventoryItemDefaultArgs> = z
	.object({
		select: z.lazy(() => InventoryItemSelectSchema).optional(),
	})
	.strict();

export const InventoryItemSelectSchema: z.ZodType<Prisma.InventoryItemSelect> = z
	.object({
		itemId: z.boolean().optional(),
		name: z.boolean().optional(),
		amount: z.boolean().optional(),
	})
	.strict();

// DISCORD EMBED FOOTER
//------------------------------------------------------

export const DiscordEmbedFooterArgsSchema: z.ZodType<Prisma.DiscordEmbedFooterDefaultArgs> = z
	.object({
		select: z.lazy(() => DiscordEmbedFooterSelectSchema).optional(),
	})
	.strict();

export const DiscordEmbedFooterSelectSchema: z.ZodType<Prisma.DiscordEmbedFooterSelect> = z
	.object({
		text: z.boolean().optional(),
		icon_url: z.boolean().optional(),
	})
	.strict();

// DISCORD EMBED IMAGE
//------------------------------------------------------

export const DiscordEmbedImageArgsSchema: z.ZodType<Prisma.DiscordEmbedImageDefaultArgs> = z
	.object({
		select: z.lazy(() => DiscordEmbedImageSelectSchema).optional(),
	})
	.strict();

export const DiscordEmbedImageSelectSchema: z.ZodType<Prisma.DiscordEmbedImageSelect> = z
	.object({
		url: z.boolean().optional(),
	})
	.strict();

// DISCORD EMBED THUMBNAIL
//------------------------------------------------------

export const DiscordEmbedThumbnailArgsSchema: z.ZodType<Prisma.DiscordEmbedThumbnailDefaultArgs> = z
	.object({
		select: z.lazy(() => DiscordEmbedThumbnailSelectSchema).optional(),
	})
	.strict();

export const DiscordEmbedThumbnailSelectSchema: z.ZodType<Prisma.DiscordEmbedThumbnailSelect> = z
	.object({
		url: z.boolean().optional(),
	})
	.strict();

// DISCORD EMBED AUTHOR
//------------------------------------------------------

export const DiscordEmbedAuthorArgsSchema: z.ZodType<Prisma.DiscordEmbedAuthorDefaultArgs> = z
	.object({
		select: z.lazy(() => DiscordEmbedAuthorSelectSchema).optional(),
	})
	.strict();

export const DiscordEmbedAuthorSelectSchema: z.ZodType<Prisma.DiscordEmbedAuthorSelect> = z
	.object({
		name: z.boolean().optional(),
		url: z.boolean().optional(),
		icon_url: z.boolean().optional(),
	})
	.strict();

// DISCORD EMBED FIELD
//------------------------------------------------------

export const DiscordEmbedFieldArgsSchema: z.ZodType<Prisma.DiscordEmbedFieldDefaultArgs> = z
	.object({
		select: z.lazy(() => DiscordEmbedFieldSelectSchema).optional(),
	})
	.strict();

export const DiscordEmbedFieldSelectSchema: z.ZodType<Prisma.DiscordEmbedFieldSelect> = z
	.object({
		name: z.boolean().optional(),
		value: z.boolean().optional(),
		inline: z.boolean().optional(),
	})
	.strict();

// EXP BOOST
//------------------------------------------------------

export const ExpBoostArgsSchema: z.ZodType<Prisma.ExpBoostDefaultArgs> = z
	.object({
		select: z.lazy(() => ExpBoostSelectSchema).optional(),
	})
	.strict();

export const ExpBoostSelectSchema: z.ZodType<Prisma.ExpBoostSelect> = z
	.object({
		type: z.boolean().optional(),
		id: z.boolean().optional(),
		boost: z.boolean().optional(),
	})
	.strict();

// REWARD
//------------------------------------------------------

export const RewardArgsSchema: z.ZodType<Prisma.RewardDefaultArgs> = z
	.object({
		select: z.lazy(() => RewardSelectSchema).optional(),
	})
	.strict();

export const RewardSelectSchema: z.ZodType<Prisma.RewardSelect> = z
	.object({
		level: z.boolean().optional(),
		roles: z.boolean().optional(),
	})
	.strict();

// HSLA COLOR
//------------------------------------------------------

export const HSLAColorArgsSchema: z.ZodType<Prisma.HSLAColorDefaultArgs> = z
	.object({
		select: z.lazy(() => HSLAColorSelectSchema).optional(),
	})
	.strict();

export const HSLAColorSelectSchema: z.ZodType<Prisma.HSLAColorSelect> = z
	.object({
		h: z.boolean().optional(),
		s: z.boolean().optional(),
		l: z.boolean().optional(),
		a: z.boolean().optional(),
	})
	.strict();

/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const MessageWhereInputSchema: z.ZodType<Prisma.MessageWhereInput> = z
	.object({
		AND: z.union([z.lazy(() => MessageWhereInputSchema), z.lazy(() => MessageWhereInputSchema).array()]).optional(),
		OR: z
			.lazy(() => MessageWhereInputSchema)
			.array()
			.optional(),
		NOT: z.union([z.lazy(() => MessageWhereInputSchema), z.lazy(() => MessageWhereInputSchema).array()]).optional(),
		id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		guildId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		channelId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		messageId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		content: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		embeds: z
			.union([
				z.lazy(() => DiscordEmbedCompositeListFilterSchema),
				z.lazy(() => DiscordEmbedObjectEqualityInputSchema).array(),
			])
			.optional(),
	})
	.strict();

export const MessageOrderByWithRelationInputSchema: z.ZodType<Prisma.MessageOrderByWithRelationInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		guildId: z.lazy(() => SortOrderSchema).optional(),
		channelId: z.lazy(() => SortOrderSchema).optional(),
		messageId: z.lazy(() => SortOrderSchema).optional(),
		content: z.lazy(() => SortOrderSchema).optional(),
		embeds: z.lazy(() => DiscordEmbedOrderByCompositeAggregateInputSchema).optional(),
	})
	.strict();

export const MessageWhereUniqueInputSchema: z.ZodType<Prisma.MessageWhereUniqueInput> = z
	.object({
		id: z.string(),
	})
	.and(
		z
			.object({
				id: z.string().optional(),
				AND: z
					.union([z.lazy(() => MessageWhereInputSchema), z.lazy(() => MessageWhereInputSchema).array()])
					.optional(),
				OR: z
					.lazy(() => MessageWhereInputSchema)
					.array()
					.optional(),
				NOT: z
					.union([z.lazy(() => MessageWhereInputSchema), z.lazy(() => MessageWhereInputSchema).array()])
					.optional(),
				guildId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
				channelId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
				messageId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
				content: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
				embeds: z
					.union([
						z.lazy(() => DiscordEmbedCompositeListFilterSchema),
						z.lazy(() => DiscordEmbedObjectEqualityInputSchema).array(),
					])
					.optional(),
			})
			.strict(),
	);

export const MessageOrderByWithAggregationInputSchema: z.ZodType<Prisma.MessageOrderByWithAggregationInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		guildId: z.lazy(() => SortOrderSchema).optional(),
		channelId: z.lazy(() => SortOrderSchema).optional(),
		messageId: z.lazy(() => SortOrderSchema).optional(),
		content: z.lazy(() => SortOrderSchema).optional(),
		_count: z.lazy(() => MessageCountOrderByAggregateInputSchema).optional(),
		_max: z.lazy(() => MessageMaxOrderByAggregateInputSchema).optional(),
		_min: z.lazy(() => MessageMinOrderByAggregateInputSchema).optional(),
	})
	.strict();

export const MessageScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.MessageScalarWhereWithAggregatesInput> = z
	.object({
		AND: z
			.union([
				z.lazy(() => MessageScalarWhereWithAggregatesInputSchema),
				z.lazy(() => MessageScalarWhereWithAggregatesInputSchema).array(),
			])
			.optional(),
		OR: z
			.lazy(() => MessageScalarWhereWithAggregatesInputSchema)
			.array()
			.optional(),
		NOT: z
			.union([
				z.lazy(() => MessageScalarWhereWithAggregatesInputSchema),
				z.lazy(() => MessageScalarWhereWithAggregatesInputSchema).array(),
			])
			.optional(),
		id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
		guildId: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
		channelId: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
		messageId: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
		content: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
	})
	.strict();

export const GuildWhereInputSchema: z.ZodType<Prisma.GuildWhereInput> = z
	.object({
		AND: z.union([z.lazy(() => GuildWhereInputSchema), z.lazy(() => GuildWhereInputSchema).array()]).optional(),
		OR: z
			.lazy(() => GuildWhereInputSchema)
			.array()
			.optional(),
		NOT: z.union([z.lazy(() => GuildWhereInputSchema), z.lazy(() => GuildWhereInputSchema).array()]).optional(),
		id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		locale: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		timezone: z
			.union([z.lazy(() => StringNullableFilterSchema), z.string()])
			.optional()
			.nullable(),
		levels: z
			.union([z.lazy(() => LevelsCompositeFilterSchema), z.lazy(() => LevelsObjectEqualityInputSchema)])
			.optional(),
		stars: z
			.union([z.lazy(() => StarsCompositeFilterSchema), z.lazy(() => StarsObjectEqualityInputSchema)])
			.optional(),
		economy: z
			.union([z.lazy(() => EconomyCompositeFilterSchema), z.lazy(() => EconomyObjectEqualityInputSchema)])
			.optional(),
		embeds: z
			.union([
				z.lazy(() => DiscordEmbedCompositeListFilterSchema),
				z.lazy(() => DiscordEmbedObjectEqualityInputSchema).array(),
			])
			.optional(),
		roleRestriction: z
			.union([z.lazy(() => RestrictionCompositeFilterSchema), z.lazy(() => RestrictionObjectEqualityInputSchema)])
			.optional(),
		channelRestriction: z
			.union([z.lazy(() => RestrictionCompositeFilterSchema), z.lazy(() => RestrictionObjectEqualityInputSchema)])
			.optional(),
		embedColor: z
			.union([z.lazy(() => IntNullableFilterSchema), z.number()])
			.optional()
			.nullable(),
	})
	.strict();

export const GuildOrderByWithRelationInputSchema: z.ZodType<Prisma.GuildOrderByWithRelationInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		locale: z.lazy(() => SortOrderSchema).optional(),
		timezone: z.lazy(() => SortOrderSchema).optional(),
		levels: z.lazy(() => LevelsOrderByInputSchema).optional(),
		stars: z.lazy(() => StarsOrderByInputSchema).optional(),
		economy: z.lazy(() => EconomyOrderByInputSchema).optional(),
		embeds: z.lazy(() => DiscordEmbedOrderByCompositeAggregateInputSchema).optional(),
		roleRestriction: z.lazy(() => RestrictionOrderByInputSchema).optional(),
		channelRestriction: z.lazy(() => RestrictionOrderByInputSchema).optional(),
		embedColor: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const GuildWhereUniqueInputSchema: z.ZodType<Prisma.GuildWhereUniqueInput> = z
	.object({
		id: z.string(),
	})
	.and(
		z
			.object({
				id: z.string().optional(),
				AND: z
					.union([z.lazy(() => GuildWhereInputSchema), z.lazy(() => GuildWhereInputSchema).array()])
					.optional(),
				OR: z
					.lazy(() => GuildWhereInputSchema)
					.array()
					.optional(),
				NOT: z
					.union([z.lazy(() => GuildWhereInputSchema), z.lazy(() => GuildWhereInputSchema).array()])
					.optional(),
				locale: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
				timezone: z
					.union([z.lazy(() => StringNullableFilterSchema), z.string()])
					.optional()
					.nullable(),
				levels: z
					.union([z.lazy(() => LevelsCompositeFilterSchema), z.lazy(() => LevelsObjectEqualityInputSchema)])
					.optional(),
				stars: z
					.union([z.lazy(() => StarsCompositeFilterSchema), z.lazy(() => StarsObjectEqualityInputSchema)])
					.optional(),
				economy: z
					.union([z.lazy(() => EconomyCompositeFilterSchema), z.lazy(() => EconomyObjectEqualityInputSchema)])
					.optional(),
				embeds: z
					.union([
						z.lazy(() => DiscordEmbedCompositeListFilterSchema),
						z.lazy(() => DiscordEmbedObjectEqualityInputSchema).array(),
					])
					.optional(),
				roleRestriction: z
					.union([
						z.lazy(() => RestrictionCompositeFilterSchema),
						z.lazy(() => RestrictionObjectEqualityInputSchema),
					])
					.optional(),
				channelRestriction: z
					.union([
						z.lazy(() => RestrictionCompositeFilterSchema),
						z.lazy(() => RestrictionObjectEqualityInputSchema),
					])
					.optional(),
				embedColor: z
					.union([z.lazy(() => IntNullableFilterSchema), z.number().int()])
					.optional()
					.nullable(),
			})
			.strict(),
	);

export const GuildOrderByWithAggregationInputSchema: z.ZodType<Prisma.GuildOrderByWithAggregationInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		locale: z.lazy(() => SortOrderSchema).optional(),
		timezone: z.lazy(() => SortOrderSchema).optional(),
		embedColor: z.lazy(() => SortOrderSchema).optional(),
		_count: z.lazy(() => GuildCountOrderByAggregateInputSchema).optional(),
		_avg: z.lazy(() => GuildAvgOrderByAggregateInputSchema).optional(),
		_max: z.lazy(() => GuildMaxOrderByAggregateInputSchema).optional(),
		_min: z.lazy(() => GuildMinOrderByAggregateInputSchema).optional(),
		_sum: z.lazy(() => GuildSumOrderByAggregateInputSchema).optional(),
	})
	.strict();

export const GuildScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.GuildScalarWhereWithAggregatesInput> = z
	.object({
		AND: z
			.union([
				z.lazy(() => GuildScalarWhereWithAggregatesInputSchema),
				z.lazy(() => GuildScalarWhereWithAggregatesInputSchema).array(),
			])
			.optional(),
		OR: z
			.lazy(() => GuildScalarWhereWithAggregatesInputSchema)
			.array()
			.optional(),
		NOT: z
			.union([
				z.lazy(() => GuildScalarWhereWithAggregatesInputSchema),
				z.lazy(() => GuildScalarWhereWithAggregatesInputSchema).array(),
			])
			.optional(),
		id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
		locale: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
		timezone: z
			.union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
			.optional()
			.nullable(),
		embedColor: z
			.union([z.lazy(() => IntNullableWithAggregatesFilterSchema), z.number()])
			.optional()
			.nullable(),
	})
	.strict();

export const ReactionRoleWhereInputSchema: z.ZodType<Prisma.ReactionRoleWhereInput> = z
	.object({
		AND: z
			.union([z.lazy(() => ReactionRoleWhereInputSchema), z.lazy(() => ReactionRoleWhereInputSchema).array()])
			.optional(),
		OR: z
			.lazy(() => ReactionRoleWhereInputSchema)
			.array()
			.optional(),
		NOT: z
			.union([z.lazy(() => ReactionRoleWhereInputSchema), z.lazy(() => ReactionRoleWhereInputSchema).array()])
			.optional(),
		id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		guildId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		messageId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		channelId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		messageContent: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		messageEmbed: z
			.union([
				z.lazy(() => DiscordEmbedNullableCompositeFilterSchema),
				z.lazy(() => DiscordEmbedObjectEqualityInputSchema),
			])
			.optional()
			.nullable(),
		alias: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		type: z
			.union([z.lazy(() => EnumReactionRoleTypeFilterSchema), z.lazy(() => ReactionRoleTypeSchema)])
			.optional(),
		enabled: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
		pairs: z
			.union([
				z.lazy(() => ReactionRolePairCompositeListFilterSchema),
				z.lazy(() => ReactionRolePairObjectEqualityInputSchema).array(),
			])
			.optional(),
	})
	.strict();

export const ReactionRoleOrderByWithRelationInputSchema: z.ZodType<Prisma.ReactionRoleOrderByWithRelationInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		guildId: z.lazy(() => SortOrderSchema).optional(),
		messageId: z.lazy(() => SortOrderSchema).optional(),
		channelId: z.lazy(() => SortOrderSchema).optional(),
		messageContent: z.lazy(() => SortOrderSchema).optional(),
		messageEmbed: z.lazy(() => DiscordEmbedOrderByInputSchema).optional(),
		alias: z.lazy(() => SortOrderSchema).optional(),
		type: z.lazy(() => SortOrderSchema).optional(),
		enabled: z.lazy(() => SortOrderSchema).optional(),
		pairs: z.lazy(() => ReactionRolePairOrderByCompositeAggregateInputSchema).optional(),
	})
	.strict();

export const ReactionRoleWhereUniqueInputSchema: z.ZodType<Prisma.ReactionRoleWhereUniqueInput> = z
	.union([
		z.object({
			id: z.string(),
			guildMessage: z.lazy(() => ReactionRoleGuildMessageCompoundUniqueInputSchema),
		}),
		z.object({
			id: z.string(),
		}),
		z.object({
			guildMessage: z.lazy(() => ReactionRoleGuildMessageCompoundUniqueInputSchema),
		}),
	])
	.and(
		z
			.object({
				id: z.string().optional(),
				guildMessage: z.lazy(() => ReactionRoleGuildMessageCompoundUniqueInputSchema).optional(),
				AND: z
					.union([
						z.lazy(() => ReactionRoleWhereInputSchema),
						z.lazy(() => ReactionRoleWhereInputSchema).array(),
					])
					.optional(),
				OR: z
					.lazy(() => ReactionRoleWhereInputSchema)
					.array()
					.optional(),
				NOT: z
					.union([
						z.lazy(() => ReactionRoleWhereInputSchema),
						z.lazy(() => ReactionRoleWhereInputSchema).array(),
					])
					.optional(),
				guildId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
				messageId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
				channelId: z
					.union([
						z.lazy(() => StringFilterSchema),
						z.string().length(17, { message: "You must select a channel." }),
					])
					.optional(),
				messageContent: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
				messageEmbed: z
					.union([
						z.lazy(() => DiscordEmbedNullableCompositeFilterSchema),
						z.lazy(() => DiscordEmbedObjectEqualityInputSchema),
					])
					.optional()
					.nullable(),
				alias: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
				type: z
					.union([z.lazy(() => EnumReactionRoleTypeFilterSchema), z.lazy(() => ReactionRoleTypeSchema)])
					.optional(),
				enabled: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
				pairs: z
					.union([
						z.lazy(() => ReactionRolePairCompositeListFilterSchema),
						z.lazy(() => ReactionRolePairObjectEqualityInputSchema).array(),
					])
					.optional(),
			})
			.strict(),
	);

export const ReactionRoleOrderByWithAggregationInputSchema: z.ZodType<Prisma.ReactionRoleOrderByWithAggregationInput> =
	z
		.object({
			id: z.lazy(() => SortOrderSchema).optional(),
			guildId: z.lazy(() => SortOrderSchema).optional(),
			messageId: z.lazy(() => SortOrderSchema).optional(),
			channelId: z.lazy(() => SortOrderSchema).optional(),
			messageContent: z.lazy(() => SortOrderSchema).optional(),
			alias: z.lazy(() => SortOrderSchema).optional(),
			type: z.lazy(() => SortOrderSchema).optional(),
			enabled: z.lazy(() => SortOrderSchema).optional(),
			_count: z.lazy(() => ReactionRoleCountOrderByAggregateInputSchema).optional(),
			_max: z.lazy(() => ReactionRoleMaxOrderByAggregateInputSchema).optional(),
			_min: z.lazy(() => ReactionRoleMinOrderByAggregateInputSchema).optional(),
		})
		.strict();

export const ReactionRoleScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ReactionRoleScalarWhereWithAggregatesInput> =
	z
		.object({
			AND: z
				.union([
					z.lazy(() => ReactionRoleScalarWhereWithAggregatesInputSchema),
					z.lazy(() => ReactionRoleScalarWhereWithAggregatesInputSchema).array(),
				])
				.optional(),
			OR: z
				.lazy(() => ReactionRoleScalarWhereWithAggregatesInputSchema)
				.array()
				.optional(),
			NOT: z
				.union([
					z.lazy(() => ReactionRoleScalarWhereWithAggregatesInputSchema),
					z.lazy(() => ReactionRoleScalarWhereWithAggregatesInputSchema).array(),
				])
				.optional(),
			id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
			guildId: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
			messageId: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
			channelId: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
			messageContent: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
			alias: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
			type: z
				.union([
					z.lazy(() => EnumReactionRoleTypeWithAggregatesFilterSchema),
					z.lazy(() => ReactionRoleTypeSchema),
				])
				.optional(),
			enabled: z.union([z.lazy(() => BoolWithAggregatesFilterSchema), z.boolean()]).optional(),
		})
		.strict();

export const StarWhereInputSchema: z.ZodType<Prisma.StarWhereInput> = z
	.object({
		AND: z.union([z.lazy(() => StarWhereInputSchema), z.lazy(() => StarWhereInputSchema).array()]).optional(),
		OR: z
			.lazy(() => StarWhereInputSchema)
			.array()
			.optional(),
		NOT: z.union([z.lazy(() => StarWhereInputSchema), z.lazy(() => StarWhereInputSchema).array()]).optional(),
		id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		refAuthorId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		refMessageId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		refChannelId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		messageId: z
			.union([z.lazy(() => StringNullableFilterSchema), z.string()])
			.optional()
			.nullable(),
		count: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
		users: z.lazy(() => StringNullableListFilterSchema).optional(),
	})
	.strict();

export const StarOrderByWithRelationInputSchema: z.ZodType<Prisma.StarOrderByWithRelationInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		refAuthorId: z.lazy(() => SortOrderSchema).optional(),
		refMessageId: z.lazy(() => SortOrderSchema).optional(),
		refChannelId: z.lazy(() => SortOrderSchema).optional(),
		messageId: z.lazy(() => SortOrderSchema).optional(),
		count: z.lazy(() => SortOrderSchema).optional(),
		users: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const StarWhereUniqueInputSchema: z.ZodType<Prisma.StarWhereUniqueInput> = z
	.object({
		id: z.string(),
	})
	.and(
		z
			.object({
				id: z.string().optional(),
				refMessageId: z.string().optional(),
				AND: z
					.union([z.lazy(() => StarWhereInputSchema), z.lazy(() => StarWhereInputSchema).array()])
					.optional(),
				OR: z
					.lazy(() => StarWhereInputSchema)
					.array()
					.optional(),
				NOT: z
					.union([z.lazy(() => StarWhereInputSchema), z.lazy(() => StarWhereInputSchema).array()])
					.optional(),
				refAuthorId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
				refChannelId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
				messageId: z
					.union([z.lazy(() => StringNullableFilterSchema), z.string()])
					.optional()
					.nullable(),
				count: z.union([z.lazy(() => IntFilterSchema), z.number().int()]).optional(),
				users: z.lazy(() => StringNullableListFilterSchema).optional(),
			})
			.strict(),
	);

export const StarOrderByWithAggregationInputSchema: z.ZodType<Prisma.StarOrderByWithAggregationInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		refAuthorId: z.lazy(() => SortOrderSchema).optional(),
		refMessageId: z.lazy(() => SortOrderSchema).optional(),
		refChannelId: z.lazy(() => SortOrderSchema).optional(),
		messageId: z.lazy(() => SortOrderSchema).optional(),
		count: z.lazy(() => SortOrderSchema).optional(),
		users: z.lazy(() => SortOrderSchema).optional(),
		_count: z.lazy(() => StarCountOrderByAggregateInputSchema).optional(),
		_avg: z.lazy(() => StarAvgOrderByAggregateInputSchema).optional(),
		_max: z.lazy(() => StarMaxOrderByAggregateInputSchema).optional(),
		_min: z.lazy(() => StarMinOrderByAggregateInputSchema).optional(),
		_sum: z.lazy(() => StarSumOrderByAggregateInputSchema).optional(),
	})
	.strict();

export const StarScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.StarScalarWhereWithAggregatesInput> = z
	.object({
		AND: z
			.union([
				z.lazy(() => StarScalarWhereWithAggregatesInputSchema),
				z.lazy(() => StarScalarWhereWithAggregatesInputSchema).array(),
			])
			.optional(),
		OR: z
			.lazy(() => StarScalarWhereWithAggregatesInputSchema)
			.array()
			.optional(),
		NOT: z
			.union([
				z.lazy(() => StarScalarWhereWithAggregatesInputSchema),
				z.lazy(() => StarScalarWhereWithAggregatesInputSchema).array(),
			])
			.optional(),
		id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
		refAuthorId: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
		refMessageId: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
		refChannelId: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
		messageId: z
			.union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
			.optional()
			.nullable(),
		count: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
		users: z.lazy(() => StringNullableListFilterSchema).optional(),
	})
	.strict();

export const ItemWhereInputSchema: z.ZodType<Prisma.ItemWhereInput> = z
	.object({
		AND: z.union([z.lazy(() => ItemWhereInputSchema), z.lazy(() => ItemWhereInputSchema).array()]).optional(),
		OR: z
			.lazy(() => ItemWhereInputSchema)
			.array()
			.optional(),
		NOT: z.union([z.lazy(() => ItemWhereInputSchema), z.lazy(() => ItemWhereInputSchema).array()]).optional(),
		id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		guildId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		active: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
		type: z.union([z.lazy(() => EnumItemTypeFilterSchema), z.lazy(() => ItemTypeSchema)]).optional(),
		name: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		icon: z
			.union([z.lazy(() => StringNullableFilterSchema), z.string()])
			.optional()
			.nullable(),
		about: z
			.union([z.lazy(() => StringNullableFilterSchema), z.string()])
			.optional()
			.nullable(),
		price: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
		stock: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
		limit: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
		data: z
			.union([
				z.lazy(() => ItemDataNullableCompositeFilterSchema),
				z.lazy(() => ItemDataObjectEqualityInputSchema),
			])
			.optional()
			.nullable(),
		response: z
			.union([
				z.lazy(() => PurchaseResponseNullableCompositeFilterSchema),
				z.lazy(() => PurchaseResponseObjectEqualityInputSchema),
			])
			.optional()
			.nullable(),
		requires: z
			.union([
				z.lazy(() => PurchaseRequiresNullableCompositeFilterSchema),
				z.lazy(() => PurchaseRequiresObjectEqualityInputSchema),
			])
			.optional()
			.nullable(),
		autoUse: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
		persist: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
	})
	.strict();

export const ItemOrderByWithRelationInputSchema: z.ZodType<Prisma.ItemOrderByWithRelationInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		guildId: z.lazy(() => SortOrderSchema).optional(),
		active: z.lazy(() => SortOrderSchema).optional(),
		type: z.lazy(() => SortOrderSchema).optional(),
		name: z.lazy(() => SortOrderSchema).optional(),
		icon: z.lazy(() => SortOrderSchema).optional(),
		about: z.lazy(() => SortOrderSchema).optional(),
		price: z.lazy(() => SortOrderSchema).optional(),
		stock: z.lazy(() => SortOrderSchema).optional(),
		limit: z.lazy(() => SortOrderSchema).optional(),
		data: z.lazy(() => ItemDataOrderByInputSchema).optional(),
		response: z.lazy(() => PurchaseResponseOrderByInputSchema).optional(),
		requires: z.lazy(() => PurchaseRequiresOrderByInputSchema).optional(),
		autoUse: z.lazy(() => SortOrderSchema).optional(),
		persist: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const ItemWhereUniqueInputSchema: z.ZodType<Prisma.ItemWhereUniqueInput> = z
	.object({
		id: z.string(),
	})
	.and(
		z
			.object({
				id: z.string().optional(),
				AND: z
					.union([z.lazy(() => ItemWhereInputSchema), z.lazy(() => ItemWhereInputSchema).array()])
					.optional(),
				OR: z
					.lazy(() => ItemWhereInputSchema)
					.array()
					.optional(),
				NOT: z
					.union([z.lazy(() => ItemWhereInputSchema), z.lazy(() => ItemWhereInputSchema).array()])
					.optional(),
				guildId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
				active: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
				type: z.union([z.lazy(() => EnumItemTypeFilterSchema), z.lazy(() => ItemTypeSchema)]).optional(),
				name: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
				icon: z
					.union([z.lazy(() => StringNullableFilterSchema), z.string()])
					.optional()
					.nullable(),
				about: z
					.union([z.lazy(() => StringNullableFilterSchema), z.string()])
					.optional()
					.nullable(),
				price: z.union([z.lazy(() => IntFilterSchema), z.number().int()]).optional(),
				stock: z.union([z.lazy(() => IntFilterSchema), z.number().int()]).optional(),
				limit: z.union([z.lazy(() => IntFilterSchema), z.number().int()]).optional(),
				data: z
					.union([
						z.lazy(() => ItemDataNullableCompositeFilterSchema),
						z.lazy(() => ItemDataObjectEqualityInputSchema),
					])
					.optional()
					.nullable(),
				response: z
					.union([
						z.lazy(() => PurchaseResponseNullableCompositeFilterSchema),
						z.lazy(() => PurchaseResponseObjectEqualityInputSchema),
					])
					.optional()
					.nullable(),
				requires: z
					.union([
						z.lazy(() => PurchaseRequiresNullableCompositeFilterSchema),
						z.lazy(() => PurchaseRequiresObjectEqualityInputSchema),
					])
					.optional()
					.nullable(),
				autoUse: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
				persist: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
			})
			.strict(),
	);

export const ItemOrderByWithAggregationInputSchema: z.ZodType<Prisma.ItemOrderByWithAggregationInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		guildId: z.lazy(() => SortOrderSchema).optional(),
		active: z.lazy(() => SortOrderSchema).optional(),
		type: z.lazy(() => SortOrderSchema).optional(),
		name: z.lazy(() => SortOrderSchema).optional(),
		icon: z.lazy(() => SortOrderSchema).optional(),
		about: z.lazy(() => SortOrderSchema).optional(),
		price: z.lazy(() => SortOrderSchema).optional(),
		stock: z.lazy(() => SortOrderSchema).optional(),
		limit: z.lazy(() => SortOrderSchema).optional(),
		autoUse: z.lazy(() => SortOrderSchema).optional(),
		persist: z.lazy(() => SortOrderSchema).optional(),
		_count: z.lazy(() => ItemCountOrderByAggregateInputSchema).optional(),
		_avg: z.lazy(() => ItemAvgOrderByAggregateInputSchema).optional(),
		_max: z.lazy(() => ItemMaxOrderByAggregateInputSchema).optional(),
		_min: z.lazy(() => ItemMinOrderByAggregateInputSchema).optional(),
		_sum: z.lazy(() => ItemSumOrderByAggregateInputSchema).optional(),
	})
	.strict();

export const ItemScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ItemScalarWhereWithAggregatesInput> = z
	.object({
		AND: z
			.union([
				z.lazy(() => ItemScalarWhereWithAggregatesInputSchema),
				z.lazy(() => ItemScalarWhereWithAggregatesInputSchema).array(),
			])
			.optional(),
		OR: z
			.lazy(() => ItemScalarWhereWithAggregatesInputSchema)
			.array()
			.optional(),
		NOT: z
			.union([
				z.lazy(() => ItemScalarWhereWithAggregatesInputSchema),
				z.lazy(() => ItemScalarWhereWithAggregatesInputSchema).array(),
			])
			.optional(),
		id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
		guildId: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
		active: z.union([z.lazy(() => BoolWithAggregatesFilterSchema), z.boolean()]).optional(),
		type: z.union([z.lazy(() => EnumItemTypeWithAggregatesFilterSchema), z.lazy(() => ItemTypeSchema)]).optional(),
		name: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
		icon: z
			.union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
			.optional()
			.nullable(),
		about: z
			.union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
			.optional()
			.nullable(),
		price: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
		stock: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
		limit: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
		autoUse: z.union([z.lazy(() => BoolWithAggregatesFilterSchema), z.boolean()]).optional(),
		persist: z.union([z.lazy(() => BoolWithAggregatesFilterSchema), z.boolean()]).optional(),
	})
	.strict();

export const UserWhereInputSchema: z.ZodType<Prisma.UserWhereInput> = z
	.object({
		AND: z.union([z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array()]).optional(),
		OR: z
			.lazy(() => UserWhereInputSchema)
			.array()
			.optional(),
		NOT: z.union([z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array()]).optional(),
		id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		birthday: z
			.union([z.lazy(() => StringNullableFilterSchema), z.string()])
			.optional()
			.nullable(),
		timezone: z
			.union([z.lazy(() => StringNullableFilterSchema), z.string()])
			.optional()
			.nullable(),
		bio: z
			.union([z.lazy(() => StringNullableFilterSchema), z.string()])
			.optional()
			.nullable(),
		country: z
			.union([z.lazy(() => StringNullableFilterSchema), z.string()])
			.optional()
			.nullable(),
		locale: z
			.union([z.lazy(() => StringNullableFilterSchema), z.string()])
			.optional()
			.nullable(),
		reputation: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
		lastReputation: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
	})
	.strict();

export const UserOrderByWithRelationInputSchema: z.ZodType<Prisma.UserOrderByWithRelationInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		birthday: z.lazy(() => SortOrderSchema).optional(),
		timezone: z.lazy(() => SortOrderSchema).optional(),
		bio: z.lazy(() => SortOrderSchema).optional(),
		country: z.lazy(() => SortOrderSchema).optional(),
		locale: z.lazy(() => SortOrderSchema).optional(),
		reputation: z.lazy(() => SortOrderSchema).optional(),
		lastReputation: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const UserWhereUniqueInputSchema: z.ZodType<Prisma.UserWhereUniqueInput> = z
	.object({
		id: z.string(),
	})
	.and(
		z
			.object({
				id: z.string().optional(),
				AND: z
					.union([z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array()])
					.optional(),
				OR: z
					.lazy(() => UserWhereInputSchema)
					.array()
					.optional(),
				NOT: z
					.union([z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array()])
					.optional(),
				birthday: z
					.union([z.lazy(() => StringNullableFilterSchema), z.string()])
					.optional()
					.nullable(),
				timezone: z
					.union([z.lazy(() => StringNullableFilterSchema), z.string()])
					.optional()
					.nullable(),
				bio: z
					.union([z.lazy(() => StringNullableFilterSchema), z.string()])
					.optional()
					.nullable(),
				country: z
					.union([z.lazy(() => StringNullableFilterSchema), z.string()])
					.optional()
					.nullable(),
				locale: z
					.union([z.lazy(() => StringNullableFilterSchema), z.string()])
					.optional()
					.nullable(),
				reputation: z.union([z.lazy(() => IntFilterSchema), z.number().int()]).optional(),
				lastReputation: z.union([z.lazy(() => IntFilterSchema), z.number().int()]).optional(),
			})
			.strict(),
	);

export const UserOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserOrderByWithAggregationInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		birthday: z.lazy(() => SortOrderSchema).optional(),
		timezone: z.lazy(() => SortOrderSchema).optional(),
		bio: z.lazy(() => SortOrderSchema).optional(),
		country: z.lazy(() => SortOrderSchema).optional(),
		locale: z.lazy(() => SortOrderSchema).optional(),
		reputation: z.lazy(() => SortOrderSchema).optional(),
		lastReputation: z.lazy(() => SortOrderSchema).optional(),
		_count: z.lazy(() => UserCountOrderByAggregateInputSchema).optional(),
		_avg: z.lazy(() => UserAvgOrderByAggregateInputSchema).optional(),
		_max: z.lazy(() => UserMaxOrderByAggregateInputSchema).optional(),
		_min: z.lazy(() => UserMinOrderByAggregateInputSchema).optional(),
		_sum: z.lazy(() => UserSumOrderByAggregateInputSchema).optional(),
	})
	.strict();

export const UserScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserScalarWhereWithAggregatesInput> = z
	.object({
		AND: z
			.union([
				z.lazy(() => UserScalarWhereWithAggregatesInputSchema),
				z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array(),
			])
			.optional(),
		OR: z
			.lazy(() => UserScalarWhereWithAggregatesInputSchema)
			.array()
			.optional(),
		NOT: z
			.union([
				z.lazy(() => UserScalarWhereWithAggregatesInputSchema),
				z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array(),
			])
			.optional(),
		id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
		birthday: z
			.union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
			.optional()
			.nullable(),
		timezone: z
			.union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
			.optional()
			.nullable(),
		bio: z
			.union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
			.optional()
			.nullable(),
		country: z
			.union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
			.optional()
			.nullable(),
		locale: z
			.union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
			.optional()
			.nullable(),
		reputation: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
		lastReputation: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
	})
	.strict();

export const MemberWhereInputSchema: z.ZodType<Prisma.MemberWhereInput> = z
	.object({
		AND: z.union([z.lazy(() => MemberWhereInputSchema), z.lazy(() => MemberWhereInputSchema).array()]).optional(),
		OR: z
			.lazy(() => MemberWhereInputSchema)
			.array()
			.optional(),
		NOT: z.union([z.lazy(() => MemberWhereInputSchema), z.lazy(() => MemberWhereInputSchema).array()]).optional(),
		id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		userId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		guildId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		bal: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
		exp: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
		card: z
			.union([z.lazy(() => CardCompositeFilterSchema), z.lazy(() => CardObjectEqualityInputSchema)])
			.optional(),
		cardPresets: z
			.union([z.lazy(() => CardCompositeListFilterSchema), z.lazy(() => CardObjectEqualityInputSchema).array()])
			.optional(),
		badges: z
			.union([z.lazy(() => BadgeCompositeListFilterSchema), z.lazy(() => BadgeObjectEqualityInputSchema).array()])
			.optional(),
		inventory: z
			.union([
				z.lazy(() => InventoryItemCompositeListFilterSchema),
				z.lazy(() => InventoryItemObjectEqualityInputSchema).array(),
			])
			.optional(),
		lastDaily: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
	})
	.strict();

export const MemberOrderByWithRelationInputSchema: z.ZodType<Prisma.MemberOrderByWithRelationInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		userId: z.lazy(() => SortOrderSchema).optional(),
		guildId: z.lazy(() => SortOrderSchema).optional(),
		bal: z.lazy(() => SortOrderSchema).optional(),
		exp: z.lazy(() => SortOrderSchema).optional(),
		card: z.lazy(() => CardOrderByInputSchema).optional(),
		cardPresets: z.lazy(() => CardOrderByCompositeAggregateInputSchema).optional(),
		badges: z.lazy(() => BadgeOrderByCompositeAggregateInputSchema).optional(),
		inventory: z.lazy(() => InventoryItemOrderByCompositeAggregateInputSchema).optional(),
		lastDaily: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const MemberWhereUniqueInputSchema: z.ZodType<Prisma.MemberWhereUniqueInput> = z
	.union([
		z.object({
			id: z.string(),
			guildMemberBadge: z.lazy(() => MemberGuildMemberBadgeCompoundUniqueInputSchema),
			guildMemberItem: z.lazy(() => MemberGuildMemberItemCompoundUniqueInputSchema),
			guildMember: z.lazy(() => MemberGuildMemberCompoundUniqueInputSchema),
		}),
		z.object({
			id: z.string(),
			guildMemberBadge: z.lazy(() => MemberGuildMemberBadgeCompoundUniqueInputSchema),
			guildMemberItem: z.lazy(() => MemberGuildMemberItemCompoundUniqueInputSchema),
		}),
		z.object({
			id: z.string(),
			guildMemberBadge: z.lazy(() => MemberGuildMemberBadgeCompoundUniqueInputSchema),
			guildMember: z.lazy(() => MemberGuildMemberCompoundUniqueInputSchema),
		}),
		z.object({
			id: z.string(),
			guildMemberBadge: z.lazy(() => MemberGuildMemberBadgeCompoundUniqueInputSchema),
		}),
		z.object({
			id: z.string(),
			guildMemberItem: z.lazy(() => MemberGuildMemberItemCompoundUniqueInputSchema),
			guildMember: z.lazy(() => MemberGuildMemberCompoundUniqueInputSchema),
		}),
		z.object({
			id: z.string(),
			guildMemberItem: z.lazy(() => MemberGuildMemberItemCompoundUniqueInputSchema),
		}),
		z.object({
			id: z.string(),
			guildMember: z.lazy(() => MemberGuildMemberCompoundUniqueInputSchema),
		}),
		z.object({
			id: z.string(),
		}),
		z.object({
			guildMemberBadge: z.lazy(() => MemberGuildMemberBadgeCompoundUniqueInputSchema),
			guildMemberItem: z.lazy(() => MemberGuildMemberItemCompoundUniqueInputSchema),
			guildMember: z.lazy(() => MemberGuildMemberCompoundUniqueInputSchema),
		}),
		z.object({
			guildMemberBadge: z.lazy(() => MemberGuildMemberBadgeCompoundUniqueInputSchema),
			guildMemberItem: z.lazy(() => MemberGuildMemberItemCompoundUniqueInputSchema),
		}),
		z.object({
			guildMemberBadge: z.lazy(() => MemberGuildMemberBadgeCompoundUniqueInputSchema),
			guildMember: z.lazy(() => MemberGuildMemberCompoundUniqueInputSchema),
		}),
		z.object({
			guildMemberBadge: z.lazy(() => MemberGuildMemberBadgeCompoundUniqueInputSchema),
		}),
		z.object({
			guildMemberItem: z.lazy(() => MemberGuildMemberItemCompoundUniqueInputSchema),
			guildMember: z.lazy(() => MemberGuildMemberCompoundUniqueInputSchema),
		}),
		z.object({
			guildMemberItem: z.lazy(() => MemberGuildMemberItemCompoundUniqueInputSchema),
		}),
		z.object({
			guildMember: z.lazy(() => MemberGuildMemberCompoundUniqueInputSchema),
		}),
	])
	.and(
		z
			.object({
				id: z.string().optional(),
				guildMemberBadge: z.lazy(() => MemberGuildMemberBadgeCompoundUniqueInputSchema).optional(),
				guildMemberItem: z.lazy(() => MemberGuildMemberItemCompoundUniqueInputSchema).optional(),
				guildMember: z.lazy(() => MemberGuildMemberCompoundUniqueInputSchema).optional(),
				AND: z
					.union([z.lazy(() => MemberWhereInputSchema), z.lazy(() => MemberWhereInputSchema).array()])
					.optional(),
				OR: z
					.lazy(() => MemberWhereInputSchema)
					.array()
					.optional(),
				NOT: z
					.union([z.lazy(() => MemberWhereInputSchema), z.lazy(() => MemberWhereInputSchema).array()])
					.optional(),
				userId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
				guildId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
				bal: z.union([z.lazy(() => IntFilterSchema), z.number().int()]).optional(),
				exp: z.union([z.lazy(() => IntFilterSchema), z.number().int()]).optional(),
				card: z
					.union([z.lazy(() => CardCompositeFilterSchema), z.lazy(() => CardObjectEqualityInputSchema)])
					.optional(),
				cardPresets: z
					.union([
						z.lazy(() => CardCompositeListFilterSchema),
						z.lazy(() => CardObjectEqualityInputSchema).array(),
					])
					.optional(),
				badges: z
					.union([
						z.lazy(() => BadgeCompositeListFilterSchema),
						z.lazy(() => BadgeObjectEqualityInputSchema).array(),
					])
					.optional(),
				inventory: z
					.union([
						z.lazy(() => InventoryItemCompositeListFilterSchema),
						z.lazy(() => InventoryItemObjectEqualityInputSchema).array(),
					])
					.optional(),
				lastDaily: z.union([z.lazy(() => IntFilterSchema), z.number().int()]).optional(),
			})
			.strict(),
	);

export const MemberOrderByWithAggregationInputSchema: z.ZodType<Prisma.MemberOrderByWithAggregationInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		userId: z.lazy(() => SortOrderSchema).optional(),
		guildId: z.lazy(() => SortOrderSchema).optional(),
		bal: z.lazy(() => SortOrderSchema).optional(),
		exp: z.lazy(() => SortOrderSchema).optional(),
		lastDaily: z.lazy(() => SortOrderSchema).optional(),
		_count: z.lazy(() => MemberCountOrderByAggregateInputSchema).optional(),
		_avg: z.lazy(() => MemberAvgOrderByAggregateInputSchema).optional(),
		_max: z.lazy(() => MemberMaxOrderByAggregateInputSchema).optional(),
		_min: z.lazy(() => MemberMinOrderByAggregateInputSchema).optional(),
		_sum: z.lazy(() => MemberSumOrderByAggregateInputSchema).optional(),
	})
	.strict();

export const MemberScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.MemberScalarWhereWithAggregatesInput> = z
	.object({
		AND: z
			.union([
				z.lazy(() => MemberScalarWhereWithAggregatesInputSchema),
				z.lazy(() => MemberScalarWhereWithAggregatesInputSchema).array(),
			])
			.optional(),
		OR: z
			.lazy(() => MemberScalarWhereWithAggregatesInputSchema)
			.array()
			.optional(),
		NOT: z
			.union([
				z.lazy(() => MemberScalarWhereWithAggregatesInputSchema),
				z.lazy(() => MemberScalarWhereWithAggregatesInputSchema).array(),
			])
			.optional(),
		id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
		userId: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
		guildId: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
		bal: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
		exp: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
		lastDaily: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
	})
	.strict();

export const MessageCreateInputSchema: z.ZodType<Prisma.MessageCreateInput> = z
	.object({
		id: z.string().optional(),
		guildId: z.string(),
		channelId: z.string(),
		messageId: z.string(),
		content: z.string(),
		embeds: z
			.union([
				z.lazy(() => DiscordEmbedListCreateEnvelopeInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema).array(),
			])
			.optional(),
	})
	.strict();

export const MessageUncheckedCreateInputSchema: z.ZodType<Prisma.MessageUncheckedCreateInput> = z
	.object({
		id: z.string().optional(),
		guildId: z.string(),
		channelId: z.string(),
		messageId: z.string(),
		content: z.string(),
		embeds: z
			.union([
				z.lazy(() => DiscordEmbedListCreateEnvelopeInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema).array(),
			])
			.optional(),
	})
	.strict();

export const MessageUpdateInputSchema: z.ZodType<Prisma.MessageUpdateInput> = z
	.object({
		guildId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		channelId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		messageId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		content: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		embeds: z
			.union([
				z.lazy(() => DiscordEmbedListUpdateEnvelopeInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema).array(),
			])
			.optional(),
	})
	.strict();

export const MessageUncheckedUpdateInputSchema: z.ZodType<Prisma.MessageUncheckedUpdateInput> = z
	.object({
		guildId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		channelId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		messageId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		content: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		embeds: z
			.union([
				z.lazy(() => DiscordEmbedListUpdateEnvelopeInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema).array(),
			])
			.optional(),
	})
	.strict();

export const MessageCreateManyInputSchema: z.ZodType<Prisma.MessageCreateManyInput> = z
	.object({
		id: z.string().optional(),
		guildId: z.string(),
		channelId: z.string(),
		messageId: z.string(),
		content: z.string(),
		embeds: z
			.union([
				z.lazy(() => DiscordEmbedListCreateEnvelopeInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema).array(),
			])
			.optional(),
	})
	.strict();

export const MessageUpdateManyMutationInputSchema: z.ZodType<Prisma.MessageUpdateManyMutationInput> = z
	.object({
		guildId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		channelId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		messageId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		content: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		embeds: z
			.union([
				z.lazy(() => DiscordEmbedListUpdateEnvelopeInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema).array(),
			])
			.optional(),
	})
	.strict();

export const MessageUncheckedUpdateManyInputSchema: z.ZodType<Prisma.MessageUncheckedUpdateManyInput> = z
	.object({
		guildId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		channelId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		messageId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		content: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		embeds: z
			.union([
				z.lazy(() => DiscordEmbedListUpdateEnvelopeInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema).array(),
			])
			.optional(),
	})
	.strict();

export const GuildCreateInputSchema: z.ZodType<Prisma.GuildCreateInput> = z
	.object({
		id: z.string(),
		locale: z.string().optional(),
		timezone: z.string().optional().nullable(),
		levels: z.union([z.lazy(() => LevelsCreateEnvelopeInputSchema), z.lazy(() => LevelsCreateInputSchema)]),
		stars: z.union([z.lazy(() => StarsCreateEnvelopeInputSchema), z.lazy(() => StarsCreateInputSchema)]),
		economy: z.union([z.lazy(() => EconomyCreateEnvelopeInputSchema), z.lazy(() => EconomyCreateInputSchema)]),
		embeds: z
			.union([
				z.lazy(() => DiscordEmbedListCreateEnvelopeInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema).array(),
			])
			.optional(),
		roleRestriction: z.union([
			z.lazy(() => RestrictionCreateEnvelopeInputSchema),
			z.lazy(() => RestrictionCreateInputSchema),
		]),
		channelRestriction: z.union([
			z.lazy(() => RestrictionCreateEnvelopeInputSchema),
			z.lazy(() => RestrictionCreateInputSchema),
		]),
		embedColor: z.number().int().optional().nullable(),
	})
	.strict();

export const GuildUncheckedCreateInputSchema: z.ZodType<Prisma.GuildUncheckedCreateInput> = z
	.object({
		id: z.string(),
		locale: z.string().optional(),
		timezone: z.string().optional().nullable(),
		levels: z.union([z.lazy(() => LevelsCreateEnvelopeInputSchema), z.lazy(() => LevelsCreateInputSchema)]),
		stars: z.union([z.lazy(() => StarsCreateEnvelopeInputSchema), z.lazy(() => StarsCreateInputSchema)]),
		economy: z.union([z.lazy(() => EconomyCreateEnvelopeInputSchema), z.lazy(() => EconomyCreateInputSchema)]),
		embeds: z
			.union([
				z.lazy(() => DiscordEmbedListCreateEnvelopeInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema).array(),
			])
			.optional(),
		roleRestriction: z.union([
			z.lazy(() => RestrictionCreateEnvelopeInputSchema),
			z.lazy(() => RestrictionCreateInputSchema),
		]),
		channelRestriction: z.union([
			z.lazy(() => RestrictionCreateEnvelopeInputSchema),
			z.lazy(() => RestrictionCreateInputSchema),
		]),
		embedColor: z.number().int().optional().nullable(),
	})
	.strict();

export const GuildUpdateInputSchema: z.ZodType<Prisma.GuildUpdateInput> = z
	.object({
		locale: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		timezone: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		levels: z
			.union([z.lazy(() => LevelsUpdateEnvelopeInputSchema), z.lazy(() => LevelsCreateInputSchema)])
			.optional(),
		stars: z.union([z.lazy(() => StarsUpdateEnvelopeInputSchema), z.lazy(() => StarsCreateInputSchema)]).optional(),
		economy: z
			.union([z.lazy(() => EconomyUpdateEnvelopeInputSchema), z.lazy(() => EconomyCreateInputSchema)])
			.optional(),
		embeds: z
			.union([
				z.lazy(() => DiscordEmbedListUpdateEnvelopeInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema).array(),
			])
			.optional(),
		roleRestriction: z
			.union([z.lazy(() => RestrictionUpdateEnvelopeInputSchema), z.lazy(() => RestrictionCreateInputSchema)])
			.optional(),
		channelRestriction: z
			.union([z.lazy(() => RestrictionUpdateEnvelopeInputSchema), z.lazy(() => RestrictionCreateInputSchema)])
			.optional(),
		embedColor: z
			.union([z.number().int(), z.lazy(() => NullableIntFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
	})
	.strict();

export const GuildUncheckedUpdateInputSchema: z.ZodType<Prisma.GuildUncheckedUpdateInput> = z
	.object({
		locale: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		timezone: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		levels: z
			.union([z.lazy(() => LevelsUpdateEnvelopeInputSchema), z.lazy(() => LevelsCreateInputSchema)])
			.optional(),
		stars: z.union([z.lazy(() => StarsUpdateEnvelopeInputSchema), z.lazy(() => StarsCreateInputSchema)]).optional(),
		economy: z
			.union([z.lazy(() => EconomyUpdateEnvelopeInputSchema), z.lazy(() => EconomyCreateInputSchema)])
			.optional(),
		embeds: z
			.union([
				z.lazy(() => DiscordEmbedListUpdateEnvelopeInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema).array(),
			])
			.optional(),
		roleRestriction: z
			.union([z.lazy(() => RestrictionUpdateEnvelopeInputSchema), z.lazy(() => RestrictionCreateInputSchema)])
			.optional(),
		channelRestriction: z
			.union([z.lazy(() => RestrictionUpdateEnvelopeInputSchema), z.lazy(() => RestrictionCreateInputSchema)])
			.optional(),
		embedColor: z
			.union([z.number().int(), z.lazy(() => NullableIntFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
	})
	.strict();

export const GuildCreateManyInputSchema: z.ZodType<Prisma.GuildCreateManyInput> = z
	.object({
		id: z.string(),
		locale: z.string().optional(),
		timezone: z.string().optional().nullable(),
		levels: z.union([z.lazy(() => LevelsCreateEnvelopeInputSchema), z.lazy(() => LevelsCreateInputSchema)]),
		stars: z.union([z.lazy(() => StarsCreateEnvelopeInputSchema), z.lazy(() => StarsCreateInputSchema)]),
		economy: z.union([z.lazy(() => EconomyCreateEnvelopeInputSchema), z.lazy(() => EconomyCreateInputSchema)]),
		embeds: z
			.union([
				z.lazy(() => DiscordEmbedListCreateEnvelopeInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema).array(),
			])
			.optional(),
		roleRestriction: z.union([
			z.lazy(() => RestrictionCreateEnvelopeInputSchema),
			z.lazy(() => RestrictionCreateInputSchema),
		]),
		channelRestriction: z.union([
			z.lazy(() => RestrictionCreateEnvelopeInputSchema),
			z.lazy(() => RestrictionCreateInputSchema),
		]),
		embedColor: z.number().int().optional().nullable(),
	})
	.strict();

export const GuildUpdateManyMutationInputSchema: z.ZodType<Prisma.GuildUpdateManyMutationInput> = z
	.object({
		locale: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		timezone: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		levels: z
			.union([z.lazy(() => LevelsUpdateEnvelopeInputSchema), z.lazy(() => LevelsCreateInputSchema)])
			.optional(),
		stars: z.union([z.lazy(() => StarsUpdateEnvelopeInputSchema), z.lazy(() => StarsCreateInputSchema)]).optional(),
		economy: z
			.union([z.lazy(() => EconomyUpdateEnvelopeInputSchema), z.lazy(() => EconomyCreateInputSchema)])
			.optional(),
		embeds: z
			.union([
				z.lazy(() => DiscordEmbedListUpdateEnvelopeInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema).array(),
			])
			.optional(),
		roleRestriction: z
			.union([z.lazy(() => RestrictionUpdateEnvelopeInputSchema), z.lazy(() => RestrictionCreateInputSchema)])
			.optional(),
		channelRestriction: z
			.union([z.lazy(() => RestrictionUpdateEnvelopeInputSchema), z.lazy(() => RestrictionCreateInputSchema)])
			.optional(),
		embedColor: z
			.union([z.number().int(), z.lazy(() => NullableIntFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
	})
	.strict();

export const GuildUncheckedUpdateManyInputSchema: z.ZodType<Prisma.GuildUncheckedUpdateManyInput> = z
	.object({
		locale: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		timezone: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		levels: z
			.union([z.lazy(() => LevelsUpdateEnvelopeInputSchema), z.lazy(() => LevelsCreateInputSchema)])
			.optional(),
		stars: z.union([z.lazy(() => StarsUpdateEnvelopeInputSchema), z.lazy(() => StarsCreateInputSchema)]).optional(),
		economy: z
			.union([z.lazy(() => EconomyUpdateEnvelopeInputSchema), z.lazy(() => EconomyCreateInputSchema)])
			.optional(),
		embeds: z
			.union([
				z.lazy(() => DiscordEmbedListUpdateEnvelopeInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema).array(),
			])
			.optional(),
		roleRestriction: z
			.union([z.lazy(() => RestrictionUpdateEnvelopeInputSchema), z.lazy(() => RestrictionCreateInputSchema)])
			.optional(),
		channelRestriction: z
			.union([z.lazy(() => RestrictionUpdateEnvelopeInputSchema), z.lazy(() => RestrictionCreateInputSchema)])
			.optional(),
		embedColor: z
			.union([z.number().int(), z.lazy(() => NullableIntFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
	})
	.strict();

export const ReactionRoleCreateInputSchema: z.ZodType<Prisma.ReactionRoleCreateInput> = z
	.object({
		id: z.string().optional(),
		guildId: z.string(),
		messageId: z.string(),
		channelId: z.string().length(17, { message: "You must select a channel." }),
		messageContent: z.string().optional(),
		messageEmbed: z
			.union([
				z.lazy(() => DiscordEmbedNullableCreateEnvelopeInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema),
			])
			.optional()
			.nullable(),
		alias: z.string(),
		type: z.lazy(() => ReactionRoleTypeSchema).optional(),
		enabled: z.boolean().optional(),
		pairs: z
			.union([
				z.lazy(() => ReactionRolePairListCreateEnvelopeInputSchema),
				z.lazy(() => ReactionRolePairCreateInputSchema),
				z.lazy(() => ReactionRolePairCreateInputSchema).array(),
			])
			.optional(),
	})
	.strict();

export const ReactionRoleUncheckedCreateInputSchema: z.ZodType<Prisma.ReactionRoleUncheckedCreateInput> = z
	.object({
		id: z.string().optional(),
		guildId: z.string(),
		messageId: z.string(),
		channelId: z.string().length(17, { message: "You must select a channel." }),
		messageContent: z.string().optional(),
		messageEmbed: z
			.union([
				z.lazy(() => DiscordEmbedNullableCreateEnvelopeInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema),
			])
			.optional()
			.nullable(),
		alias: z.string(),
		type: z.lazy(() => ReactionRoleTypeSchema).optional(),
		enabled: z.boolean().optional(),
		pairs: z
			.union([
				z.lazy(() => ReactionRolePairListCreateEnvelopeInputSchema),
				z.lazy(() => ReactionRolePairCreateInputSchema),
				z.lazy(() => ReactionRolePairCreateInputSchema).array(),
			])
			.optional(),
	})
	.strict();

export const ReactionRoleUpdateInputSchema: z.ZodType<Prisma.ReactionRoleUpdateInput> = z
	.object({
		guildId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		messageId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		channelId: z
			.union([
				z.string().length(17, { message: "You must select a channel." }),
				z.lazy(() => StringFieldUpdateOperationsInputSchema),
			])
			.optional(),
		messageContent: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		messageEmbed: z
			.union([
				z.lazy(() => DiscordEmbedNullableUpdateEnvelopeInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema),
			])
			.optional()
			.nullable(),
		alias: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		type: z
			.union([
				z.lazy(() => ReactionRoleTypeSchema),
				z.lazy(() => EnumReactionRoleTypeFieldUpdateOperationsInputSchema),
			])
			.optional(),
		enabled: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
		pairs: z
			.union([
				z.lazy(() => ReactionRolePairListUpdateEnvelopeInputSchema),
				z.lazy(() => ReactionRolePairCreateInputSchema),
				z.lazy(() => ReactionRolePairCreateInputSchema).array(),
			])
			.optional(),
	})
	.strict();

export const ReactionRoleUncheckedUpdateInputSchema: z.ZodType<Prisma.ReactionRoleUncheckedUpdateInput> = z
	.object({
		guildId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		messageId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		channelId: z
			.union([
				z.string().length(17, { message: "You must select a channel." }),
				z.lazy(() => StringFieldUpdateOperationsInputSchema),
			])
			.optional(),
		messageContent: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		messageEmbed: z
			.union([
				z.lazy(() => DiscordEmbedNullableUpdateEnvelopeInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema),
			])
			.optional()
			.nullable(),
		alias: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		type: z
			.union([
				z.lazy(() => ReactionRoleTypeSchema),
				z.lazy(() => EnumReactionRoleTypeFieldUpdateOperationsInputSchema),
			])
			.optional(),
		enabled: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
		pairs: z
			.union([
				z.lazy(() => ReactionRolePairListUpdateEnvelopeInputSchema),
				z.lazy(() => ReactionRolePairCreateInputSchema),
				z.lazy(() => ReactionRolePairCreateInputSchema).array(),
			])
			.optional(),
	})
	.strict();

export const ReactionRoleCreateManyInputSchema: z.ZodType<Prisma.ReactionRoleCreateManyInput> = z
	.object({
		id: z.string().optional(),
		guildId: z.string(),
		messageId: z.string(),
		channelId: z.string().length(17, { message: "You must select a channel." }),
		messageContent: z.string().optional(),
		messageEmbed: z
			.union([
				z.lazy(() => DiscordEmbedNullableCreateEnvelopeInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema),
			])
			.optional()
			.nullable(),
		alias: z.string(),
		type: z.lazy(() => ReactionRoleTypeSchema).optional(),
		enabled: z.boolean().optional(),
		pairs: z
			.union([
				z.lazy(() => ReactionRolePairListCreateEnvelopeInputSchema),
				z.lazy(() => ReactionRolePairCreateInputSchema),
				z.lazy(() => ReactionRolePairCreateInputSchema).array(),
			])
			.optional(),
	})
	.strict();

export const ReactionRoleUpdateManyMutationInputSchema: z.ZodType<Prisma.ReactionRoleUpdateManyMutationInput> = z
	.object({
		guildId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		messageId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		channelId: z
			.union([
				z.string().length(17, { message: "You must select a channel." }),
				z.lazy(() => StringFieldUpdateOperationsInputSchema),
			])
			.optional(),
		messageContent: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		messageEmbed: z
			.union([
				z.lazy(() => DiscordEmbedNullableUpdateEnvelopeInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema),
			])
			.optional()
			.nullable(),
		alias: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		type: z
			.union([
				z.lazy(() => ReactionRoleTypeSchema),
				z.lazy(() => EnumReactionRoleTypeFieldUpdateOperationsInputSchema),
			])
			.optional(),
		enabled: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
		pairs: z
			.union([
				z.lazy(() => ReactionRolePairListUpdateEnvelopeInputSchema),
				z.lazy(() => ReactionRolePairCreateInputSchema),
				z.lazy(() => ReactionRolePairCreateInputSchema).array(),
			])
			.optional(),
	})
	.strict();

export const ReactionRoleUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ReactionRoleUncheckedUpdateManyInput> = z
	.object({
		guildId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		messageId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		channelId: z
			.union([
				z.string().length(17, { message: "You must select a channel." }),
				z.lazy(() => StringFieldUpdateOperationsInputSchema),
			])
			.optional(),
		messageContent: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		messageEmbed: z
			.union([
				z.lazy(() => DiscordEmbedNullableUpdateEnvelopeInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema),
			])
			.optional()
			.nullable(),
		alias: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		type: z
			.union([
				z.lazy(() => ReactionRoleTypeSchema),
				z.lazy(() => EnumReactionRoleTypeFieldUpdateOperationsInputSchema),
			])
			.optional(),
		enabled: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
		pairs: z
			.union([
				z.lazy(() => ReactionRolePairListUpdateEnvelopeInputSchema),
				z.lazy(() => ReactionRolePairCreateInputSchema),
				z.lazy(() => ReactionRolePairCreateInputSchema).array(),
			])
			.optional(),
	})
	.strict();

export const StarCreateInputSchema: z.ZodType<Prisma.StarCreateInput> = z
	.object({
		id: z.string().optional(),
		refAuthorId: z.string(),
		refMessageId: z.string(),
		refChannelId: z.string(),
		messageId: z.string().optional().nullable(),
		count: z.number().int().optional(),
		users: z.union([z.lazy(() => StarCreateusersInputSchema), z.string().array()]).optional(),
	})
	.strict();

export const StarUncheckedCreateInputSchema: z.ZodType<Prisma.StarUncheckedCreateInput> = z
	.object({
		id: z.string().optional(),
		refAuthorId: z.string(),
		refMessageId: z.string(),
		refChannelId: z.string(),
		messageId: z.string().optional().nullable(),
		count: z.number().int().optional(),
		users: z.union([z.lazy(() => StarCreateusersInputSchema), z.string().array()]).optional(),
	})
	.strict();

export const StarUpdateInputSchema: z.ZodType<Prisma.StarUpdateInput> = z
	.object({
		refAuthorId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		refMessageId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		refChannelId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		messageId: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		count: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		users: z.union([z.lazy(() => StarUpdateusersInputSchema), z.string().array()]).optional(),
	})
	.strict();

export const StarUncheckedUpdateInputSchema: z.ZodType<Prisma.StarUncheckedUpdateInput> = z
	.object({
		refAuthorId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		refMessageId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		refChannelId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		messageId: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		count: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		users: z.union([z.lazy(() => StarUpdateusersInputSchema), z.string().array()]).optional(),
	})
	.strict();

export const StarCreateManyInputSchema: z.ZodType<Prisma.StarCreateManyInput> = z
	.object({
		id: z.string().optional(),
		refAuthorId: z.string(),
		refMessageId: z.string(),
		refChannelId: z.string(),
		messageId: z.string().optional().nullable(),
		count: z.number().int().optional(),
		users: z.union([z.lazy(() => StarCreateusersInputSchema), z.string().array()]).optional(),
	})
	.strict();

export const StarUpdateManyMutationInputSchema: z.ZodType<Prisma.StarUpdateManyMutationInput> = z
	.object({
		refAuthorId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		refMessageId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		refChannelId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		messageId: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		count: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		users: z.union([z.lazy(() => StarUpdateusersInputSchema), z.string().array()]).optional(),
	})
	.strict();

export const StarUncheckedUpdateManyInputSchema: z.ZodType<Prisma.StarUncheckedUpdateManyInput> = z
	.object({
		refAuthorId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		refMessageId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		refChannelId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		messageId: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		count: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		users: z.union([z.lazy(() => StarUpdateusersInputSchema), z.string().array()]).optional(),
	})
	.strict();

export const ItemCreateInputSchema: z.ZodType<Prisma.ItemCreateInput> = z
	.object({
		id: z.string().optional(),
		guildId: z.string(),
		active: z.boolean().optional(),
		type: z.lazy(() => ItemTypeSchema).optional(),
		name: z.string(),
		icon: z.string().optional().nullable(),
		about: z.string().optional().nullable(),
		price: z.number().int().optional(),
		stock: z.number().int().optional(),
		limit: z.number().int().optional(),
		data: z
			.union([z.lazy(() => ItemDataNullableCreateEnvelopeInputSchema), z.lazy(() => ItemDataCreateInputSchema)])
			.optional()
			.nullable(),
		response: z
			.union([
				z.lazy(() => PurchaseResponseNullableCreateEnvelopeInputSchema),
				z.lazy(() => PurchaseResponseCreateInputSchema),
			])
			.optional()
			.nullable(),
		requires: z
			.union([
				z.lazy(() => PurchaseRequiresNullableCreateEnvelopeInputSchema),
				z.lazy(() => PurchaseRequiresCreateInputSchema),
			])
			.optional()
			.nullable(),
		autoUse: z.boolean().optional(),
		persist: z.boolean().optional(),
	})
	.strict();

export const ItemUncheckedCreateInputSchema: z.ZodType<Prisma.ItemUncheckedCreateInput> = z
	.object({
		id: z.string().optional(),
		guildId: z.string(),
		active: z.boolean().optional(),
		type: z.lazy(() => ItemTypeSchema).optional(),
		name: z.string(),
		icon: z.string().optional().nullable(),
		about: z.string().optional().nullable(),
		price: z.number().int().optional(),
		stock: z.number().int().optional(),
		limit: z.number().int().optional(),
		data: z
			.union([z.lazy(() => ItemDataNullableCreateEnvelopeInputSchema), z.lazy(() => ItemDataCreateInputSchema)])
			.optional()
			.nullable(),
		response: z
			.union([
				z.lazy(() => PurchaseResponseNullableCreateEnvelopeInputSchema),
				z.lazy(() => PurchaseResponseCreateInputSchema),
			])
			.optional()
			.nullable(),
		requires: z
			.union([
				z.lazy(() => PurchaseRequiresNullableCreateEnvelopeInputSchema),
				z.lazy(() => PurchaseRequiresCreateInputSchema),
			])
			.optional()
			.nullable(),
		autoUse: z.boolean().optional(),
		persist: z.boolean().optional(),
	})
	.strict();

export const ItemUpdateInputSchema: z.ZodType<Prisma.ItemUpdateInput> = z
	.object({
		guildId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		active: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
		type: z
			.union([z.lazy(() => ItemTypeSchema), z.lazy(() => EnumItemTypeFieldUpdateOperationsInputSchema)])
			.optional(),
		name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		icon: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		about: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		price: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		stock: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		limit: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		data: z
			.union([z.lazy(() => ItemDataNullableUpdateEnvelopeInputSchema), z.lazy(() => ItemDataCreateInputSchema)])
			.optional()
			.nullable(),
		response: z
			.union([
				z.lazy(() => PurchaseResponseNullableUpdateEnvelopeInputSchema),
				z.lazy(() => PurchaseResponseCreateInputSchema),
			])
			.optional()
			.nullable(),
		requires: z
			.union([
				z.lazy(() => PurchaseRequiresNullableUpdateEnvelopeInputSchema),
				z.lazy(() => PurchaseRequiresCreateInputSchema),
			])
			.optional()
			.nullable(),
		autoUse: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
		persist: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
	})
	.strict();

export const ItemUncheckedUpdateInputSchema: z.ZodType<Prisma.ItemUncheckedUpdateInput> = z
	.object({
		guildId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		active: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
		type: z
			.union([z.lazy(() => ItemTypeSchema), z.lazy(() => EnumItemTypeFieldUpdateOperationsInputSchema)])
			.optional(),
		name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		icon: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		about: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		price: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		stock: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		limit: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		data: z
			.union([z.lazy(() => ItemDataNullableUpdateEnvelopeInputSchema), z.lazy(() => ItemDataCreateInputSchema)])
			.optional()
			.nullable(),
		response: z
			.union([
				z.lazy(() => PurchaseResponseNullableUpdateEnvelopeInputSchema),
				z.lazy(() => PurchaseResponseCreateInputSchema),
			])
			.optional()
			.nullable(),
		requires: z
			.union([
				z.lazy(() => PurchaseRequiresNullableUpdateEnvelopeInputSchema),
				z.lazy(() => PurchaseRequiresCreateInputSchema),
			])
			.optional()
			.nullable(),
		autoUse: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
		persist: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
	})
	.strict();

export const ItemCreateManyInputSchema: z.ZodType<Prisma.ItemCreateManyInput> = z
	.object({
		id: z.string().optional(),
		guildId: z.string(),
		active: z.boolean().optional(),
		type: z.lazy(() => ItemTypeSchema).optional(),
		name: z.string(),
		icon: z.string().optional().nullable(),
		about: z.string().optional().nullable(),
		price: z.number().int().optional(),
		stock: z.number().int().optional(),
		limit: z.number().int().optional(),
		data: z
			.union([z.lazy(() => ItemDataNullableCreateEnvelopeInputSchema), z.lazy(() => ItemDataCreateInputSchema)])
			.optional()
			.nullable(),
		response: z
			.union([
				z.lazy(() => PurchaseResponseNullableCreateEnvelopeInputSchema),
				z.lazy(() => PurchaseResponseCreateInputSchema),
			])
			.optional()
			.nullable(),
		requires: z
			.union([
				z.lazy(() => PurchaseRequiresNullableCreateEnvelopeInputSchema),
				z.lazy(() => PurchaseRequiresCreateInputSchema),
			])
			.optional()
			.nullable(),
		autoUse: z.boolean().optional(),
		persist: z.boolean().optional(),
	})
	.strict();

export const ItemUpdateManyMutationInputSchema: z.ZodType<Prisma.ItemUpdateManyMutationInput> = z
	.object({
		guildId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		active: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
		type: z
			.union([z.lazy(() => ItemTypeSchema), z.lazy(() => EnumItemTypeFieldUpdateOperationsInputSchema)])
			.optional(),
		name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		icon: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		about: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		price: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		stock: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		limit: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		data: z
			.union([z.lazy(() => ItemDataNullableUpdateEnvelopeInputSchema), z.lazy(() => ItemDataCreateInputSchema)])
			.optional()
			.nullable(),
		response: z
			.union([
				z.lazy(() => PurchaseResponseNullableUpdateEnvelopeInputSchema),
				z.lazy(() => PurchaseResponseCreateInputSchema),
			])
			.optional()
			.nullable(),
		requires: z
			.union([
				z.lazy(() => PurchaseRequiresNullableUpdateEnvelopeInputSchema),
				z.lazy(() => PurchaseRequiresCreateInputSchema),
			])
			.optional()
			.nullable(),
		autoUse: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
		persist: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
	})
	.strict();

export const ItemUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ItemUncheckedUpdateManyInput> = z
	.object({
		guildId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		active: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
		type: z
			.union([z.lazy(() => ItemTypeSchema), z.lazy(() => EnumItemTypeFieldUpdateOperationsInputSchema)])
			.optional(),
		name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		icon: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		about: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		price: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		stock: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		limit: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		data: z
			.union([z.lazy(() => ItemDataNullableUpdateEnvelopeInputSchema), z.lazy(() => ItemDataCreateInputSchema)])
			.optional()
			.nullable(),
		response: z
			.union([
				z.lazy(() => PurchaseResponseNullableUpdateEnvelopeInputSchema),
				z.lazy(() => PurchaseResponseCreateInputSchema),
			])
			.optional()
			.nullable(),
		requires: z
			.union([
				z.lazy(() => PurchaseRequiresNullableUpdateEnvelopeInputSchema),
				z.lazy(() => PurchaseRequiresCreateInputSchema),
			])
			.optional()
			.nullable(),
		autoUse: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
		persist: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
	})
	.strict();

export const UserCreateInputSchema: z.ZodType<Prisma.UserCreateInput> = z
	.object({
		id: z.string(),
		birthday: z.string().optional().nullable(),
		timezone: z.string().optional().nullable(),
		bio: z.string().optional().nullable(),
		country: z.string().optional().nullable(),
		locale: z.string().optional().nullable(),
		reputation: z.number().int().optional(),
		lastReputation: z.number().int().optional(),
	})
	.strict();

export const UserUncheckedCreateInputSchema: z.ZodType<Prisma.UserUncheckedCreateInput> = z
	.object({
		id: z.string(),
		birthday: z.string().optional().nullable(),
		timezone: z.string().optional().nullable(),
		bio: z.string().optional().nullable(),
		country: z.string().optional().nullable(),
		locale: z.string().optional().nullable(),
		reputation: z.number().int().optional(),
		lastReputation: z.number().int().optional(),
	})
	.strict();

export const UserUpdateInputSchema: z.ZodType<Prisma.UserUpdateInput> = z
	.object({
		birthday: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		timezone: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		bio: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		country: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		locale: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		reputation: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		lastReputation: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
	})
	.strict();

export const UserUncheckedUpdateInputSchema: z.ZodType<Prisma.UserUncheckedUpdateInput> = z
	.object({
		birthday: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		timezone: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		bio: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		country: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		locale: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		reputation: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		lastReputation: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
	})
	.strict();

export const UserCreateManyInputSchema: z.ZodType<Prisma.UserCreateManyInput> = z
	.object({
		id: z.string(),
		birthday: z.string().optional().nullable(),
		timezone: z.string().optional().nullable(),
		bio: z.string().optional().nullable(),
		country: z.string().optional().nullable(),
		locale: z.string().optional().nullable(),
		reputation: z.number().int().optional(),
		lastReputation: z.number().int().optional(),
	})
	.strict();

export const UserUpdateManyMutationInputSchema: z.ZodType<Prisma.UserUpdateManyMutationInput> = z
	.object({
		birthday: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		timezone: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		bio: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		country: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		locale: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		reputation: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		lastReputation: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
	})
	.strict();

export const UserUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserUncheckedUpdateManyInput> = z
	.object({
		birthday: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		timezone: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		bio: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		country: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		locale: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		reputation: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		lastReputation: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
	})
	.strict();

export const MemberCreateInputSchema: z.ZodType<Prisma.MemberCreateInput> = z
	.object({
		id: z.string().optional(),
		userId: z.string(),
		guildId: z.string(),
		bal: z.number().int().optional(),
		exp: z.number().int().optional(),
		card: z.union([z.lazy(() => CardCreateEnvelopeInputSchema), z.lazy(() => CardCreateInputSchema)]),
		cardPresets: z
			.union([
				z.lazy(() => CardListCreateEnvelopeInputSchema),
				z.lazy(() => CardCreateInputSchema),
				z.lazy(() => CardCreateInputSchema).array(),
			])
			.optional(),
		badges: z
			.union([
				z.lazy(() => BadgeListCreateEnvelopeInputSchema),
				z.lazy(() => BadgeCreateInputSchema),
				z.lazy(() => BadgeCreateInputSchema).array(),
			])
			.optional(),
		inventory: z
			.union([
				z.lazy(() => InventoryItemListCreateEnvelopeInputSchema),
				z.lazy(() => InventoryItemCreateInputSchema),
				z.lazy(() => InventoryItemCreateInputSchema).array(),
			])
			.optional(),
		lastDaily: z.number().int().optional(),
	})
	.strict();

export const MemberUncheckedCreateInputSchema: z.ZodType<Prisma.MemberUncheckedCreateInput> = z
	.object({
		id: z.string().optional(),
		userId: z.string(),
		guildId: z.string(),
		bal: z.number().int().optional(),
		exp: z.number().int().optional(),
		card: z.union([z.lazy(() => CardCreateEnvelopeInputSchema), z.lazy(() => CardCreateInputSchema)]),
		cardPresets: z
			.union([
				z.lazy(() => CardListCreateEnvelopeInputSchema),
				z.lazy(() => CardCreateInputSchema),
				z.lazy(() => CardCreateInputSchema).array(),
			])
			.optional(),
		badges: z
			.union([
				z.lazy(() => BadgeListCreateEnvelopeInputSchema),
				z.lazy(() => BadgeCreateInputSchema),
				z.lazy(() => BadgeCreateInputSchema).array(),
			])
			.optional(),
		inventory: z
			.union([
				z.lazy(() => InventoryItemListCreateEnvelopeInputSchema),
				z.lazy(() => InventoryItemCreateInputSchema),
				z.lazy(() => InventoryItemCreateInputSchema).array(),
			])
			.optional(),
		lastDaily: z.number().int().optional(),
	})
	.strict();

export const MemberUpdateInputSchema: z.ZodType<Prisma.MemberUpdateInput> = z
	.object({
		userId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		guildId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		bal: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		exp: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		card: z.union([z.lazy(() => CardUpdateEnvelopeInputSchema), z.lazy(() => CardCreateInputSchema)]).optional(),
		cardPresets: z
			.union([
				z.lazy(() => CardListUpdateEnvelopeInputSchema),
				z.lazy(() => CardCreateInputSchema),
				z.lazy(() => CardCreateInputSchema).array(),
			])
			.optional(),
		badges: z
			.union([
				z.lazy(() => BadgeListUpdateEnvelopeInputSchema),
				z.lazy(() => BadgeCreateInputSchema),
				z.lazy(() => BadgeCreateInputSchema).array(),
			])
			.optional(),
		inventory: z
			.union([
				z.lazy(() => InventoryItemListUpdateEnvelopeInputSchema),
				z.lazy(() => InventoryItemCreateInputSchema),
				z.lazy(() => InventoryItemCreateInputSchema).array(),
			])
			.optional(),
		lastDaily: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
	})
	.strict();

export const MemberUncheckedUpdateInputSchema: z.ZodType<Prisma.MemberUncheckedUpdateInput> = z
	.object({
		userId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		guildId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		bal: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		exp: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		card: z.union([z.lazy(() => CardUpdateEnvelopeInputSchema), z.lazy(() => CardCreateInputSchema)]).optional(),
		cardPresets: z
			.union([
				z.lazy(() => CardListUpdateEnvelopeInputSchema),
				z.lazy(() => CardCreateInputSchema),
				z.lazy(() => CardCreateInputSchema).array(),
			])
			.optional(),
		badges: z
			.union([
				z.lazy(() => BadgeListUpdateEnvelopeInputSchema),
				z.lazy(() => BadgeCreateInputSchema),
				z.lazy(() => BadgeCreateInputSchema).array(),
			])
			.optional(),
		inventory: z
			.union([
				z.lazy(() => InventoryItemListUpdateEnvelopeInputSchema),
				z.lazy(() => InventoryItemCreateInputSchema),
				z.lazy(() => InventoryItemCreateInputSchema).array(),
			])
			.optional(),
		lastDaily: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
	})
	.strict();

export const MemberCreateManyInputSchema: z.ZodType<Prisma.MemberCreateManyInput> = z
	.object({
		id: z.string().optional(),
		userId: z.string(),
		guildId: z.string(),
		bal: z.number().int().optional(),
		exp: z.number().int().optional(),
		card: z.union([z.lazy(() => CardCreateEnvelopeInputSchema), z.lazy(() => CardCreateInputSchema)]),
		cardPresets: z
			.union([
				z.lazy(() => CardListCreateEnvelopeInputSchema),
				z.lazy(() => CardCreateInputSchema),
				z.lazy(() => CardCreateInputSchema).array(),
			])
			.optional(),
		badges: z
			.union([
				z.lazy(() => BadgeListCreateEnvelopeInputSchema),
				z.lazy(() => BadgeCreateInputSchema),
				z.lazy(() => BadgeCreateInputSchema).array(),
			])
			.optional(),
		inventory: z
			.union([
				z.lazy(() => InventoryItemListCreateEnvelopeInputSchema),
				z.lazy(() => InventoryItemCreateInputSchema),
				z.lazy(() => InventoryItemCreateInputSchema).array(),
			])
			.optional(),
		lastDaily: z.number().int().optional(),
	})
	.strict();

export const MemberUpdateManyMutationInputSchema: z.ZodType<Prisma.MemberUpdateManyMutationInput> = z
	.object({
		userId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		guildId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		bal: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		exp: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		card: z.union([z.lazy(() => CardUpdateEnvelopeInputSchema), z.lazy(() => CardCreateInputSchema)]).optional(),
		cardPresets: z
			.union([
				z.lazy(() => CardListUpdateEnvelopeInputSchema),
				z.lazy(() => CardCreateInputSchema),
				z.lazy(() => CardCreateInputSchema).array(),
			])
			.optional(),
		badges: z
			.union([
				z.lazy(() => BadgeListUpdateEnvelopeInputSchema),
				z.lazy(() => BadgeCreateInputSchema),
				z.lazy(() => BadgeCreateInputSchema).array(),
			])
			.optional(),
		inventory: z
			.union([
				z.lazy(() => InventoryItemListUpdateEnvelopeInputSchema),
				z.lazy(() => InventoryItemCreateInputSchema),
				z.lazy(() => InventoryItemCreateInputSchema).array(),
			])
			.optional(),
		lastDaily: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
	})
	.strict();

export const MemberUncheckedUpdateManyInputSchema: z.ZodType<Prisma.MemberUncheckedUpdateManyInput> = z
	.object({
		userId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		guildId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		bal: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		exp: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		card: z.union([z.lazy(() => CardUpdateEnvelopeInputSchema), z.lazy(() => CardCreateInputSchema)]).optional(),
		cardPresets: z
			.union([
				z.lazy(() => CardListUpdateEnvelopeInputSchema),
				z.lazy(() => CardCreateInputSchema),
				z.lazy(() => CardCreateInputSchema).array(),
			])
			.optional(),
		badges: z
			.union([
				z.lazy(() => BadgeListUpdateEnvelopeInputSchema),
				z.lazy(() => BadgeCreateInputSchema),
				z.lazy(() => BadgeCreateInputSchema).array(),
			])
			.optional(),
		inventory: z
			.union([
				z.lazy(() => InventoryItemListUpdateEnvelopeInputSchema),
				z.lazy(() => InventoryItemCreateInputSchema),
				z.lazy(() => InventoryItemCreateInputSchema).array(),
			])
			.optional(),
		lastDaily: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
	})
	.strict();

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z
	.object({
		equals: z.string().optional(),
		in: z.string().array().optional(),
		notIn: z.string().array().optional(),
		lt: z.string().optional(),
		lte: z.string().optional(),
		gt: z.string().optional(),
		gte: z.string().optional(),
		contains: z.string().optional(),
		startsWith: z.string().optional(),
		endsWith: z.string().optional(),
		mode: z.lazy(() => QueryModeSchema).optional(),
		not: z.union([z.string(), z.lazy(() => NestedStringFilterSchema)]).optional(),
	})
	.strict();

export const DiscordEmbedCompositeListFilterSchema: z.ZodType<Prisma.DiscordEmbedCompositeListFilter> = z
	.object({
		equals: z
			.lazy(() => DiscordEmbedObjectEqualityInputSchema)
			.array()
			.optional(),
		every: z.lazy(() => DiscordEmbedWhereInputSchema).optional(),
		some: z.lazy(() => DiscordEmbedWhereInputSchema).optional(),
		none: z.lazy(() => DiscordEmbedWhereInputSchema).optional(),
		isEmpty: z.boolean().optional(),
		isSet: z.boolean().optional(),
	})
	.strict();

export const DiscordEmbedObjectEqualityInputSchema: z.ZodType<Prisma.DiscordEmbedObjectEqualityInput> = z
	.object({
		url: z.string(),
		title: z.string(),
		description: z.string(),
		color: z.number(),
		timestamp: z.string(),
		footer: z.lazy(() => DiscordEmbedFooterObjectEqualityInputSchema),
		image: z.lazy(() => DiscordEmbedImageObjectEqualityInputSchema),
		thumbnail: z.lazy(() => DiscordEmbedThumbnailObjectEqualityInputSchema),
		author: z.lazy(() => DiscordEmbedAuthorObjectEqualityInputSchema),
		fields: z
			.lazy(() => DiscordEmbedFieldObjectEqualityInputSchema)
			.array()
			.optional(),
	})
	.strict();

export const DiscordEmbedOrderByCompositeAggregateInputSchema: z.ZodType<Prisma.DiscordEmbedOrderByCompositeAggregateInput> =
	z
		.object({
			_count: z.lazy(() => SortOrderSchema).optional(),
		})
		.strict();

export const MessageCountOrderByAggregateInputSchema: z.ZodType<Prisma.MessageCountOrderByAggregateInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		guildId: z.lazy(() => SortOrderSchema).optional(),
		channelId: z.lazy(() => SortOrderSchema).optional(),
		messageId: z.lazy(() => SortOrderSchema).optional(),
		content: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const MessageMaxOrderByAggregateInputSchema: z.ZodType<Prisma.MessageMaxOrderByAggregateInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		guildId: z.lazy(() => SortOrderSchema).optional(),
		channelId: z.lazy(() => SortOrderSchema).optional(),
		messageId: z.lazy(() => SortOrderSchema).optional(),
		content: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const MessageMinOrderByAggregateInputSchema: z.ZodType<Prisma.MessageMinOrderByAggregateInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		guildId: z.lazy(() => SortOrderSchema).optional(),
		channelId: z.lazy(() => SortOrderSchema).optional(),
		messageId: z.lazy(() => SortOrderSchema).optional(),
		content: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> = z
	.object({
		equals: z.string().optional(),
		in: z.string().array().optional(),
		notIn: z.string().array().optional(),
		lt: z.string().optional(),
		lte: z.string().optional(),
		gt: z.string().optional(),
		gte: z.string().optional(),
		contains: z.string().optional(),
		startsWith: z.string().optional(),
		endsWith: z.string().optional(),
		mode: z.lazy(() => QueryModeSchema).optional(),
		not: z.union([z.string(), z.lazy(() => NestedStringWithAggregatesFilterSchema)]).optional(),
		_count: z.lazy(() => NestedIntFilterSchema).optional(),
		_min: z.lazy(() => NestedStringFilterSchema).optional(),
		_max: z.lazy(() => NestedStringFilterSchema).optional(),
	})
	.strict();

export const StringNullableFilterSchema: z.ZodType<Prisma.StringNullableFilter> = z
	.object({
		equals: z.string().optional().nullable(),
		in: z.string().array().optional().nullable(),
		notIn: z.string().array().optional().nullable(),
		lt: z.string().optional(),
		lte: z.string().optional(),
		gt: z.string().optional(),
		gte: z.string().optional(),
		contains: z.string().optional(),
		startsWith: z.string().optional(),
		endsWith: z.string().optional(),
		mode: z.lazy(() => QueryModeSchema).optional(),
		not: z
			.union([z.string(), z.lazy(() => NestedStringNullableFilterSchema)])
			.optional()
			.nullable(),
		isSet: z.boolean().optional(),
	})
	.strict();

export const LevelsCompositeFilterSchema: z.ZodType<Prisma.LevelsCompositeFilter> = z
	.object({
		equals: z.lazy(() => LevelsObjectEqualityInputSchema).optional(),
		is: z.lazy(() => LevelsWhereInputSchema).optional(),
		isNot: z.lazy(() => LevelsWhereInputSchema).optional(),
	})
	.strict();

export const LevelsObjectEqualityInputSchema: z.ZodType<Prisma.LevelsObjectEqualityInput> = z
	.object({
		enabled: z.boolean(),
		stackRewards: z.boolean(),
		clearOnLeave: z.boolean(),
		addRolesOnJoin: z.boolean(),
		rankCard: z.lazy(() => CardObjectEqualityInputSchema),
		allowCustomRankCard: z.boolean(),
		boost: z.number(),
		boosts: z
			.lazy(() => ExpBoostObjectEqualityInputSchema)
			.array()
			.optional(),
		textExpEnabled: z.boolean(),
		textRateMin: z.number(),
		textRateMax: z.number(),
		textCooldown: z.number(),
		voiceExpEnabled: z.boolean(),
		voiceRateMin: z.number(),
		voiceRateMax: z.number(),
		voiceCooldown: z.number(),
		notifyDestination: z.lazy(() => DestinationSchema),
		notifyMessageType: z.lazy(() => MessageTypeSchema),
		notifyChannel: z.string().optional().nullable(),
		notifyMessageContent: z.string().optional().nullable(),
		notifyMessageEmbed: z
			.lazy(() => DiscordEmbedObjectEqualityInputSchema)
			.optional()
			.nullable(),
		roleRestriction: z.lazy(() => RestrictionObjectEqualityInputSchema),
		channelRestriction: z.lazy(() => RestrictionObjectEqualityInputSchema),
		rewards: z
			.lazy(() => RewardObjectEqualityInputSchema)
			.array()
			.optional(),
	})
	.strict();

export const StarsCompositeFilterSchema: z.ZodType<Prisma.StarsCompositeFilter> = z
	.object({
		equals: z.lazy(() => StarsObjectEqualityInputSchema).optional(),
		is: z.lazy(() => StarsWhereInputSchema).optional(),
		isNot: z.lazy(() => StarsWhereInputSchema).optional(),
	})
	.strict();

export const StarsObjectEqualityInputSchema: z.ZodType<Prisma.StarsObjectEqualityInput> = z
	.object({
		enabled: z.boolean(),
		channelId: z.string().optional().nullable(),
		emoji: z.string(),
		threshold: z.number(),
		duplicateOriginal: z.boolean(),
		selfStarEnabled: z.boolean(),
		selfStarWarning: z.boolean(),
		messageType: z.lazy(() => MessageTypeSchema),
		messageContent: z.string().optional().nullable(),
		embed: z
			.lazy(() => DiscordEmbedObjectEqualityInputSchema)
			.optional()
			.nullable(),
		roleRestriction: z.lazy(() => RestrictionObjectEqualityInputSchema),
		channelRestriction: z.lazy(() => RestrictionObjectEqualityInputSchema),
	})
	.strict();

export const EconomyCompositeFilterSchema: z.ZodType<Prisma.EconomyCompositeFilter> = z
	.object({
		equals: z.lazy(() => EconomyObjectEqualityInputSchema).optional(),
		is: z.lazy(() => EconomyWhereInputSchema).optional(),
		isNot: z.lazy(() => EconomyWhereInputSchema).optional(),
	})
	.strict();

export const EconomyObjectEqualityInputSchema: z.ZodType<Prisma.EconomyObjectEqualityInput> = z
	.object({
		enabled: z.boolean(),
		currencyName: z.string().optional().nullable(),
		currencyIcon: z.string(),
		currencyIconLocation: z.lazy(() => CurrencyIconLocationSchema),
		inventorySize: z.number(),
		wagerMin: z.number(),
		wagerMax: z.number(),
		dailyRewardMin: z.number(),
		dailyRewardMax: z.number(),
		textRateMin: z.number(),
		textRateMax: z.number(),
		textCooldown: z.number(),
		allowNegativeBalance: z.boolean(),
		negativeBalanceLimit: z.number(),
		defaultBalance: z.number(),
		debugMode: z.boolean(),
		clearOnLeave: z.boolean(),
		autoUseItems: z.boolean(),
		roleRestriction: z
			.lazy(() => RestrictionObjectEqualityInputSchema)
			.optional()
			.nullable(),
		channelRestriction: z
			.lazy(() => RestrictionObjectEqualityInputSchema)
			.optional()
			.nullable(),
	})
	.strict();

export const RestrictionCompositeFilterSchema: z.ZodType<Prisma.RestrictionCompositeFilter> = z
	.object({
		equals: z.lazy(() => RestrictionObjectEqualityInputSchema).optional(),
		is: z.lazy(() => RestrictionWhereInputSchema).optional(),
		isNot: z.lazy(() => RestrictionWhereInputSchema).optional(),
	})
	.strict();

export const RestrictionObjectEqualityInputSchema: z.ZodType<Prisma.RestrictionObjectEqualityInput> = z
	.object({
		type: z.lazy(() => RestrictionTypeSchema),
		omit: z.string().array().optional(),
	})
	.strict();

export const IntNullableFilterSchema: z.ZodType<Prisma.IntNullableFilter> = z
	.object({
		equals: z.number().optional().nullable(),
		in: z.number().array().optional().nullable(),
		notIn: z.number().array().optional().nullable(),
		lt: z.number().optional(),
		lte: z.number().optional(),
		gt: z.number().optional(),
		gte: z.number().optional(),
		not: z
			.union([z.number(), z.lazy(() => NestedIntNullableFilterSchema)])
			.optional()
			.nullable(),
		isSet: z.boolean().optional(),
	})
	.strict();

export const LevelsOrderByInputSchema: z.ZodType<Prisma.LevelsOrderByInput> = z
	.object({
		enabled: z.lazy(() => SortOrderSchema).optional(),
		stackRewards: z.lazy(() => SortOrderSchema).optional(),
		clearOnLeave: z.lazy(() => SortOrderSchema).optional(),
		addRolesOnJoin: z.lazy(() => SortOrderSchema).optional(),
		rankCard: z.lazy(() => CardOrderByInputSchema).optional(),
		allowCustomRankCard: z.lazy(() => SortOrderSchema).optional(),
		boost: z.lazy(() => SortOrderSchema).optional(),
		boosts: z.lazy(() => ExpBoostOrderByCompositeAggregateInputSchema).optional(),
		textExpEnabled: z.lazy(() => SortOrderSchema).optional(),
		textRateMin: z.lazy(() => SortOrderSchema).optional(),
		textRateMax: z.lazy(() => SortOrderSchema).optional(),
		textCooldown: z.lazy(() => SortOrderSchema).optional(),
		voiceExpEnabled: z.lazy(() => SortOrderSchema).optional(),
		voiceRateMin: z.lazy(() => SortOrderSchema).optional(),
		voiceRateMax: z.lazy(() => SortOrderSchema).optional(),
		voiceCooldown: z.lazy(() => SortOrderSchema).optional(),
		notifyDestination: z.lazy(() => SortOrderSchema).optional(),
		notifyMessageType: z.lazy(() => SortOrderSchema).optional(),
		notifyChannel: z.lazy(() => SortOrderSchema).optional(),
		notifyMessageContent: z.lazy(() => SortOrderSchema).optional(),
		notifyMessageEmbed: z.lazy(() => DiscordEmbedOrderByInputSchema).optional(),
		roleRestriction: z.lazy(() => RestrictionOrderByInputSchema).optional(),
		channelRestriction: z.lazy(() => RestrictionOrderByInputSchema).optional(),
		rewards: z.lazy(() => RewardOrderByCompositeAggregateInputSchema).optional(),
	})
	.strict();

export const StarsOrderByInputSchema: z.ZodType<Prisma.StarsOrderByInput> = z
	.object({
		enabled: z.lazy(() => SortOrderSchema).optional(),
		channelId: z.lazy(() => SortOrderSchema).optional(),
		emoji: z.lazy(() => SortOrderSchema).optional(),
		threshold: z.lazy(() => SortOrderSchema).optional(),
		duplicateOriginal: z.lazy(() => SortOrderSchema).optional(),
		selfStarEnabled: z.lazy(() => SortOrderSchema).optional(),
		selfStarWarning: z.lazy(() => SortOrderSchema).optional(),
		messageType: z.lazy(() => SortOrderSchema).optional(),
		messageContent: z.lazy(() => SortOrderSchema).optional(),
		embed: z.lazy(() => DiscordEmbedOrderByInputSchema).optional(),
		roleRestriction: z.lazy(() => RestrictionOrderByInputSchema).optional(),
		channelRestriction: z.lazy(() => RestrictionOrderByInputSchema).optional(),
	})
	.strict();

export const EconomyOrderByInputSchema: z.ZodType<Prisma.EconomyOrderByInput> = z
	.object({
		enabled: z.lazy(() => SortOrderSchema).optional(),
		currencyName: z.lazy(() => SortOrderSchema).optional(),
		currencyIcon: z.lazy(() => SortOrderSchema).optional(),
		currencyIconLocation: z.lazy(() => SortOrderSchema).optional(),
		inventorySize: z.lazy(() => SortOrderSchema).optional(),
		wagerMin: z.lazy(() => SortOrderSchema).optional(),
		wagerMax: z.lazy(() => SortOrderSchema).optional(),
		dailyRewardMin: z.lazy(() => SortOrderSchema).optional(),
		dailyRewardMax: z.lazy(() => SortOrderSchema).optional(),
		textRateMin: z.lazy(() => SortOrderSchema).optional(),
		textRateMax: z.lazy(() => SortOrderSchema).optional(),
		textCooldown: z.lazy(() => SortOrderSchema).optional(),
		allowNegativeBalance: z.lazy(() => SortOrderSchema).optional(),
		negativeBalanceLimit: z.lazy(() => SortOrderSchema).optional(),
		defaultBalance: z.lazy(() => SortOrderSchema).optional(),
		debugMode: z.lazy(() => SortOrderSchema).optional(),
		clearOnLeave: z.lazy(() => SortOrderSchema).optional(),
		autoUseItems: z.lazy(() => SortOrderSchema).optional(),
		roleRestriction: z.lazy(() => RestrictionOrderByInputSchema).optional(),
		channelRestriction: z.lazy(() => RestrictionOrderByInputSchema).optional(),
	})
	.strict();

export const RestrictionOrderByInputSchema: z.ZodType<Prisma.RestrictionOrderByInput> = z
	.object({
		type: z.lazy(() => SortOrderSchema).optional(),
		omit: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const GuildCountOrderByAggregateInputSchema: z.ZodType<Prisma.GuildCountOrderByAggregateInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		locale: z.lazy(() => SortOrderSchema).optional(),
		timezone: z.lazy(() => SortOrderSchema).optional(),
		embedColor: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const GuildAvgOrderByAggregateInputSchema: z.ZodType<Prisma.GuildAvgOrderByAggregateInput> = z
	.object({
		embedColor: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const GuildMaxOrderByAggregateInputSchema: z.ZodType<Prisma.GuildMaxOrderByAggregateInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		locale: z.lazy(() => SortOrderSchema).optional(),
		timezone: z.lazy(() => SortOrderSchema).optional(),
		embedColor: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const GuildMinOrderByAggregateInputSchema: z.ZodType<Prisma.GuildMinOrderByAggregateInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		locale: z.lazy(() => SortOrderSchema).optional(),
		timezone: z.lazy(() => SortOrderSchema).optional(),
		embedColor: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const GuildSumOrderByAggregateInputSchema: z.ZodType<Prisma.GuildSumOrderByAggregateInput> = z
	.object({
		embedColor: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const StringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.StringNullableWithAggregatesFilter> = z
	.object({
		equals: z.string().optional().nullable(),
		in: z.string().array().optional().nullable(),
		notIn: z.string().array().optional().nullable(),
		lt: z.string().optional(),
		lte: z.string().optional(),
		gt: z.string().optional(),
		gte: z.string().optional(),
		contains: z.string().optional(),
		startsWith: z.string().optional(),
		endsWith: z.string().optional(),
		mode: z.lazy(() => QueryModeSchema).optional(),
		not: z
			.union([z.string(), z.lazy(() => NestedStringNullableWithAggregatesFilterSchema)])
			.optional()
			.nullable(),
		_count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
		_min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
		_max: z.lazy(() => NestedStringNullableFilterSchema).optional(),
		isSet: z.boolean().optional(),
	})
	.strict();

export const IntNullableWithAggregatesFilterSchema: z.ZodType<Prisma.IntNullableWithAggregatesFilter> = z
	.object({
		equals: z.number().optional().nullable(),
		in: z.number().array().optional().nullable(),
		notIn: z.number().array().optional().nullable(),
		lt: z.number().optional(),
		lte: z.number().optional(),
		gt: z.number().optional(),
		gte: z.number().optional(),
		not: z
			.union([z.number(), z.lazy(() => NestedIntNullableWithAggregatesFilterSchema)])
			.optional()
			.nullable(),
		_count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
		_avg: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
		_sum: z.lazy(() => NestedIntNullableFilterSchema).optional(),
		_min: z.lazy(() => NestedIntNullableFilterSchema).optional(),
		_max: z.lazy(() => NestedIntNullableFilterSchema).optional(),
		isSet: z.boolean().optional(),
	})
	.strict();

export const DiscordEmbedNullableCompositeFilterSchema: z.ZodType<Prisma.DiscordEmbedNullableCompositeFilter> = z
	.object({
		equals: z
			.lazy(() => DiscordEmbedObjectEqualityInputSchema)
			.optional()
			.nullable(),
		is: z
			.lazy(() => DiscordEmbedWhereInputSchema)
			.optional()
			.nullable(),
		isNot: z
			.lazy(() => DiscordEmbedWhereInputSchema)
			.optional()
			.nullable(),
		isSet: z.boolean().optional(),
	})
	.strict();

export const EnumReactionRoleTypeFilterSchema: z.ZodType<Prisma.EnumReactionRoleTypeFilter> = z
	.object({
		equals: z.lazy(() => ReactionRoleTypeSchema).optional(),
		in: z
			.lazy(() => ReactionRoleTypeSchema)
			.array()
			.optional(),
		notIn: z
			.lazy(() => ReactionRoleTypeSchema)
			.array()
			.optional(),
		not: z
			.union([z.lazy(() => ReactionRoleTypeSchema), z.lazy(() => NestedEnumReactionRoleTypeFilterSchema)])
			.optional(),
	})
	.strict();

export const BoolFilterSchema: z.ZodType<Prisma.BoolFilter> = z
	.object({
		equals: z.boolean().optional(),
		not: z.union([z.boolean(), z.lazy(() => NestedBoolFilterSchema)]).optional(),
	})
	.strict();

export const ReactionRolePairCompositeListFilterSchema: z.ZodType<Prisma.ReactionRolePairCompositeListFilter> = z
	.object({
		equals: z
			.lazy(() => ReactionRolePairObjectEqualityInputSchema)
			.array()
			.optional(),
		every: z.lazy(() => ReactionRolePairWhereInputSchema).optional(),
		some: z.lazy(() => ReactionRolePairWhereInputSchema).optional(),
		none: z.lazy(() => ReactionRolePairWhereInputSchema).optional(),
		isEmpty: z.boolean().optional(),
		isSet: z.boolean().optional(),
	})
	.strict();

export const ReactionRolePairObjectEqualityInputSchema: z.ZodType<Prisma.ReactionRolePairObjectEqualityInput> = z
	.object({
		emoji: z.string(),
		roles: z.string().array().optional(),
	})
	.strict();

export const DiscordEmbedOrderByInputSchema: z.ZodType<Prisma.DiscordEmbedOrderByInput> = z
	.object({
		url: z.lazy(() => SortOrderSchema).optional(),
		title: z.lazy(() => SortOrderSchema).optional(),
		description: z.lazy(() => SortOrderSchema).optional(),
		color: z.lazy(() => SortOrderSchema).optional(),
		timestamp: z.lazy(() => SortOrderSchema).optional(),
		footer: z.lazy(() => DiscordEmbedFooterOrderByInputSchema).optional(),
		image: z.lazy(() => DiscordEmbedImageOrderByInputSchema).optional(),
		thumbnail: z.lazy(() => DiscordEmbedThumbnailOrderByInputSchema).optional(),
		author: z.lazy(() => DiscordEmbedAuthorOrderByInputSchema).optional(),
		fields: z.lazy(() => DiscordEmbedFieldOrderByCompositeAggregateInputSchema).optional(),
	})
	.strict();

export const ReactionRolePairOrderByCompositeAggregateInputSchema: z.ZodType<Prisma.ReactionRolePairOrderByCompositeAggregateInput> =
	z
		.object({
			_count: z.lazy(() => SortOrderSchema).optional(),
		})
		.strict();

export const ReactionRoleGuildMessageCompoundUniqueInputSchema: z.ZodType<Prisma.ReactionRoleGuildMessageCompoundUniqueInput> =
	z
		.object({
			guildId: z.string(),
			messageId: z.string(),
		})
		.strict();

export const ReactionRoleCountOrderByAggregateInputSchema: z.ZodType<Prisma.ReactionRoleCountOrderByAggregateInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		guildId: z.lazy(() => SortOrderSchema).optional(),
		messageId: z.lazy(() => SortOrderSchema).optional(),
		channelId: z.lazy(() => SortOrderSchema).optional(),
		messageContent: z.lazy(() => SortOrderSchema).optional(),
		alias: z.lazy(() => SortOrderSchema).optional(),
		type: z.lazy(() => SortOrderSchema).optional(),
		enabled: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const ReactionRoleMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ReactionRoleMaxOrderByAggregateInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		guildId: z.lazy(() => SortOrderSchema).optional(),
		messageId: z.lazy(() => SortOrderSchema).optional(),
		channelId: z.lazy(() => SortOrderSchema).optional(),
		messageContent: z.lazy(() => SortOrderSchema).optional(),
		alias: z.lazy(() => SortOrderSchema).optional(),
		type: z.lazy(() => SortOrderSchema).optional(),
		enabled: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const ReactionRoleMinOrderByAggregateInputSchema: z.ZodType<Prisma.ReactionRoleMinOrderByAggregateInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		guildId: z.lazy(() => SortOrderSchema).optional(),
		messageId: z.lazy(() => SortOrderSchema).optional(),
		channelId: z.lazy(() => SortOrderSchema).optional(),
		messageContent: z.lazy(() => SortOrderSchema).optional(),
		alias: z.lazy(() => SortOrderSchema).optional(),
		type: z.lazy(() => SortOrderSchema).optional(),
		enabled: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const EnumReactionRoleTypeWithAggregatesFilterSchema: z.ZodType<Prisma.EnumReactionRoleTypeWithAggregatesFilter> =
	z
		.object({
			equals: z.lazy(() => ReactionRoleTypeSchema).optional(),
			in: z
				.lazy(() => ReactionRoleTypeSchema)
				.array()
				.optional(),
			notIn: z
				.lazy(() => ReactionRoleTypeSchema)
				.array()
				.optional(),
			not: z
				.union([
					z.lazy(() => ReactionRoleTypeSchema),
					z.lazy(() => NestedEnumReactionRoleTypeWithAggregatesFilterSchema),
				])
				.optional(),
			_count: z.lazy(() => NestedIntFilterSchema).optional(),
			_min: z.lazy(() => NestedEnumReactionRoleTypeFilterSchema).optional(),
			_max: z.lazy(() => NestedEnumReactionRoleTypeFilterSchema).optional(),
		})
		.strict();

export const BoolWithAggregatesFilterSchema: z.ZodType<Prisma.BoolWithAggregatesFilter> = z
	.object({
		equals: z.boolean().optional(),
		not: z.union([z.boolean(), z.lazy(() => NestedBoolWithAggregatesFilterSchema)]).optional(),
		_count: z.lazy(() => NestedIntFilterSchema).optional(),
		_min: z.lazy(() => NestedBoolFilterSchema).optional(),
		_max: z.lazy(() => NestedBoolFilterSchema).optional(),
	})
	.strict();

export const IntFilterSchema: z.ZodType<Prisma.IntFilter> = z
	.object({
		equals: z.number().optional(),
		in: z.number().array().optional(),
		notIn: z.number().array().optional(),
		lt: z.number().optional(),
		lte: z.number().optional(),
		gt: z.number().optional(),
		gte: z.number().optional(),
		not: z.union([z.number(), z.lazy(() => NestedIntFilterSchema)]).optional(),
	})
	.strict();

export const StringNullableListFilterSchema: z.ZodType<Prisma.StringNullableListFilter> = z
	.object({
		equals: z.string().array().optional().nullable(),
		has: z.string().optional().nullable(),
		hasEvery: z.string().array().optional(),
		hasSome: z.string().array().optional(),
		isEmpty: z.boolean().optional(),
	})
	.strict();

export const StarCountOrderByAggregateInputSchema: z.ZodType<Prisma.StarCountOrderByAggregateInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		refAuthorId: z.lazy(() => SortOrderSchema).optional(),
		refMessageId: z.lazy(() => SortOrderSchema).optional(),
		refChannelId: z.lazy(() => SortOrderSchema).optional(),
		messageId: z.lazy(() => SortOrderSchema).optional(),
		count: z.lazy(() => SortOrderSchema).optional(),
		users: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const StarAvgOrderByAggregateInputSchema: z.ZodType<Prisma.StarAvgOrderByAggregateInput> = z
	.object({
		count: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const StarMaxOrderByAggregateInputSchema: z.ZodType<Prisma.StarMaxOrderByAggregateInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		refAuthorId: z.lazy(() => SortOrderSchema).optional(),
		refMessageId: z.lazy(() => SortOrderSchema).optional(),
		refChannelId: z.lazy(() => SortOrderSchema).optional(),
		messageId: z.lazy(() => SortOrderSchema).optional(),
		count: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const StarMinOrderByAggregateInputSchema: z.ZodType<Prisma.StarMinOrderByAggregateInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		refAuthorId: z.lazy(() => SortOrderSchema).optional(),
		refMessageId: z.lazy(() => SortOrderSchema).optional(),
		refChannelId: z.lazy(() => SortOrderSchema).optional(),
		messageId: z.lazy(() => SortOrderSchema).optional(),
		count: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const StarSumOrderByAggregateInputSchema: z.ZodType<Prisma.StarSumOrderByAggregateInput> = z
	.object({
		count: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const IntWithAggregatesFilterSchema: z.ZodType<Prisma.IntWithAggregatesFilter> = z
	.object({
		equals: z.number().optional(),
		in: z.number().array().optional(),
		notIn: z.number().array().optional(),
		lt: z.number().optional(),
		lte: z.number().optional(),
		gt: z.number().optional(),
		gte: z.number().optional(),
		not: z.union([z.number(), z.lazy(() => NestedIntWithAggregatesFilterSchema)]).optional(),
		_count: z.lazy(() => NestedIntFilterSchema).optional(),
		_avg: z.lazy(() => NestedFloatFilterSchema).optional(),
		_sum: z.lazy(() => NestedIntFilterSchema).optional(),
		_min: z.lazy(() => NestedIntFilterSchema).optional(),
		_max: z.lazy(() => NestedIntFilterSchema).optional(),
	})
	.strict();

export const EnumItemTypeFilterSchema: z.ZodType<Prisma.EnumItemTypeFilter> = z
	.object({
		equals: z.lazy(() => ItemTypeSchema).optional(),
		in: z
			.lazy(() => ItemTypeSchema)
			.array()
			.optional(),
		notIn: z
			.lazy(() => ItemTypeSchema)
			.array()
			.optional(),
		not: z.union([z.lazy(() => ItemTypeSchema), z.lazy(() => NestedEnumItemTypeFilterSchema)]).optional(),
	})
	.strict();

export const ItemDataNullableCompositeFilterSchema: z.ZodType<Prisma.ItemDataNullableCompositeFilter> = z
	.object({
		equals: z
			.lazy(() => ItemDataObjectEqualityInputSchema)
			.optional()
			.nullable(),
		is: z
			.lazy(() => ItemDataWhereInputSchema)
			.optional()
			.nullable(),
		isNot: z
			.lazy(() => ItemDataWhereInputSchema)
			.optional()
			.nullable(),
		isSet: z.boolean().optional(),
	})
	.strict();

export const ItemDataObjectEqualityInputSchema: z.ZodType<Prisma.ItemDataObjectEqualityInput> = z
	.object({
		roles: z.string().array().optional(),
		badge: z.string().optional().nullable(),
		script: z.string().optional().nullable(),
	})
	.strict();

export const PurchaseResponseNullableCompositeFilterSchema: z.ZodType<Prisma.PurchaseResponseNullableCompositeFilter> =
	z
		.object({
			equals: z
				.lazy(() => PurchaseResponseObjectEqualityInputSchema)
				.optional()
				.nullable(),
			is: z
				.lazy(() => PurchaseResponseWhereInputSchema)
				.optional()
				.nullable(),
			isNot: z
				.lazy(() => PurchaseResponseWhereInputSchema)
				.optional()
				.nullable(),
			isSet: z.boolean().optional(),
		})
		.strict();

export const PurchaseResponseObjectEqualityInputSchema: z.ZodType<Prisma.PurchaseResponseObjectEqualityInput> = z
	.object({
		channel: z.string(),
		content: z.string().optional().nullable(),
	})
	.strict();

export const PurchaseRequiresNullableCompositeFilterSchema: z.ZodType<Prisma.PurchaseRequiresNullableCompositeFilter> =
	z
		.object({
			equals: z
				.lazy(() => PurchaseRequiresObjectEqualityInputSchema)
				.optional()
				.nullable(),
			is: z
				.lazy(() => PurchaseRequiresWhereInputSchema)
				.optional()
				.nullable(),
			isNot: z
				.lazy(() => PurchaseRequiresWhereInputSchema)
				.optional()
				.nullable(),
			isSet: z.boolean().optional(),
		})
		.strict();

export const PurchaseRequiresObjectEqualityInputSchema: z.ZodType<Prisma.PurchaseRequiresObjectEqualityInput> = z
	.object({
		level: z.number().optional().nullable(),
		roles: z.string().array().optional(),
	})
	.strict();

export const ItemDataOrderByInputSchema: z.ZodType<Prisma.ItemDataOrderByInput> = z
	.object({
		roles: z.lazy(() => SortOrderSchema).optional(),
		badge: z.lazy(() => SortOrderSchema).optional(),
		script: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const PurchaseResponseOrderByInputSchema: z.ZodType<Prisma.PurchaseResponseOrderByInput> = z
	.object({
		channel: z.lazy(() => SortOrderSchema).optional(),
		content: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const PurchaseRequiresOrderByInputSchema: z.ZodType<Prisma.PurchaseRequiresOrderByInput> = z
	.object({
		level: z.lazy(() => SortOrderSchema).optional(),
		roles: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const ItemCountOrderByAggregateInputSchema: z.ZodType<Prisma.ItemCountOrderByAggregateInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		guildId: z.lazy(() => SortOrderSchema).optional(),
		active: z.lazy(() => SortOrderSchema).optional(),
		type: z.lazy(() => SortOrderSchema).optional(),
		name: z.lazy(() => SortOrderSchema).optional(),
		icon: z.lazy(() => SortOrderSchema).optional(),
		about: z.lazy(() => SortOrderSchema).optional(),
		price: z.lazy(() => SortOrderSchema).optional(),
		stock: z.lazy(() => SortOrderSchema).optional(),
		limit: z.lazy(() => SortOrderSchema).optional(),
		autoUse: z.lazy(() => SortOrderSchema).optional(),
		persist: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const ItemAvgOrderByAggregateInputSchema: z.ZodType<Prisma.ItemAvgOrderByAggregateInput> = z
	.object({
		price: z.lazy(() => SortOrderSchema).optional(),
		stock: z.lazy(() => SortOrderSchema).optional(),
		limit: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const ItemMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ItemMaxOrderByAggregateInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		guildId: z.lazy(() => SortOrderSchema).optional(),
		active: z.lazy(() => SortOrderSchema).optional(),
		type: z.lazy(() => SortOrderSchema).optional(),
		name: z.lazy(() => SortOrderSchema).optional(),
		icon: z.lazy(() => SortOrderSchema).optional(),
		about: z.lazy(() => SortOrderSchema).optional(),
		price: z.lazy(() => SortOrderSchema).optional(),
		stock: z.lazy(() => SortOrderSchema).optional(),
		limit: z.lazy(() => SortOrderSchema).optional(),
		autoUse: z.lazy(() => SortOrderSchema).optional(),
		persist: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const ItemMinOrderByAggregateInputSchema: z.ZodType<Prisma.ItemMinOrderByAggregateInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		guildId: z.lazy(() => SortOrderSchema).optional(),
		active: z.lazy(() => SortOrderSchema).optional(),
		type: z.lazy(() => SortOrderSchema).optional(),
		name: z.lazy(() => SortOrderSchema).optional(),
		icon: z.lazy(() => SortOrderSchema).optional(),
		about: z.lazy(() => SortOrderSchema).optional(),
		price: z.lazy(() => SortOrderSchema).optional(),
		stock: z.lazy(() => SortOrderSchema).optional(),
		limit: z.lazy(() => SortOrderSchema).optional(),
		autoUse: z.lazy(() => SortOrderSchema).optional(),
		persist: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const ItemSumOrderByAggregateInputSchema: z.ZodType<Prisma.ItemSumOrderByAggregateInput> = z
	.object({
		price: z.lazy(() => SortOrderSchema).optional(),
		stock: z.lazy(() => SortOrderSchema).optional(),
		limit: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const EnumItemTypeWithAggregatesFilterSchema: z.ZodType<Prisma.EnumItemTypeWithAggregatesFilter> = z
	.object({
		equals: z.lazy(() => ItemTypeSchema).optional(),
		in: z
			.lazy(() => ItemTypeSchema)
			.array()
			.optional(),
		notIn: z
			.lazy(() => ItemTypeSchema)
			.array()
			.optional(),
		not: z
			.union([z.lazy(() => ItemTypeSchema), z.lazy(() => NestedEnumItemTypeWithAggregatesFilterSchema)])
			.optional(),
		_count: z.lazy(() => NestedIntFilterSchema).optional(),
		_min: z.lazy(() => NestedEnumItemTypeFilterSchema).optional(),
		_max: z.lazy(() => NestedEnumItemTypeFilterSchema).optional(),
	})
	.strict();

export const UserCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserCountOrderByAggregateInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		birthday: z.lazy(() => SortOrderSchema).optional(),
		timezone: z.lazy(() => SortOrderSchema).optional(),
		bio: z.lazy(() => SortOrderSchema).optional(),
		country: z.lazy(() => SortOrderSchema).optional(),
		locale: z.lazy(() => SortOrderSchema).optional(),
		reputation: z.lazy(() => SortOrderSchema).optional(),
		lastReputation: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const UserAvgOrderByAggregateInputSchema: z.ZodType<Prisma.UserAvgOrderByAggregateInput> = z
	.object({
		reputation: z.lazy(() => SortOrderSchema).optional(),
		lastReputation: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const UserMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserMaxOrderByAggregateInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		birthday: z.lazy(() => SortOrderSchema).optional(),
		timezone: z.lazy(() => SortOrderSchema).optional(),
		bio: z.lazy(() => SortOrderSchema).optional(),
		country: z.lazy(() => SortOrderSchema).optional(),
		locale: z.lazy(() => SortOrderSchema).optional(),
		reputation: z.lazy(() => SortOrderSchema).optional(),
		lastReputation: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const UserMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserMinOrderByAggregateInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		birthday: z.lazy(() => SortOrderSchema).optional(),
		timezone: z.lazy(() => SortOrderSchema).optional(),
		bio: z.lazy(() => SortOrderSchema).optional(),
		country: z.lazy(() => SortOrderSchema).optional(),
		locale: z.lazy(() => SortOrderSchema).optional(),
		reputation: z.lazy(() => SortOrderSchema).optional(),
		lastReputation: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const UserSumOrderByAggregateInputSchema: z.ZodType<Prisma.UserSumOrderByAggregateInput> = z
	.object({
		reputation: z.lazy(() => SortOrderSchema).optional(),
		lastReputation: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const CardCompositeFilterSchema: z.ZodType<Prisma.CardCompositeFilter> = z
	.object({
		equals: z.lazy(() => CardObjectEqualityInputSchema).optional(),
		is: z.lazy(() => CardWhereInputSchema).optional(),
		isNot: z.lazy(() => CardWhereInputSchema).optional(),
	})
	.strict();

export const CardObjectEqualityInputSchema: z.ZodType<Prisma.CardObjectEqualityInput> = z
	.object({
		name: z.string(),
		borderRadius: z.number().optional().nullable(),
		wrapperImage: z.string().optional().nullable(),
		wrapperColor: z
			.lazy(() => HSLAColorObjectEqualityInputSchema)
			.optional()
			.nullable(),
		overlayColor: z
			.lazy(() => HSLAColorObjectEqualityInputSchema)
			.optional()
			.nullable(),
		overlayAccentColor: z
			.lazy(() => HSLAColorObjectEqualityInputSchema)
			.optional()
			.nullable(),
		progressBarColor: z
			.lazy(() => HSLAColorObjectEqualityInputSchema)
			.optional()
			.nullable(),
		fontFamily: z.lazy(() => FontFamilySchema),
		textColor: z
			.lazy(() => HSLAColorObjectEqualityInputSchema)
			.optional()
			.nullable(),
		subtextColor: z
			.lazy(() => HSLAColorObjectEqualityInputSchema)
			.optional()
			.nullable(),
	})
	.strict();

export const CardCompositeListFilterSchema: z.ZodType<Prisma.CardCompositeListFilter> = z
	.object({
		equals: z
			.lazy(() => CardObjectEqualityInputSchema)
			.array()
			.optional(),
		every: z.lazy(() => CardWhereInputSchema).optional(),
		some: z.lazy(() => CardWhereInputSchema).optional(),
		none: z.lazy(() => CardWhereInputSchema).optional(),
		isEmpty: z.boolean().optional(),
		isSet: z.boolean().optional(),
	})
	.strict();

export const BadgeCompositeListFilterSchema: z.ZodType<Prisma.BadgeCompositeListFilter> = z
	.object({
		equals: z
			.lazy(() => BadgeObjectEqualityInputSchema)
			.array()
			.optional(),
		every: z.lazy(() => BadgeWhereInputSchema).optional(),
		some: z.lazy(() => BadgeWhereInputSchema).optional(),
		none: z.lazy(() => BadgeWhereInputSchema).optional(),
		isEmpty: z.boolean().optional(),
		isSet: z.boolean().optional(),
	})
	.strict();

export const BadgeObjectEqualityInputSchema: z.ZodType<Prisma.BadgeObjectEqualityInput> = z
	.object({
		itemId: z.string(),
		active: z.boolean(),
		slot: z.number(),
	})
	.strict();

export const InventoryItemCompositeListFilterSchema: z.ZodType<Prisma.InventoryItemCompositeListFilter> = z
	.object({
		equals: z
			.lazy(() => InventoryItemObjectEqualityInputSchema)
			.array()
			.optional(),
		every: z.lazy(() => InventoryItemWhereInputSchema).optional(),
		some: z.lazy(() => InventoryItemWhereInputSchema).optional(),
		none: z.lazy(() => InventoryItemWhereInputSchema).optional(),
		isEmpty: z.boolean().optional(),
		isSet: z.boolean().optional(),
	})
	.strict();

export const InventoryItemObjectEqualityInputSchema: z.ZodType<Prisma.InventoryItemObjectEqualityInput> = z
	.object({
		itemId: z.string(),
		name: z.string(),
		amount: z.number(),
	})
	.strict();

export const CardOrderByInputSchema: z.ZodType<Prisma.CardOrderByInput> = z
	.object({
		name: z.lazy(() => SortOrderSchema).optional(),
		borderRadius: z.lazy(() => SortOrderSchema).optional(),
		wrapperImage: z.lazy(() => SortOrderSchema).optional(),
		wrapperColor: z.lazy(() => HSLAColorOrderByInputSchema).optional(),
		overlayColor: z.lazy(() => HSLAColorOrderByInputSchema).optional(),
		overlayAccentColor: z.lazy(() => HSLAColorOrderByInputSchema).optional(),
		progressBarColor: z.lazy(() => HSLAColorOrderByInputSchema).optional(),
		fontFamily: z.lazy(() => SortOrderSchema).optional(),
		textColor: z.lazy(() => HSLAColorOrderByInputSchema).optional(),
		subtextColor: z.lazy(() => HSLAColorOrderByInputSchema).optional(),
	})
	.strict();

export const CardOrderByCompositeAggregateInputSchema: z.ZodType<Prisma.CardOrderByCompositeAggregateInput> = z
	.object({
		_count: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const BadgeOrderByCompositeAggregateInputSchema: z.ZodType<Prisma.BadgeOrderByCompositeAggregateInput> = z
	.object({
		_count: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const InventoryItemOrderByCompositeAggregateInputSchema: z.ZodType<Prisma.InventoryItemOrderByCompositeAggregateInput> =
	z
		.object({
			_count: z.lazy(() => SortOrderSchema).optional(),
		})
		.strict();

export const MemberGuildMemberBadgeCompoundUniqueInputSchema: z.ZodType<Prisma.MemberGuildMemberBadgeCompoundUniqueInput> =
	z
		.object({
			guildId: z.string(),
			userId: z.string(),
			itemId: z.string(),
		})
		.strict();

export const MemberGuildMemberItemCompoundUniqueInputSchema: z.ZodType<Prisma.MemberGuildMemberItemCompoundUniqueInput> =
	z
		.object({
			guildId: z.string(),
			userId: z.string(),
			itemId: z.string(),
		})
		.strict();

export const MemberGuildMemberCompoundUniqueInputSchema: z.ZodType<Prisma.MemberGuildMemberCompoundUniqueInput> = z
	.object({
		guildId: z.string(),
		userId: z.string(),
	})
	.strict();

export const MemberCountOrderByAggregateInputSchema: z.ZodType<Prisma.MemberCountOrderByAggregateInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		userId: z.lazy(() => SortOrderSchema).optional(),
		guildId: z.lazy(() => SortOrderSchema).optional(),
		bal: z.lazy(() => SortOrderSchema).optional(),
		exp: z.lazy(() => SortOrderSchema).optional(),
		lastDaily: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const MemberAvgOrderByAggregateInputSchema: z.ZodType<Prisma.MemberAvgOrderByAggregateInput> = z
	.object({
		bal: z.lazy(() => SortOrderSchema).optional(),
		exp: z.lazy(() => SortOrderSchema).optional(),
		lastDaily: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const MemberMaxOrderByAggregateInputSchema: z.ZodType<Prisma.MemberMaxOrderByAggregateInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		userId: z.lazy(() => SortOrderSchema).optional(),
		guildId: z.lazy(() => SortOrderSchema).optional(),
		bal: z.lazy(() => SortOrderSchema).optional(),
		exp: z.lazy(() => SortOrderSchema).optional(),
		lastDaily: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const MemberMinOrderByAggregateInputSchema: z.ZodType<Prisma.MemberMinOrderByAggregateInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		userId: z.lazy(() => SortOrderSchema).optional(),
		guildId: z.lazy(() => SortOrderSchema).optional(),
		bal: z.lazy(() => SortOrderSchema).optional(),
		exp: z.lazy(() => SortOrderSchema).optional(),
		lastDaily: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const MemberSumOrderByAggregateInputSchema: z.ZodType<Prisma.MemberSumOrderByAggregateInput> = z
	.object({
		bal: z.lazy(() => SortOrderSchema).optional(),
		exp: z.lazy(() => SortOrderSchema).optional(),
		lastDaily: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const DiscordEmbedListCreateEnvelopeInputSchema: z.ZodType<Prisma.DiscordEmbedListCreateEnvelopeInput> = z
	.object({
		set: z
			.union([z.lazy(() => DiscordEmbedCreateInputSchema), z.lazy(() => DiscordEmbedCreateInputSchema).array()])
			.optional(),
	})
	.strict();

export const DiscordEmbedCreateInputSchema: z.ZodType<Prisma.DiscordEmbedCreateInput> = z
	.object({
		url: z.string().optional(),
		title: z.string().optional(),
		description: z.string().optional(),
		color: z.number().optional(),
		timestamp: z.string().optional(),
		footer: z.lazy(() => DiscordEmbedFooterCreateInputSchema),
		image: z.lazy(() => DiscordEmbedImageCreateInputSchema),
		thumbnail: z.lazy(() => DiscordEmbedThumbnailCreateInputSchema),
		author: z.lazy(() => DiscordEmbedAuthorCreateInputSchema),
		fields: z
			.union([
				z.lazy(() => DiscordEmbedFieldCreateInputSchema),
				z.lazy(() => DiscordEmbedFieldCreateInputSchema).array(),
			])
			.optional(),
	})
	.strict();

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = z
	.object({
		set: z.string().optional(),
	})
	.strict();

export const DiscordEmbedListUpdateEnvelopeInputSchema: z.ZodType<Prisma.DiscordEmbedListUpdateEnvelopeInput> = z
	.object({
		set: z
			.union([z.lazy(() => DiscordEmbedCreateInputSchema), z.lazy(() => DiscordEmbedCreateInputSchema).array()])
			.optional(),
		push: z
			.union([z.lazy(() => DiscordEmbedCreateInputSchema), z.lazy(() => DiscordEmbedCreateInputSchema).array()])
			.optional(),
		updateMany: z.lazy(() => DiscordEmbedUpdateManyInputSchema).optional(),
		deleteMany: z.lazy(() => DiscordEmbedDeleteManyInputSchema).optional(),
	})
	.strict();

export const LevelsCreateEnvelopeInputSchema: z.ZodType<Prisma.LevelsCreateEnvelopeInput> = z
	.object({
		set: z.lazy(() => LevelsCreateInputSchema).optional(),
	})
	.strict();

export const LevelsCreateInputSchema: z.ZodType<Prisma.LevelsCreateInput> = z
	.object({
		enabled: z.boolean().optional(),
		stackRewards: z.boolean().optional(),
		clearOnLeave: z.boolean().optional(),
		addRolesOnJoin: z.boolean().optional(),
		rankCard: z.lazy(() => CardCreateInputSchema),
		allowCustomRankCard: z.boolean().optional(),
		boost: z.number().optional(),
		boosts: z
			.union([z.lazy(() => ExpBoostCreateInputSchema), z.lazy(() => ExpBoostCreateInputSchema).array()])
			.optional(),
		textExpEnabled: z.boolean().optional(),
		textRateMin: z.number().optional(),
		textRateMax: z.number().optional(),
		textCooldown: z.number().optional(),
		voiceExpEnabled: z.boolean().optional(),
		voiceRateMin: z.number().optional(),
		voiceRateMax: z.number().optional(),
		voiceCooldown: z.number().optional(),
		notifyDestination: z.lazy(() => DestinationSchema).optional(),
		notifyMessageType: z.lazy(() => MessageTypeSchema).optional(),
		notifyChannel: z.string().optional().nullable(),
		notifyMessageContent: z.string().optional().nullable(),
		notifyMessageEmbed: z
			.lazy(() => DiscordEmbedCreateInputSchema)
			.optional()
			.nullable(),
		roleRestriction: z.lazy(() => RestrictionCreateInputSchema),
		channelRestriction: z.lazy(() => RestrictionCreateInputSchema),
		rewards: z
			.union([z.lazy(() => RewardCreateInputSchema), z.lazy(() => RewardCreateInputSchema).array()])
			.optional(),
	})
	.strict();

export const StarsCreateEnvelopeInputSchema: z.ZodType<Prisma.StarsCreateEnvelopeInput> = z
	.object({
		set: z.lazy(() => StarsCreateInputSchema).optional(),
	})
	.strict();

export const StarsCreateInputSchema: z.ZodType<Prisma.StarsCreateInput> = z
	.object({
		enabled: z.boolean().optional(),
		channelId: z.string().optional().nullable(),
		emoji: z.string().optional(),
		threshold: z.number().optional(),
		duplicateOriginal: z.boolean().optional(),
		selfStarEnabled: z.boolean().optional(),
		selfStarWarning: z.boolean().optional(),
		messageType: z.lazy(() => MessageTypeSchema).optional(),
		messageContent: z.string().optional().nullable(),
		embed: z
			.lazy(() => DiscordEmbedCreateInputSchema)
			.optional()
			.nullable(),
		roleRestriction: z.lazy(() => RestrictionCreateInputSchema),
		channelRestriction: z.lazy(() => RestrictionCreateInputSchema),
	})
	.strict();

export const EconomyCreateEnvelopeInputSchema: z.ZodType<Prisma.EconomyCreateEnvelopeInput> = z
	.object({
		set: z.lazy(() => EconomyCreateInputSchema).optional(),
	})
	.strict();

export const EconomyCreateInputSchema: z.ZodType<Prisma.EconomyCreateInput> = z
	.object({
		enabled: z.boolean().optional(),
		currencyName: z.string().optional().nullable(),
		currencyIcon: z.string().optional(),
		currencyIconLocation: z.lazy(() => CurrencyIconLocationSchema).optional(),
		inventorySize: z.number().optional(),
		wagerMin: z.number().optional(),
		wagerMax: z.number().optional(),
		dailyRewardMin: z.number().optional(),
		dailyRewardMax: z.number().optional(),
		textRateMin: z.number().optional(),
		textRateMax: z.number().optional(),
		textCooldown: z.number().optional(),
		allowNegativeBalance: z.boolean().optional(),
		negativeBalanceLimit: z.number().optional(),
		defaultBalance: z.number().optional(),
		debugMode: z.boolean().optional(),
		clearOnLeave: z.boolean().optional(),
		autoUseItems: z.boolean().optional(),
		roleRestriction: z
			.lazy(() => RestrictionCreateInputSchema)
			.optional()
			.nullable(),
		channelRestriction: z
			.lazy(() => RestrictionCreateInputSchema)
			.optional()
			.nullable(),
	})
	.strict();

export const RestrictionCreateEnvelopeInputSchema: z.ZodType<Prisma.RestrictionCreateEnvelopeInput> = z
	.object({
		set: z.lazy(() => RestrictionCreateInputSchema).optional(),
	})
	.strict();

export const RestrictionCreateInputSchema: z.ZodType<Prisma.RestrictionCreateInput> = z
	.object({
		type: z.lazy(() => RestrictionTypeSchema),
		omit: z.union([z.lazy(() => RestrictionCreateomitInputSchema), z.string().array()]).optional(),
	})
	.strict();

export const NullableStringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput> =
	z
		.object({
			set: z.string().optional().nullable(),
			unset: z.boolean().optional(),
		})
		.strict();

export const LevelsUpdateEnvelopeInputSchema: z.ZodType<Prisma.LevelsUpdateEnvelopeInput> = z
	.object({
		set: z.lazy(() => LevelsCreateInputSchema).optional(),
		update: z.lazy(() => LevelsUpdateInputSchema).optional(),
	})
	.strict();

export const StarsUpdateEnvelopeInputSchema: z.ZodType<Prisma.StarsUpdateEnvelopeInput> = z
	.object({
		set: z.lazy(() => StarsCreateInputSchema).optional(),
		update: z.lazy(() => StarsUpdateInputSchema).optional(),
	})
	.strict();

export const EconomyUpdateEnvelopeInputSchema: z.ZodType<Prisma.EconomyUpdateEnvelopeInput> = z
	.object({
		set: z.lazy(() => EconomyCreateInputSchema).optional(),
		update: z.lazy(() => EconomyUpdateInputSchema).optional(),
	})
	.strict();

export const RestrictionUpdateEnvelopeInputSchema: z.ZodType<Prisma.RestrictionUpdateEnvelopeInput> = z
	.object({
		set: z.lazy(() => RestrictionCreateInputSchema).optional(),
		update: z.lazy(() => RestrictionUpdateInputSchema).optional(),
	})
	.strict();

export const NullableIntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableIntFieldUpdateOperationsInput> = z
	.object({
		set: z.number().optional().nullable(),
		increment: z.number().optional(),
		decrement: z.number().optional(),
		multiply: z.number().optional(),
		divide: z.number().optional(),
		unset: z.boolean().optional(),
	})
	.strict();

export const DiscordEmbedNullableCreateEnvelopeInputSchema: z.ZodType<Prisma.DiscordEmbedNullableCreateEnvelopeInput> =
	z
		.object({
			set: z
				.lazy(() => DiscordEmbedCreateInputSchema)
				.optional()
				.nullable(),
		})
		.strict();

export const ReactionRolePairListCreateEnvelopeInputSchema: z.ZodType<Prisma.ReactionRolePairListCreateEnvelopeInput> =
	z
		.object({
			set: z
				.union([
					z.lazy(() => ReactionRolePairCreateInputSchema),
					z.lazy(() => ReactionRolePairCreateInputSchema).array(),
				])
				.optional(),
		})
		.strict();

export const ReactionRolePairCreateInputSchema: z.ZodType<Prisma.ReactionRolePairCreateInput> = z
	.object({
		emoji: z.string(),
		roles: z.union([z.lazy(() => ReactionRolePairCreaterolesInputSchema), z.string().array()]).optional(),
	})
	.strict();

export const DiscordEmbedNullableUpdateEnvelopeInputSchema: z.ZodType<Prisma.DiscordEmbedNullableUpdateEnvelopeInput> =
	z
		.object({
			set: z
				.lazy(() => DiscordEmbedCreateInputSchema)
				.optional()
				.nullable(),
			upsert: z.lazy(() => DiscordEmbedUpsertInputSchema).optional(),
			unset: z.boolean().optional(),
		})
		.strict();

export const EnumReactionRoleTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumReactionRoleTypeFieldUpdateOperationsInput> =
	z
		.object({
			set: z.lazy(() => ReactionRoleTypeSchema).optional(),
		})
		.strict();

export const BoolFieldUpdateOperationsInputSchema: z.ZodType<Prisma.BoolFieldUpdateOperationsInput> = z
	.object({
		set: z.boolean().optional(),
	})
	.strict();

export const ReactionRolePairListUpdateEnvelopeInputSchema: z.ZodType<Prisma.ReactionRolePairListUpdateEnvelopeInput> =
	z
		.object({
			set: z
				.union([
					z.lazy(() => ReactionRolePairCreateInputSchema),
					z.lazy(() => ReactionRolePairCreateInputSchema).array(),
				])
				.optional(),
			push: z
				.union([
					z.lazy(() => ReactionRolePairCreateInputSchema),
					z.lazy(() => ReactionRolePairCreateInputSchema).array(),
				])
				.optional(),
			updateMany: z.lazy(() => ReactionRolePairUpdateManyInputSchema).optional(),
			deleteMany: z.lazy(() => ReactionRolePairDeleteManyInputSchema).optional(),
		})
		.strict();

export const StarCreateusersInputSchema: z.ZodType<Prisma.StarCreateusersInput> = z
	.object({
		set: z.string().array(),
	})
	.strict();

export const IntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.IntFieldUpdateOperationsInput> = z
	.object({
		set: z.number().optional(),
		increment: z.number().optional(),
		decrement: z.number().optional(),
		multiply: z.number().optional(),
		divide: z.number().optional(),
	})
	.strict();

export const StarUpdateusersInputSchema: z.ZodType<Prisma.StarUpdateusersInput> = z
	.object({
		set: z.string().array().optional(),
		push: z.union([z.string(), z.string().array()]).optional(),
	})
	.strict();

export const ItemDataNullableCreateEnvelopeInputSchema: z.ZodType<Prisma.ItemDataNullableCreateEnvelopeInput> = z
	.object({
		set: z
			.lazy(() => ItemDataCreateInputSchema)
			.optional()
			.nullable(),
	})
	.strict();

export const ItemDataCreateInputSchema: z.ZodType<Prisma.ItemDataCreateInput> = z
	.object({
		roles: z.union([z.lazy(() => ItemDataCreaterolesInputSchema), z.string().array()]).optional(),
		badge: z.string().optional().nullable(),
		script: z.string().optional().nullable(),
	})
	.strict();

export const PurchaseResponseNullableCreateEnvelopeInputSchema: z.ZodType<Prisma.PurchaseResponseNullableCreateEnvelopeInput> =
	z
		.object({
			set: z
				.lazy(() => PurchaseResponseCreateInputSchema)
				.optional()
				.nullable(),
		})
		.strict();

export const PurchaseResponseCreateInputSchema: z.ZodType<Prisma.PurchaseResponseCreateInput> = z
	.object({
		channel: z.string(),
		content: z.string().optional().nullable(),
	})
	.strict();

export const PurchaseRequiresNullableCreateEnvelopeInputSchema: z.ZodType<Prisma.PurchaseRequiresNullableCreateEnvelopeInput> =
	z
		.object({
			set: z
				.lazy(() => PurchaseRequiresCreateInputSchema)
				.optional()
				.nullable(),
		})
		.strict();

export const PurchaseRequiresCreateInputSchema: z.ZodType<Prisma.PurchaseRequiresCreateInput> = z
	.object({
		level: z.number().optional().nullable(),
		roles: z.union([z.lazy(() => PurchaseRequiresCreaterolesInputSchema), z.string().array()]).optional(),
	})
	.strict();

export const EnumItemTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumItemTypeFieldUpdateOperationsInput> = z
	.object({
		set: z.lazy(() => ItemTypeSchema).optional(),
	})
	.strict();

export const ItemDataNullableUpdateEnvelopeInputSchema: z.ZodType<Prisma.ItemDataNullableUpdateEnvelopeInput> = z
	.object({
		set: z
			.lazy(() => ItemDataCreateInputSchema)
			.optional()
			.nullable(),
		upsert: z.lazy(() => ItemDataUpsertInputSchema).optional(),
		unset: z.boolean().optional(),
	})
	.strict();

export const PurchaseResponseNullableUpdateEnvelopeInputSchema: z.ZodType<Prisma.PurchaseResponseNullableUpdateEnvelopeInput> =
	z
		.object({
			set: z
				.lazy(() => PurchaseResponseCreateInputSchema)
				.optional()
				.nullable(),
			upsert: z.lazy(() => PurchaseResponseUpsertInputSchema).optional(),
			unset: z.boolean().optional(),
		})
		.strict();

export const PurchaseRequiresNullableUpdateEnvelopeInputSchema: z.ZodType<Prisma.PurchaseRequiresNullableUpdateEnvelopeInput> =
	z
		.object({
			set: z
				.lazy(() => PurchaseRequiresCreateInputSchema)
				.optional()
				.nullable(),
			upsert: z.lazy(() => PurchaseRequiresUpsertInputSchema).optional(),
			unset: z.boolean().optional(),
		})
		.strict();

export const CardCreateEnvelopeInputSchema: z.ZodType<Prisma.CardCreateEnvelopeInput> = z
	.object({
		set: z.lazy(() => CardCreateInputSchema).optional(),
	})
	.strict();

export const CardCreateInputSchema: z.ZodType<Prisma.CardCreateInput> = z
	.object({
		name: z.string().optional(),
		borderRadius: z.number().optional().nullable(),
		wrapperImage: z.string().optional().nullable(),
		wrapperColor: z
			.lazy(() => HSLAColorCreateInputSchema)
			.optional()
			.nullable(),
		overlayColor: z
			.lazy(() => HSLAColorCreateInputSchema)
			.optional()
			.nullable(),
		overlayAccentColor: z
			.lazy(() => HSLAColorCreateInputSchema)
			.optional()
			.nullable(),
		progressBarColor: z
			.lazy(() => HSLAColorCreateInputSchema)
			.optional()
			.nullable(),
		fontFamily: z.lazy(() => FontFamilySchema).optional(),
		textColor: z
			.lazy(() => HSLAColorCreateInputSchema)
			.optional()
			.nullable(),
		subtextColor: z
			.lazy(() => HSLAColorCreateInputSchema)
			.optional()
			.nullable(),
	})
	.strict();

export const CardListCreateEnvelopeInputSchema: z.ZodType<Prisma.CardListCreateEnvelopeInput> = z
	.object({
		set: z.union([z.lazy(() => CardCreateInputSchema), z.lazy(() => CardCreateInputSchema).array()]).optional(),
	})
	.strict();

export const BadgeListCreateEnvelopeInputSchema: z.ZodType<Prisma.BadgeListCreateEnvelopeInput> = z
	.object({
		set: z.union([z.lazy(() => BadgeCreateInputSchema), z.lazy(() => BadgeCreateInputSchema).array()]).optional(),
	})
	.strict();

export const BadgeCreateInputSchema: z.ZodType<Prisma.BadgeCreateInput> = z
	.object({
		itemId: z.string(),
		active: z.boolean(),
		slot: z.number(),
	})
	.strict();

export const InventoryItemListCreateEnvelopeInputSchema: z.ZodType<Prisma.InventoryItemListCreateEnvelopeInput> = z
	.object({
		set: z
			.union([z.lazy(() => InventoryItemCreateInputSchema), z.lazy(() => InventoryItemCreateInputSchema).array()])
			.optional(),
	})
	.strict();

export const InventoryItemCreateInputSchema: z.ZodType<Prisma.InventoryItemCreateInput> = z
	.object({
		itemId: z.string(),
		name: z.string(),
		amount: z.number(),
	})
	.strict();

export const CardUpdateEnvelopeInputSchema: z.ZodType<Prisma.CardUpdateEnvelopeInput> = z
	.object({
		set: z.lazy(() => CardCreateInputSchema).optional(),
		update: z.lazy(() => CardUpdateInputSchema).optional(),
	})
	.strict();

export const CardListUpdateEnvelopeInputSchema: z.ZodType<Prisma.CardListUpdateEnvelopeInput> = z
	.object({
		set: z.union([z.lazy(() => CardCreateInputSchema), z.lazy(() => CardCreateInputSchema).array()]).optional(),
		push: z.union([z.lazy(() => CardCreateInputSchema), z.lazy(() => CardCreateInputSchema).array()]).optional(),
		updateMany: z.lazy(() => CardUpdateManyInputSchema).optional(),
		deleteMany: z.lazy(() => CardDeleteManyInputSchema).optional(),
	})
	.strict();

export const BadgeListUpdateEnvelopeInputSchema: z.ZodType<Prisma.BadgeListUpdateEnvelopeInput> = z
	.object({
		set: z.union([z.lazy(() => BadgeCreateInputSchema), z.lazy(() => BadgeCreateInputSchema).array()]).optional(),
		push: z.union([z.lazy(() => BadgeCreateInputSchema), z.lazy(() => BadgeCreateInputSchema).array()]).optional(),
		updateMany: z.lazy(() => BadgeUpdateManyInputSchema).optional(),
		deleteMany: z.lazy(() => BadgeDeleteManyInputSchema).optional(),
	})
	.strict();

export const InventoryItemListUpdateEnvelopeInputSchema: z.ZodType<Prisma.InventoryItemListUpdateEnvelopeInput> = z
	.object({
		set: z
			.union([z.lazy(() => InventoryItemCreateInputSchema), z.lazy(() => InventoryItemCreateInputSchema).array()])
			.optional(),
		push: z
			.union([z.lazy(() => InventoryItemCreateInputSchema), z.lazy(() => InventoryItemCreateInputSchema).array()])
			.optional(),
		updateMany: z.lazy(() => InventoryItemUpdateManyInputSchema).optional(),
		deleteMany: z.lazy(() => InventoryItemDeleteManyInputSchema).optional(),
	})
	.strict();

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z
	.object({
		equals: z.string().optional(),
		in: z.string().array().optional(),
		notIn: z.string().array().optional(),
		lt: z.string().optional(),
		lte: z.string().optional(),
		gt: z.string().optional(),
		gte: z.string().optional(),
		contains: z.string().optional(),
		startsWith: z.string().optional(),
		endsWith: z.string().optional(),
		not: z.union([z.string(), z.lazy(() => NestedStringFilterSchema)]).optional(),
	})
	.strict();

export const DiscordEmbedWhereInputSchema: z.ZodType<Prisma.DiscordEmbedWhereInput> = z
	.object({
		AND: z
			.union([z.lazy(() => DiscordEmbedWhereInputSchema), z.lazy(() => DiscordEmbedWhereInputSchema).array()])
			.optional(),
		OR: z
			.lazy(() => DiscordEmbedWhereInputSchema)
			.array()
			.optional(),
		NOT: z
			.union([z.lazy(() => DiscordEmbedWhereInputSchema), z.lazy(() => DiscordEmbedWhereInputSchema).array()])
			.optional(),
		url: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		title: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		description: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		color: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
		timestamp: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		footer: z
			.union([
				z.lazy(() => DiscordEmbedFooterCompositeFilterSchema),
				z.lazy(() => DiscordEmbedFooterObjectEqualityInputSchema),
			])
			.optional(),
		image: z
			.union([
				z.lazy(() => DiscordEmbedImageCompositeFilterSchema),
				z.lazy(() => DiscordEmbedImageObjectEqualityInputSchema),
			])
			.optional(),
		thumbnail: z
			.union([
				z.lazy(() => DiscordEmbedThumbnailCompositeFilterSchema),
				z.lazy(() => DiscordEmbedThumbnailObjectEqualityInputSchema),
			])
			.optional(),
		author: z
			.union([
				z.lazy(() => DiscordEmbedAuthorCompositeFilterSchema),
				z.lazy(() => DiscordEmbedAuthorObjectEqualityInputSchema),
			])
			.optional(),
		fields: z
			.union([
				z.lazy(() => DiscordEmbedFieldCompositeListFilterSchema),
				z.lazy(() => DiscordEmbedFieldObjectEqualityInputSchema).array(),
			])
			.optional(),
	})
	.strict();

export const DiscordEmbedFooterObjectEqualityInputSchema: z.ZodType<Prisma.DiscordEmbedFooterObjectEqualityInput> = z
	.object({
		text: z.string(),
		icon_url: z.string(),
	})
	.strict();

export const DiscordEmbedImageObjectEqualityInputSchema: z.ZodType<Prisma.DiscordEmbedImageObjectEqualityInput> = z
	.object({
		url: z.string(),
	})
	.strict();

export const DiscordEmbedThumbnailObjectEqualityInputSchema: z.ZodType<Prisma.DiscordEmbedThumbnailObjectEqualityInput> =
	z
		.object({
			url: z.string(),
		})
		.strict();

export const DiscordEmbedAuthorObjectEqualityInputSchema: z.ZodType<Prisma.DiscordEmbedAuthorObjectEqualityInput> = z
	.object({
		name: z.string(),
		url: z.string(),
		icon_url: z.string(),
	})
	.strict();

export const DiscordEmbedFieldObjectEqualityInputSchema: z.ZodType<Prisma.DiscordEmbedFieldObjectEqualityInput> = z
	.object({
		name: z.string(),
		value: z.string(),
		inline: z.boolean(),
	})
	.strict();

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> = z
	.object({
		equals: z.string().optional(),
		in: z.string().array().optional(),
		notIn: z.string().array().optional(),
		lt: z.string().optional(),
		lte: z.string().optional(),
		gt: z.string().optional(),
		gte: z.string().optional(),
		contains: z.string().optional(),
		startsWith: z.string().optional(),
		endsWith: z.string().optional(),
		not: z.union([z.string(), z.lazy(() => NestedStringWithAggregatesFilterSchema)]).optional(),
		_count: z.lazy(() => NestedIntFilterSchema).optional(),
		_min: z.lazy(() => NestedStringFilterSchema).optional(),
		_max: z.lazy(() => NestedStringFilterSchema).optional(),
	})
	.strict();

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z
	.object({
		equals: z.number().optional(),
		in: z.number().array().optional(),
		notIn: z.number().array().optional(),
		lt: z.number().optional(),
		lte: z.number().optional(),
		gt: z.number().optional(),
		gte: z.number().optional(),
		not: z.union([z.number(), z.lazy(() => NestedIntFilterSchema)]).optional(),
	})
	.strict();

export const NestedStringNullableFilterSchema: z.ZodType<Prisma.NestedStringNullableFilter> = z
	.object({
		equals: z.string().optional().nullable(),
		in: z.string().array().optional().nullable(),
		notIn: z.string().array().optional().nullable(),
		lt: z.string().optional(),
		lte: z.string().optional(),
		gt: z.string().optional(),
		gte: z.string().optional(),
		contains: z.string().optional(),
		startsWith: z.string().optional(),
		endsWith: z.string().optional(),
		not: z
			.union([z.string(), z.lazy(() => NestedStringNullableFilterSchema)])
			.optional()
			.nullable(),
		isSet: z.boolean().optional(),
	})
	.strict();

export const LevelsWhereInputSchema: z.ZodType<Prisma.LevelsWhereInput> = z
	.object({
		AND: z.union([z.lazy(() => LevelsWhereInputSchema), z.lazy(() => LevelsWhereInputSchema).array()]).optional(),
		OR: z
			.lazy(() => LevelsWhereInputSchema)
			.array()
			.optional(),
		NOT: z.union([z.lazy(() => LevelsWhereInputSchema), z.lazy(() => LevelsWhereInputSchema).array()]).optional(),
		enabled: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
		stackRewards: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
		clearOnLeave: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
		addRolesOnJoin: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
		rankCard: z
			.union([z.lazy(() => CardCompositeFilterSchema), z.lazy(() => CardObjectEqualityInputSchema)])
			.optional(),
		allowCustomRankCard: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
		boost: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
		boosts: z
			.union([
				z.lazy(() => ExpBoostCompositeListFilterSchema),
				z.lazy(() => ExpBoostObjectEqualityInputSchema).array(),
			])
			.optional(),
		textExpEnabled: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
		textRateMin: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
		textRateMax: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
		textCooldown: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
		voiceExpEnabled: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
		voiceRateMin: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
		voiceRateMax: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
		voiceCooldown: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
		notifyDestination: z
			.union([z.lazy(() => EnumDestinationFilterSchema), z.lazy(() => DestinationSchema)])
			.optional(),
		notifyMessageType: z
			.union([z.lazy(() => EnumMessageTypeFilterSchema), z.lazy(() => MessageTypeSchema)])
			.optional(),
		notifyChannel: z
			.union([z.lazy(() => StringNullableFilterSchema), z.string()])
			.optional()
			.nullable(),
		notifyMessageContent: z
			.union([z.lazy(() => StringNullableFilterSchema), z.string()])
			.optional()
			.nullable(),
		notifyMessageEmbed: z
			.union([
				z.lazy(() => DiscordEmbedNullableCompositeFilterSchema),
				z.lazy(() => DiscordEmbedObjectEqualityInputSchema),
			])
			.optional()
			.nullable(),
		roleRestriction: z
			.union([z.lazy(() => RestrictionCompositeFilterSchema), z.lazy(() => RestrictionObjectEqualityInputSchema)])
			.optional(),
		channelRestriction: z
			.union([z.lazy(() => RestrictionCompositeFilterSchema), z.lazy(() => RestrictionObjectEqualityInputSchema)])
			.optional(),
		rewards: z
			.union([
				z.lazy(() => RewardCompositeListFilterSchema),
				z.lazy(() => RewardObjectEqualityInputSchema).array(),
			])
			.optional(),
	})
	.strict();

export const ExpBoostObjectEqualityInputSchema: z.ZodType<Prisma.ExpBoostObjectEqualityInput> = z
	.object({
		type: z.lazy(() => DiscordEntitySchema),
		id: z.string(),
		boost: z.number(),
	})
	.strict();

export const RewardObjectEqualityInputSchema: z.ZodType<Prisma.RewardObjectEqualityInput> = z
	.object({
		level: z.number(),
		roles: z.string().array().optional(),
	})
	.strict();

export const StarsWhereInputSchema: z.ZodType<Prisma.StarsWhereInput> = z
	.object({
		AND: z.union([z.lazy(() => StarsWhereInputSchema), z.lazy(() => StarsWhereInputSchema).array()]).optional(),
		OR: z
			.lazy(() => StarsWhereInputSchema)
			.array()
			.optional(),
		NOT: z.union([z.lazy(() => StarsWhereInputSchema), z.lazy(() => StarsWhereInputSchema).array()]).optional(),
		enabled: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
		channelId: z
			.union([z.lazy(() => StringNullableFilterSchema), z.string()])
			.optional()
			.nullable(),
		emoji: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		threshold: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
		duplicateOriginal: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
		selfStarEnabled: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
		selfStarWarning: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
		messageType: z.union([z.lazy(() => EnumMessageTypeFilterSchema), z.lazy(() => MessageTypeSchema)]).optional(),
		messageContent: z
			.union([z.lazy(() => StringNullableFilterSchema), z.string()])
			.optional()
			.nullable(),
		embed: z
			.union([
				z.lazy(() => DiscordEmbedNullableCompositeFilterSchema),
				z.lazy(() => DiscordEmbedObjectEqualityInputSchema),
			])
			.optional()
			.nullable(),
		roleRestriction: z
			.union([z.lazy(() => RestrictionCompositeFilterSchema), z.lazy(() => RestrictionObjectEqualityInputSchema)])
			.optional(),
		channelRestriction: z
			.union([z.lazy(() => RestrictionCompositeFilterSchema), z.lazy(() => RestrictionObjectEqualityInputSchema)])
			.optional(),
	})
	.strict();

export const EconomyWhereInputSchema: z.ZodType<Prisma.EconomyWhereInput> = z
	.object({
		AND: z.union([z.lazy(() => EconomyWhereInputSchema), z.lazy(() => EconomyWhereInputSchema).array()]).optional(),
		OR: z
			.lazy(() => EconomyWhereInputSchema)
			.array()
			.optional(),
		NOT: z.union([z.lazy(() => EconomyWhereInputSchema), z.lazy(() => EconomyWhereInputSchema).array()]).optional(),
		enabled: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
		currencyName: z
			.union([z.lazy(() => StringNullableFilterSchema), z.string()])
			.optional()
			.nullable(),
		currencyIcon: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		currencyIconLocation: z
			.union([z.lazy(() => EnumCurrencyIconLocationFilterSchema), z.lazy(() => CurrencyIconLocationSchema)])
			.optional(),
		inventorySize: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
		wagerMin: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
		wagerMax: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
		dailyRewardMin: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
		dailyRewardMax: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
		textRateMin: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
		textRateMax: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
		textCooldown: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
		allowNegativeBalance: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
		negativeBalanceLimit: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
		defaultBalance: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
		debugMode: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
		clearOnLeave: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
		autoUseItems: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
		roleRestriction: z
			.union([
				z.lazy(() => RestrictionNullableCompositeFilterSchema),
				z.lazy(() => RestrictionObjectEqualityInputSchema),
			])
			.optional()
			.nullable(),
		channelRestriction: z
			.union([
				z.lazy(() => RestrictionNullableCompositeFilterSchema),
				z.lazy(() => RestrictionObjectEqualityInputSchema),
			])
			.optional()
			.nullable(),
	})
	.strict();

export const RestrictionWhereInputSchema: z.ZodType<Prisma.RestrictionWhereInput> = z
	.object({
		AND: z
			.union([z.lazy(() => RestrictionWhereInputSchema), z.lazy(() => RestrictionWhereInputSchema).array()])
			.optional(),
		OR: z
			.lazy(() => RestrictionWhereInputSchema)
			.array()
			.optional(),
		NOT: z
			.union([z.lazy(() => RestrictionWhereInputSchema), z.lazy(() => RestrictionWhereInputSchema).array()])
			.optional(),
		type: z.union([z.lazy(() => EnumRestrictionTypeFilterSchema), z.lazy(() => RestrictionTypeSchema)]).optional(),
		omit: z.lazy(() => StringNullableListFilterSchema).optional(),
	})
	.strict();

export const NestedIntNullableFilterSchema: z.ZodType<Prisma.NestedIntNullableFilter> = z
	.object({
		equals: z.number().optional().nullable(),
		in: z.number().array().optional().nullable(),
		notIn: z.number().array().optional().nullable(),
		lt: z.number().optional(),
		lte: z.number().optional(),
		gt: z.number().optional(),
		gte: z.number().optional(),
		not: z
			.union([z.number(), z.lazy(() => NestedIntNullableFilterSchema)])
			.optional()
			.nullable(),
		isSet: z.boolean().optional(),
	})
	.strict();

export const ExpBoostOrderByCompositeAggregateInputSchema: z.ZodType<Prisma.ExpBoostOrderByCompositeAggregateInput> = z
	.object({
		_count: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const RewardOrderByCompositeAggregateInputSchema: z.ZodType<Prisma.RewardOrderByCompositeAggregateInput> = z
	.object({
		_count: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const NestedStringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter> =
	z
		.object({
			equals: z.string().optional().nullable(),
			in: z.string().array().optional().nullable(),
			notIn: z.string().array().optional().nullable(),
			lt: z.string().optional(),
			lte: z.string().optional(),
			gt: z.string().optional(),
			gte: z.string().optional(),
			contains: z.string().optional(),
			startsWith: z.string().optional(),
			endsWith: z.string().optional(),
			not: z
				.union([z.string(), z.lazy(() => NestedStringNullableWithAggregatesFilterSchema)])
				.optional()
				.nullable(),
			_count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
			_min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
			_max: z.lazy(() => NestedStringNullableFilterSchema).optional(),
			isSet: z.boolean().optional(),
		})
		.strict();

export const NestedIntNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntNullableWithAggregatesFilter> = z
	.object({
		equals: z.number().optional().nullable(),
		in: z.number().array().optional().nullable(),
		notIn: z.number().array().optional().nullable(),
		lt: z.number().optional(),
		lte: z.number().optional(),
		gt: z.number().optional(),
		gte: z.number().optional(),
		not: z
			.union([z.number(), z.lazy(() => NestedIntNullableWithAggregatesFilterSchema)])
			.optional()
			.nullable(),
		_count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
		_avg: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
		_sum: z.lazy(() => NestedIntNullableFilterSchema).optional(),
		_min: z.lazy(() => NestedIntNullableFilterSchema).optional(),
		_max: z.lazy(() => NestedIntNullableFilterSchema).optional(),
		isSet: z.boolean().optional(),
	})
	.strict();

export const NestedFloatNullableFilterSchema: z.ZodType<Prisma.NestedFloatNullableFilter> = z
	.object({
		equals: z.number().optional().nullable(),
		in: z.number().array().optional().nullable(),
		notIn: z.number().array().optional().nullable(),
		lt: z.number().optional(),
		lte: z.number().optional(),
		gt: z.number().optional(),
		gte: z.number().optional(),
		not: z
			.union([z.number(), z.lazy(() => NestedFloatNullableFilterSchema)])
			.optional()
			.nullable(),
		isSet: z.boolean().optional(),
	})
	.strict();

export const NestedEnumReactionRoleTypeFilterSchema: z.ZodType<Prisma.NestedEnumReactionRoleTypeFilter> = z
	.object({
		equals: z.lazy(() => ReactionRoleTypeSchema).optional(),
		in: z
			.lazy(() => ReactionRoleTypeSchema)
			.array()
			.optional(),
		notIn: z
			.lazy(() => ReactionRoleTypeSchema)
			.array()
			.optional(),
		not: z
			.union([z.lazy(() => ReactionRoleTypeSchema), z.lazy(() => NestedEnumReactionRoleTypeFilterSchema)])
			.optional(),
	})
	.strict();

export const NestedBoolFilterSchema: z.ZodType<Prisma.NestedBoolFilter> = z
	.object({
		equals: z.boolean().optional(),
		not: z.union([z.boolean(), z.lazy(() => NestedBoolFilterSchema)]).optional(),
	})
	.strict();

export const ReactionRolePairWhereInputSchema: z.ZodType<Prisma.ReactionRolePairWhereInput> = z
	.object({
		AND: z
			.union([
				z.lazy(() => ReactionRolePairWhereInputSchema),
				z.lazy(() => ReactionRolePairWhereInputSchema).array(),
			])
			.optional(),
		OR: z
			.lazy(() => ReactionRolePairWhereInputSchema)
			.array()
			.optional(),
		NOT: z
			.union([
				z.lazy(() => ReactionRolePairWhereInputSchema),
				z.lazy(() => ReactionRolePairWhereInputSchema).array(),
			])
			.optional(),
		emoji: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		roles: z.lazy(() => StringNullableListFilterSchema).optional(),
	})
	.strict();

export const DiscordEmbedFooterOrderByInputSchema: z.ZodType<Prisma.DiscordEmbedFooterOrderByInput> = z
	.object({
		text: z.lazy(() => SortOrderSchema).optional(),
		icon_url: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const DiscordEmbedImageOrderByInputSchema: z.ZodType<Prisma.DiscordEmbedImageOrderByInput> = z
	.object({
		url: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const DiscordEmbedThumbnailOrderByInputSchema: z.ZodType<Prisma.DiscordEmbedThumbnailOrderByInput> = z
	.object({
		url: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const DiscordEmbedAuthorOrderByInputSchema: z.ZodType<Prisma.DiscordEmbedAuthorOrderByInput> = z
	.object({
		name: z.lazy(() => SortOrderSchema).optional(),
		url: z.lazy(() => SortOrderSchema).optional(),
		icon_url: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const DiscordEmbedFieldOrderByCompositeAggregateInputSchema: z.ZodType<Prisma.DiscordEmbedFieldOrderByCompositeAggregateInput> =
	z
		.object({
			_count: z.lazy(() => SortOrderSchema).optional(),
		})
		.strict();

export const NestedEnumReactionRoleTypeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumReactionRoleTypeWithAggregatesFilter> =
	z
		.object({
			equals: z.lazy(() => ReactionRoleTypeSchema).optional(),
			in: z
				.lazy(() => ReactionRoleTypeSchema)
				.array()
				.optional(),
			notIn: z
				.lazy(() => ReactionRoleTypeSchema)
				.array()
				.optional(),
			not: z
				.union([
					z.lazy(() => ReactionRoleTypeSchema),
					z.lazy(() => NestedEnumReactionRoleTypeWithAggregatesFilterSchema),
				])
				.optional(),
			_count: z.lazy(() => NestedIntFilterSchema).optional(),
			_min: z.lazy(() => NestedEnumReactionRoleTypeFilterSchema).optional(),
			_max: z.lazy(() => NestedEnumReactionRoleTypeFilterSchema).optional(),
		})
		.strict();

export const NestedBoolWithAggregatesFilterSchema: z.ZodType<Prisma.NestedBoolWithAggregatesFilter> = z
	.object({
		equals: z.boolean().optional(),
		not: z.union([z.boolean(), z.lazy(() => NestedBoolWithAggregatesFilterSchema)]).optional(),
		_count: z.lazy(() => NestedIntFilterSchema).optional(),
		_min: z.lazy(() => NestedBoolFilterSchema).optional(),
		_max: z.lazy(() => NestedBoolFilterSchema).optional(),
	})
	.strict();

export const NestedIntWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntWithAggregatesFilter> = z
	.object({
		equals: z.number().optional(),
		in: z.number().array().optional(),
		notIn: z.number().array().optional(),
		lt: z.number().optional(),
		lte: z.number().optional(),
		gt: z.number().optional(),
		gte: z.number().optional(),
		not: z.union([z.number(), z.lazy(() => NestedIntWithAggregatesFilterSchema)]).optional(),
		_count: z.lazy(() => NestedIntFilterSchema).optional(),
		_avg: z.lazy(() => NestedFloatFilterSchema).optional(),
		_sum: z.lazy(() => NestedIntFilterSchema).optional(),
		_min: z.lazy(() => NestedIntFilterSchema).optional(),
		_max: z.lazy(() => NestedIntFilterSchema).optional(),
	})
	.strict();

export const NestedFloatFilterSchema: z.ZodType<Prisma.NestedFloatFilter> = z
	.object({
		equals: z.number().optional(),
		in: z.number().array().optional(),
		notIn: z.number().array().optional(),
		lt: z.number().optional(),
		lte: z.number().optional(),
		gt: z.number().optional(),
		gte: z.number().optional(),
		not: z.union([z.number(), z.lazy(() => NestedFloatFilterSchema)]).optional(),
	})
	.strict();

export const NestedEnumItemTypeFilterSchema: z.ZodType<Prisma.NestedEnumItemTypeFilter> = z
	.object({
		equals: z.lazy(() => ItemTypeSchema).optional(),
		in: z
			.lazy(() => ItemTypeSchema)
			.array()
			.optional(),
		notIn: z
			.lazy(() => ItemTypeSchema)
			.array()
			.optional(),
		not: z.union([z.lazy(() => ItemTypeSchema), z.lazy(() => NestedEnumItemTypeFilterSchema)]).optional(),
	})
	.strict();

export const ItemDataWhereInputSchema: z.ZodType<Prisma.ItemDataWhereInput> = z
	.object({
		AND: z
			.union([z.lazy(() => ItemDataWhereInputSchema), z.lazy(() => ItemDataWhereInputSchema).array()])
			.optional(),
		OR: z
			.lazy(() => ItemDataWhereInputSchema)
			.array()
			.optional(),
		NOT: z
			.union([z.lazy(() => ItemDataWhereInputSchema), z.lazy(() => ItemDataWhereInputSchema).array()])
			.optional(),
		roles: z.lazy(() => StringNullableListFilterSchema).optional(),
		badge: z
			.union([z.lazy(() => StringNullableFilterSchema), z.string()])
			.optional()
			.nullable(),
		script: z
			.union([z.lazy(() => StringNullableFilterSchema), z.string()])
			.optional()
			.nullable(),
	})
	.strict();

export const PurchaseResponseWhereInputSchema: z.ZodType<Prisma.PurchaseResponseWhereInput> = z
	.object({
		AND: z
			.union([
				z.lazy(() => PurchaseResponseWhereInputSchema),
				z.lazy(() => PurchaseResponseWhereInputSchema).array(),
			])
			.optional(),
		OR: z
			.lazy(() => PurchaseResponseWhereInputSchema)
			.array()
			.optional(),
		NOT: z
			.union([
				z.lazy(() => PurchaseResponseWhereInputSchema),
				z.lazy(() => PurchaseResponseWhereInputSchema).array(),
			])
			.optional(),
		channel: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		content: z
			.union([z.lazy(() => StringNullableFilterSchema), z.string()])
			.optional()
			.nullable(),
	})
	.strict();

export const PurchaseRequiresWhereInputSchema: z.ZodType<Prisma.PurchaseRequiresWhereInput> = z
	.object({
		AND: z
			.union([
				z.lazy(() => PurchaseRequiresWhereInputSchema),
				z.lazy(() => PurchaseRequiresWhereInputSchema).array(),
			])
			.optional(),
		OR: z
			.lazy(() => PurchaseRequiresWhereInputSchema)
			.array()
			.optional(),
		NOT: z
			.union([
				z.lazy(() => PurchaseRequiresWhereInputSchema),
				z.lazy(() => PurchaseRequiresWhereInputSchema).array(),
			])
			.optional(),
		level: z
			.union([z.lazy(() => IntNullableFilterSchema), z.number()])
			.optional()
			.nullable(),
		roles: z.lazy(() => StringNullableListFilterSchema).optional(),
	})
	.strict();

export const NestedEnumItemTypeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumItemTypeWithAggregatesFilter> = z
	.object({
		equals: z.lazy(() => ItemTypeSchema).optional(),
		in: z
			.lazy(() => ItemTypeSchema)
			.array()
			.optional(),
		notIn: z
			.lazy(() => ItemTypeSchema)
			.array()
			.optional(),
		not: z
			.union([z.lazy(() => ItemTypeSchema), z.lazy(() => NestedEnumItemTypeWithAggregatesFilterSchema)])
			.optional(),
		_count: z.lazy(() => NestedIntFilterSchema).optional(),
		_min: z.lazy(() => NestedEnumItemTypeFilterSchema).optional(),
		_max: z.lazy(() => NestedEnumItemTypeFilterSchema).optional(),
	})
	.strict();

export const CardWhereInputSchema: z.ZodType<Prisma.CardWhereInput> = z
	.object({
		AND: z.union([z.lazy(() => CardWhereInputSchema), z.lazy(() => CardWhereInputSchema).array()]).optional(),
		OR: z
			.lazy(() => CardWhereInputSchema)
			.array()
			.optional(),
		NOT: z.union([z.lazy(() => CardWhereInputSchema), z.lazy(() => CardWhereInputSchema).array()]).optional(),
		name: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		borderRadius: z
			.union([z.lazy(() => IntNullableFilterSchema), z.number()])
			.optional()
			.nullable(),
		wrapperImage: z
			.union([z.lazy(() => StringNullableFilterSchema), z.string()])
			.optional()
			.nullable(),
		wrapperColor: z
			.union([
				z.lazy(() => HSLAColorNullableCompositeFilterSchema),
				z.lazy(() => HSLAColorObjectEqualityInputSchema),
			])
			.optional()
			.nullable(),
		overlayColor: z
			.union([
				z.lazy(() => HSLAColorNullableCompositeFilterSchema),
				z.lazy(() => HSLAColorObjectEqualityInputSchema),
			])
			.optional()
			.nullable(),
		overlayAccentColor: z
			.union([
				z.lazy(() => HSLAColorNullableCompositeFilterSchema),
				z.lazy(() => HSLAColorObjectEqualityInputSchema),
			])
			.optional()
			.nullable(),
		progressBarColor: z
			.union([
				z.lazy(() => HSLAColorNullableCompositeFilterSchema),
				z.lazy(() => HSLAColorObjectEqualityInputSchema),
			])
			.optional()
			.nullable(),
		fontFamily: z.union([z.lazy(() => EnumFontFamilyFilterSchema), z.lazy(() => FontFamilySchema)]).optional(),
		textColor: z
			.union([
				z.lazy(() => HSLAColorNullableCompositeFilterSchema),
				z.lazy(() => HSLAColorObjectEqualityInputSchema),
			])
			.optional()
			.nullable(),
		subtextColor: z
			.union([
				z.lazy(() => HSLAColorNullableCompositeFilterSchema),
				z.lazy(() => HSLAColorObjectEqualityInputSchema),
			])
			.optional()
			.nullable(),
	})
	.strict();

export const HSLAColorObjectEqualityInputSchema: z.ZodType<Prisma.HSLAColorObjectEqualityInput> = z
	.object({
		h: z.number(),
		s: z.number(),
		l: z.number(),
		a: z.number(),
	})
	.strict();

export const BadgeWhereInputSchema: z.ZodType<Prisma.BadgeWhereInput> = z
	.object({
		AND: z.union([z.lazy(() => BadgeWhereInputSchema), z.lazy(() => BadgeWhereInputSchema).array()]).optional(),
		OR: z
			.lazy(() => BadgeWhereInputSchema)
			.array()
			.optional(),
		NOT: z.union([z.lazy(() => BadgeWhereInputSchema), z.lazy(() => BadgeWhereInputSchema).array()]).optional(),
		itemId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		active: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
		slot: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
	})
	.strict();

export const InventoryItemWhereInputSchema: z.ZodType<Prisma.InventoryItemWhereInput> = z
	.object({
		AND: z
			.union([z.lazy(() => InventoryItemWhereInputSchema), z.lazy(() => InventoryItemWhereInputSchema).array()])
			.optional(),
		OR: z
			.lazy(() => InventoryItemWhereInputSchema)
			.array()
			.optional(),
		NOT: z
			.union([z.lazy(() => InventoryItemWhereInputSchema), z.lazy(() => InventoryItemWhereInputSchema).array()])
			.optional(),
		itemId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		name: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		amount: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
	})
	.strict();

export const HSLAColorOrderByInputSchema: z.ZodType<Prisma.HSLAColorOrderByInput> = z
	.object({
		h: z.lazy(() => SortOrderSchema).optional(),
		s: z.lazy(() => SortOrderSchema).optional(),
		l: z.lazy(() => SortOrderSchema).optional(),
		a: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const DiscordEmbedFooterCreateInputSchema: z.ZodType<Prisma.DiscordEmbedFooterCreateInput> = z
	.object({
		text: z.string().optional(),
		icon_url: z.string().optional(),
	})
	.strict();

export const DiscordEmbedImageCreateInputSchema: z.ZodType<Prisma.DiscordEmbedImageCreateInput> = z
	.object({
		url: z.string().optional(),
	})
	.strict();

export const DiscordEmbedThumbnailCreateInputSchema: z.ZodType<Prisma.DiscordEmbedThumbnailCreateInput> = z
	.object({
		url: z.string().optional(),
	})
	.strict();

export const DiscordEmbedAuthorCreateInputSchema: z.ZodType<Prisma.DiscordEmbedAuthorCreateInput> = z
	.object({
		name: z.string().optional(),
		url: z.string().optional(),
		icon_url: z.string().optional(),
	})
	.strict();

export const DiscordEmbedFieldCreateInputSchema: z.ZodType<Prisma.DiscordEmbedFieldCreateInput> = z
	.object({
		name: z.string().optional(),
		value: z.string().optional(),
		inline: z.boolean().optional(),
	})
	.strict();

export const DiscordEmbedUpdateManyInputSchema: z.ZodType<Prisma.DiscordEmbedUpdateManyInput> = z
	.object({
		where: z.lazy(() => DiscordEmbedWhereInputSchema),
		data: z.lazy(() => DiscordEmbedUpdateInputSchema),
	})
	.strict();

export const DiscordEmbedDeleteManyInputSchema: z.ZodType<Prisma.DiscordEmbedDeleteManyInput> = z
	.object({
		where: z.lazy(() => DiscordEmbedWhereInputSchema),
	})
	.strict();

export const ExpBoostCreateInputSchema: z.ZodType<Prisma.ExpBoostCreateInput> = z
	.object({
		type: z.lazy(() => DiscordEntitySchema),
		id: z.string(),
		boost: z.number(),
	})
	.strict();

export const RewardCreateInputSchema: z.ZodType<Prisma.RewardCreateInput> = z
	.object({
		level: z.number(),
		roles: z.union([z.lazy(() => RewardCreaterolesInputSchema), z.string().array()]).optional(),
	})
	.strict();

export const RestrictionCreateomitInputSchema: z.ZodType<Prisma.RestrictionCreateomitInput> = z
	.object({
		set: z.string().array(),
	})
	.strict();

export const LevelsUpdateInputSchema: z.ZodType<Prisma.LevelsUpdateInput> = z
	.object({
		enabled: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
		stackRewards: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
		clearOnLeave: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
		addRolesOnJoin: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
		rankCard: z
			.union([z.lazy(() => CardUpdateEnvelopeInputSchema), z.lazy(() => CardCreateInputSchema)])
			.optional(),
		allowCustomRankCard: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
		boost: z.union([z.number(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		boosts: z
			.union([
				z.lazy(() => ExpBoostListUpdateEnvelopeInputSchema),
				z.lazy(() => ExpBoostCreateInputSchema),
				z.lazy(() => ExpBoostCreateInputSchema).array(),
			])
			.optional(),
		textExpEnabled: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
		textRateMin: z.union([z.number(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		textRateMax: z.union([z.number(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		textCooldown: z.union([z.number(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		voiceExpEnabled: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
		voiceRateMin: z.union([z.number(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		voiceRateMax: z.union([z.number(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		voiceCooldown: z.union([z.number(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		notifyDestination: z
			.union([z.lazy(() => DestinationSchema), z.lazy(() => EnumDestinationFieldUpdateOperationsInputSchema)])
			.optional(),
		notifyMessageType: z
			.union([z.lazy(() => MessageTypeSchema), z.lazy(() => EnumMessageTypeFieldUpdateOperationsInputSchema)])
			.optional(),
		notifyChannel: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		notifyMessageContent: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		notifyMessageEmbed: z
			.union([
				z.lazy(() => DiscordEmbedNullableUpdateEnvelopeInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema),
			])
			.optional()
			.nullable(),
		roleRestriction: z
			.union([z.lazy(() => RestrictionUpdateEnvelopeInputSchema), z.lazy(() => RestrictionCreateInputSchema)])
			.optional(),
		channelRestriction: z
			.union([z.lazy(() => RestrictionUpdateEnvelopeInputSchema), z.lazy(() => RestrictionCreateInputSchema)])
			.optional(),
		rewards: z
			.union([
				z.lazy(() => RewardListUpdateEnvelopeInputSchema),
				z.lazy(() => RewardCreateInputSchema),
				z.lazy(() => RewardCreateInputSchema).array(),
			])
			.optional(),
	})
	.strict();

export const StarsUpdateInputSchema: z.ZodType<Prisma.StarsUpdateInput> = z
	.object({
		enabled: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
		channelId: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		emoji: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		threshold: z.union([z.number(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		duplicateOriginal: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
		selfStarEnabled: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
		selfStarWarning: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
		messageType: z
			.union([z.lazy(() => MessageTypeSchema), z.lazy(() => EnumMessageTypeFieldUpdateOperationsInputSchema)])
			.optional(),
		messageContent: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		embed: z
			.union([
				z.lazy(() => DiscordEmbedNullableUpdateEnvelopeInputSchema),
				z.lazy(() => DiscordEmbedCreateInputSchema),
			])
			.optional()
			.nullable(),
		roleRestriction: z
			.union([z.lazy(() => RestrictionUpdateEnvelopeInputSchema), z.lazy(() => RestrictionCreateInputSchema)])
			.optional(),
		channelRestriction: z
			.union([z.lazy(() => RestrictionUpdateEnvelopeInputSchema), z.lazy(() => RestrictionCreateInputSchema)])
			.optional(),
	})
	.strict();

export const EconomyUpdateInputSchema: z.ZodType<Prisma.EconomyUpdateInput> = z
	.object({
		enabled: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
		currencyName: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		currencyIcon: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		currencyIconLocation: z
			.union([
				z.lazy(() => CurrencyIconLocationSchema),
				z.lazy(() => EnumCurrencyIconLocationFieldUpdateOperationsInputSchema),
			])
			.optional(),
		inventorySize: z.union([z.number(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		wagerMin: z.union([z.number(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		wagerMax: z.union([z.number(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		dailyRewardMin: z.union([z.number(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		dailyRewardMax: z.union([z.number(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		textRateMin: z.union([z.number(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		textRateMax: z.union([z.number(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		textCooldown: z.union([z.number(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		allowNegativeBalance: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
		negativeBalanceLimit: z.union([z.number(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		defaultBalance: z.union([z.number(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		debugMode: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
		clearOnLeave: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
		autoUseItems: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
		roleRestriction: z
			.union([
				z.lazy(() => RestrictionNullableUpdateEnvelopeInputSchema),
				z.lazy(() => RestrictionCreateInputSchema),
			])
			.optional()
			.nullable(),
		channelRestriction: z
			.union([
				z.lazy(() => RestrictionNullableUpdateEnvelopeInputSchema),
				z.lazy(() => RestrictionCreateInputSchema),
			])
			.optional()
			.nullable(),
	})
	.strict();

export const RestrictionUpdateInputSchema: z.ZodType<Prisma.RestrictionUpdateInput> = z
	.object({
		type: z
			.union([
				z.lazy(() => RestrictionTypeSchema),
				z.lazy(() => EnumRestrictionTypeFieldUpdateOperationsInputSchema),
			])
			.optional(),
		omit: z.union([z.lazy(() => RestrictionUpdateomitInputSchema), z.string().array()]).optional(),
	})
	.strict();

export const ReactionRolePairCreaterolesInputSchema: z.ZodType<Prisma.ReactionRolePairCreaterolesInput> = z
	.object({
		set: z.string().array(),
	})
	.strict();

export const DiscordEmbedUpsertInputSchema: z.ZodType<Prisma.DiscordEmbedUpsertInput> = z
	.object({
		set: z.lazy(() => DiscordEmbedCreateInputSchema).nullable(),
		update: z.lazy(() => DiscordEmbedUpdateInputSchema),
	})
	.strict();

export const ReactionRolePairUpdateManyInputSchema: z.ZodType<Prisma.ReactionRolePairUpdateManyInput> = z
	.object({
		where: z.lazy(() => ReactionRolePairWhereInputSchema),
		data: z.lazy(() => ReactionRolePairUpdateInputSchema),
	})
	.strict();

export const ReactionRolePairDeleteManyInputSchema: z.ZodType<Prisma.ReactionRolePairDeleteManyInput> = z
	.object({
		where: z.lazy(() => ReactionRolePairWhereInputSchema),
	})
	.strict();

export const ItemDataCreaterolesInputSchema: z.ZodType<Prisma.ItemDataCreaterolesInput> = z
	.object({
		set: z.string().array(),
	})
	.strict();

export const PurchaseRequiresCreaterolesInputSchema: z.ZodType<Prisma.PurchaseRequiresCreaterolesInput> = z
	.object({
		set: z.string().array(),
	})
	.strict();

export const ItemDataUpsertInputSchema: z.ZodType<Prisma.ItemDataUpsertInput> = z
	.object({
		set: z.lazy(() => ItemDataCreateInputSchema).nullable(),
		update: z.lazy(() => ItemDataUpdateInputSchema),
	})
	.strict();

export const PurchaseResponseUpsertInputSchema: z.ZodType<Prisma.PurchaseResponseUpsertInput> = z
	.object({
		set: z.lazy(() => PurchaseResponseCreateInputSchema).nullable(),
		update: z.lazy(() => PurchaseResponseUpdateInputSchema),
	})
	.strict();

export const PurchaseRequiresUpsertInputSchema: z.ZodType<Prisma.PurchaseRequiresUpsertInput> = z
	.object({
		set: z.lazy(() => PurchaseRequiresCreateInputSchema).nullable(),
		update: z.lazy(() => PurchaseRequiresUpdateInputSchema),
	})
	.strict();

export const HSLAColorCreateInputSchema: z.ZodType<Prisma.HSLAColorCreateInput> = z
	.object({
		h: z.number(),
		s: z.number(),
		l: z.number(),
		a: z.number(),
	})
	.strict();

export const CardUpdateInputSchema: z.ZodType<Prisma.CardUpdateInput> = z
	.object({
		name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		borderRadius: z
			.union([z.number(), z.lazy(() => NullableIntFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		wrapperImage: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		wrapperColor: z
			.union([z.lazy(() => HSLAColorNullableUpdateEnvelopeInputSchema), z.lazy(() => HSLAColorCreateInputSchema)])
			.optional()
			.nullable(),
		overlayColor: z
			.union([z.lazy(() => HSLAColorNullableUpdateEnvelopeInputSchema), z.lazy(() => HSLAColorCreateInputSchema)])
			.optional()
			.nullable(),
		overlayAccentColor: z
			.union([z.lazy(() => HSLAColorNullableUpdateEnvelopeInputSchema), z.lazy(() => HSLAColorCreateInputSchema)])
			.optional()
			.nullable(),
		progressBarColor: z
			.union([z.lazy(() => HSLAColorNullableUpdateEnvelopeInputSchema), z.lazy(() => HSLAColorCreateInputSchema)])
			.optional()
			.nullable(),
		fontFamily: z
			.union([z.lazy(() => FontFamilySchema), z.lazy(() => EnumFontFamilyFieldUpdateOperationsInputSchema)])
			.optional(),
		textColor: z
			.union([z.lazy(() => HSLAColorNullableUpdateEnvelopeInputSchema), z.lazy(() => HSLAColorCreateInputSchema)])
			.optional()
			.nullable(),
		subtextColor: z
			.union([z.lazy(() => HSLAColorNullableUpdateEnvelopeInputSchema), z.lazy(() => HSLAColorCreateInputSchema)])
			.optional()
			.nullable(),
	})
	.strict();

export const CardUpdateManyInputSchema: z.ZodType<Prisma.CardUpdateManyInput> = z
	.object({
		where: z.lazy(() => CardWhereInputSchema),
		data: z.lazy(() => CardUpdateInputSchema),
	})
	.strict();

export const CardDeleteManyInputSchema: z.ZodType<Prisma.CardDeleteManyInput> = z
	.object({
		where: z.lazy(() => CardWhereInputSchema),
	})
	.strict();

export const BadgeUpdateManyInputSchema: z.ZodType<Prisma.BadgeUpdateManyInput> = z
	.object({
		where: z.lazy(() => BadgeWhereInputSchema),
		data: z.lazy(() => BadgeUpdateInputSchema),
	})
	.strict();

export const BadgeDeleteManyInputSchema: z.ZodType<Prisma.BadgeDeleteManyInput> = z
	.object({
		where: z.lazy(() => BadgeWhereInputSchema),
	})
	.strict();

export const InventoryItemUpdateManyInputSchema: z.ZodType<Prisma.InventoryItemUpdateManyInput> = z
	.object({
		where: z.lazy(() => InventoryItemWhereInputSchema),
		data: z.lazy(() => InventoryItemUpdateInputSchema),
	})
	.strict();

export const InventoryItemDeleteManyInputSchema: z.ZodType<Prisma.InventoryItemDeleteManyInput> = z
	.object({
		where: z.lazy(() => InventoryItemWhereInputSchema),
	})
	.strict();

export const DiscordEmbedFooterCompositeFilterSchema: z.ZodType<Prisma.DiscordEmbedFooterCompositeFilter> = z
	.object({
		equals: z.lazy(() => DiscordEmbedFooterObjectEqualityInputSchema).optional(),
		is: z.lazy(() => DiscordEmbedFooterWhereInputSchema).optional(),
		isNot: z.lazy(() => DiscordEmbedFooterWhereInputSchema).optional(),
	})
	.strict();

export const DiscordEmbedImageCompositeFilterSchema: z.ZodType<Prisma.DiscordEmbedImageCompositeFilter> = z
	.object({
		equals: z.lazy(() => DiscordEmbedImageObjectEqualityInputSchema).optional(),
		is: z.lazy(() => DiscordEmbedImageWhereInputSchema).optional(),
		isNot: z.lazy(() => DiscordEmbedImageWhereInputSchema).optional(),
	})
	.strict();

export const DiscordEmbedThumbnailCompositeFilterSchema: z.ZodType<Prisma.DiscordEmbedThumbnailCompositeFilter> = z
	.object({
		equals: z.lazy(() => DiscordEmbedThumbnailObjectEqualityInputSchema).optional(),
		is: z.lazy(() => DiscordEmbedThumbnailWhereInputSchema).optional(),
		isNot: z.lazy(() => DiscordEmbedThumbnailWhereInputSchema).optional(),
	})
	.strict();

export const DiscordEmbedAuthorCompositeFilterSchema: z.ZodType<Prisma.DiscordEmbedAuthorCompositeFilter> = z
	.object({
		equals: z.lazy(() => DiscordEmbedAuthorObjectEqualityInputSchema).optional(),
		is: z.lazy(() => DiscordEmbedAuthorWhereInputSchema).optional(),
		isNot: z.lazy(() => DiscordEmbedAuthorWhereInputSchema).optional(),
	})
	.strict();

export const DiscordEmbedFieldCompositeListFilterSchema: z.ZodType<Prisma.DiscordEmbedFieldCompositeListFilter> = z
	.object({
		equals: z
			.lazy(() => DiscordEmbedFieldObjectEqualityInputSchema)
			.array()
			.optional(),
		every: z.lazy(() => DiscordEmbedFieldWhereInputSchema).optional(),
		some: z.lazy(() => DiscordEmbedFieldWhereInputSchema).optional(),
		none: z.lazy(() => DiscordEmbedFieldWhereInputSchema).optional(),
		isEmpty: z.boolean().optional(),
		isSet: z.boolean().optional(),
	})
	.strict();

export const ExpBoostCompositeListFilterSchema: z.ZodType<Prisma.ExpBoostCompositeListFilter> = z
	.object({
		equals: z
			.lazy(() => ExpBoostObjectEqualityInputSchema)
			.array()
			.optional(),
		every: z.lazy(() => ExpBoostWhereInputSchema).optional(),
		some: z.lazy(() => ExpBoostWhereInputSchema).optional(),
		none: z.lazy(() => ExpBoostWhereInputSchema).optional(),
		isEmpty: z.boolean().optional(),
		isSet: z.boolean().optional(),
	})
	.strict();

export const EnumDestinationFilterSchema: z.ZodType<Prisma.EnumDestinationFilter> = z
	.object({
		equals: z.lazy(() => DestinationSchema).optional(),
		in: z
			.lazy(() => DestinationSchema)
			.array()
			.optional(),
		notIn: z
			.lazy(() => DestinationSchema)
			.array()
			.optional(),
		not: z.union([z.lazy(() => DestinationSchema), z.lazy(() => NestedEnumDestinationFilterSchema)]).optional(),
	})
	.strict();

export const EnumMessageTypeFilterSchema: z.ZodType<Prisma.EnumMessageTypeFilter> = z
	.object({
		equals: z.lazy(() => MessageTypeSchema).optional(),
		in: z
			.lazy(() => MessageTypeSchema)
			.array()
			.optional(),
		notIn: z
			.lazy(() => MessageTypeSchema)
			.array()
			.optional(),
		not: z.union([z.lazy(() => MessageTypeSchema), z.lazy(() => NestedEnumMessageTypeFilterSchema)]).optional(),
	})
	.strict();

export const RewardCompositeListFilterSchema: z.ZodType<Prisma.RewardCompositeListFilter> = z
	.object({
		equals: z
			.lazy(() => RewardObjectEqualityInputSchema)
			.array()
			.optional(),
		every: z.lazy(() => RewardWhereInputSchema).optional(),
		some: z.lazy(() => RewardWhereInputSchema).optional(),
		none: z.lazy(() => RewardWhereInputSchema).optional(),
		isEmpty: z.boolean().optional(),
		isSet: z.boolean().optional(),
	})
	.strict();

export const EnumCurrencyIconLocationFilterSchema: z.ZodType<Prisma.EnumCurrencyIconLocationFilter> = z
	.object({
		equals: z.lazy(() => CurrencyIconLocationSchema).optional(),
		in: z
			.lazy(() => CurrencyIconLocationSchema)
			.array()
			.optional(),
		notIn: z
			.lazy(() => CurrencyIconLocationSchema)
			.array()
			.optional(),
		not: z
			.union([z.lazy(() => CurrencyIconLocationSchema), z.lazy(() => NestedEnumCurrencyIconLocationFilterSchema)])
			.optional(),
	})
	.strict();

export const RestrictionNullableCompositeFilterSchema: z.ZodType<Prisma.RestrictionNullableCompositeFilter> = z
	.object({
		equals: z
			.lazy(() => RestrictionObjectEqualityInputSchema)
			.optional()
			.nullable(),
		is: z
			.lazy(() => RestrictionWhereInputSchema)
			.optional()
			.nullable(),
		isNot: z
			.lazy(() => RestrictionWhereInputSchema)
			.optional()
			.nullable(),
		isSet: z.boolean().optional(),
	})
	.strict();

export const EnumRestrictionTypeFilterSchema: z.ZodType<Prisma.EnumRestrictionTypeFilter> = z
	.object({
		equals: z.lazy(() => RestrictionTypeSchema).optional(),
		in: z
			.lazy(() => RestrictionTypeSchema)
			.array()
			.optional(),
		notIn: z
			.lazy(() => RestrictionTypeSchema)
			.array()
			.optional(),
		not: z
			.union([z.lazy(() => RestrictionTypeSchema), z.lazy(() => NestedEnumRestrictionTypeFilterSchema)])
			.optional(),
	})
	.strict();

export const HSLAColorNullableCompositeFilterSchema: z.ZodType<Prisma.HSLAColorNullableCompositeFilter> = z
	.object({
		equals: z
			.lazy(() => HSLAColorObjectEqualityInputSchema)
			.optional()
			.nullable(),
		is: z
			.lazy(() => HSLAColorWhereInputSchema)
			.optional()
			.nullable(),
		isNot: z
			.lazy(() => HSLAColorWhereInputSchema)
			.optional()
			.nullable(),
		isSet: z.boolean().optional(),
	})
	.strict();

export const EnumFontFamilyFilterSchema: z.ZodType<Prisma.EnumFontFamilyFilter> = z
	.object({
		equals: z.lazy(() => FontFamilySchema).optional(),
		in: z
			.lazy(() => FontFamilySchema)
			.array()
			.optional(),
		notIn: z
			.lazy(() => FontFamilySchema)
			.array()
			.optional(),
		not: z.union([z.lazy(() => FontFamilySchema), z.lazy(() => NestedEnumFontFamilyFilterSchema)]).optional(),
	})
	.strict();

export const DiscordEmbedUpdateInputSchema: z.ZodType<Prisma.DiscordEmbedUpdateInput> = z
	.object({
		url: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		title: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		description: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		color: z.union([z.number(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		timestamp: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		footer: z
			.union([
				z.lazy(() => DiscordEmbedFooterUpdateEnvelopeInputSchema),
				z.lazy(() => DiscordEmbedFooterCreateInputSchema),
			])
			.optional(),
		image: z
			.union([
				z.lazy(() => DiscordEmbedImageUpdateEnvelopeInputSchema),
				z.lazy(() => DiscordEmbedImageCreateInputSchema),
			])
			.optional(),
		thumbnail: z
			.union([
				z.lazy(() => DiscordEmbedThumbnailUpdateEnvelopeInputSchema),
				z.lazy(() => DiscordEmbedThumbnailCreateInputSchema),
			])
			.optional(),
		author: z
			.union([
				z.lazy(() => DiscordEmbedAuthorUpdateEnvelopeInputSchema),
				z.lazy(() => DiscordEmbedAuthorCreateInputSchema),
			])
			.optional(),
		fields: z
			.union([
				z.lazy(() => DiscordEmbedFieldListUpdateEnvelopeInputSchema),
				z.lazy(() => DiscordEmbedFieldCreateInputSchema),
				z.lazy(() => DiscordEmbedFieldCreateInputSchema).array(),
			])
			.optional(),
	})
	.strict();

export const RewardCreaterolesInputSchema: z.ZodType<Prisma.RewardCreaterolesInput> = z
	.object({
		set: z.string().array(),
	})
	.strict();

export const ExpBoostListUpdateEnvelopeInputSchema: z.ZodType<Prisma.ExpBoostListUpdateEnvelopeInput> = z
	.object({
		set: z
			.union([z.lazy(() => ExpBoostCreateInputSchema), z.lazy(() => ExpBoostCreateInputSchema).array()])
			.optional(),
		push: z
			.union([z.lazy(() => ExpBoostCreateInputSchema), z.lazy(() => ExpBoostCreateInputSchema).array()])
			.optional(),
		updateMany: z.lazy(() => ExpBoostUpdateManyInputSchema).optional(),
		deleteMany: z.lazy(() => ExpBoostDeleteManyInputSchema).optional(),
	})
	.strict();

export const EnumDestinationFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumDestinationFieldUpdateOperationsInput> =
	z
		.object({
			set: z.lazy(() => DestinationSchema).optional(),
		})
		.strict();

export const EnumMessageTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumMessageTypeFieldUpdateOperationsInput> =
	z
		.object({
			set: z.lazy(() => MessageTypeSchema).optional(),
		})
		.strict();

export const RewardListUpdateEnvelopeInputSchema: z.ZodType<Prisma.RewardListUpdateEnvelopeInput> = z
	.object({
		set: z.union([z.lazy(() => RewardCreateInputSchema), z.lazy(() => RewardCreateInputSchema).array()]).optional(),
		push: z
			.union([z.lazy(() => RewardCreateInputSchema), z.lazy(() => RewardCreateInputSchema).array()])
			.optional(),
		updateMany: z.lazy(() => RewardUpdateManyInputSchema).optional(),
		deleteMany: z.lazy(() => RewardDeleteManyInputSchema).optional(),
	})
	.strict();

export const EnumCurrencyIconLocationFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumCurrencyIconLocationFieldUpdateOperationsInput> =
	z
		.object({
			set: z.lazy(() => CurrencyIconLocationSchema).optional(),
		})
		.strict();

export const RestrictionNullableUpdateEnvelopeInputSchema: z.ZodType<Prisma.RestrictionNullableUpdateEnvelopeInput> = z
	.object({
		set: z
			.lazy(() => RestrictionCreateInputSchema)
			.optional()
			.nullable(),
		upsert: z.lazy(() => RestrictionUpsertInputSchema).optional(),
		unset: z.boolean().optional(),
	})
	.strict();

export const EnumRestrictionTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumRestrictionTypeFieldUpdateOperationsInput> =
	z
		.object({
			set: z.lazy(() => RestrictionTypeSchema).optional(),
		})
		.strict();

export const RestrictionUpdateomitInputSchema: z.ZodType<Prisma.RestrictionUpdateomitInput> = z
	.object({
		set: z.string().array().optional(),
		push: z.union([z.string(), z.string().array()]).optional(),
	})
	.strict();

export const ReactionRolePairUpdateInputSchema: z.ZodType<Prisma.ReactionRolePairUpdateInput> = z
	.object({
		emoji: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		roles: z.union([z.lazy(() => ReactionRolePairUpdaterolesInputSchema), z.string().array()]).optional(),
	})
	.strict();

export const ItemDataUpdateInputSchema: z.ZodType<Prisma.ItemDataUpdateInput> = z
	.object({
		roles: z.union([z.lazy(() => ItemDataUpdaterolesInputSchema), z.string().array()]).optional(),
		badge: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		script: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
	})
	.strict();

export const PurchaseResponseUpdateInputSchema: z.ZodType<Prisma.PurchaseResponseUpdateInput> = z
	.object({
		channel: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		content: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
	})
	.strict();

export const PurchaseRequiresUpdateInputSchema: z.ZodType<Prisma.PurchaseRequiresUpdateInput> = z
	.object({
		level: z
			.union([z.number(), z.lazy(() => NullableIntFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		roles: z.union([z.lazy(() => PurchaseRequiresUpdaterolesInputSchema), z.string().array()]).optional(),
	})
	.strict();

export const HSLAColorNullableUpdateEnvelopeInputSchema: z.ZodType<Prisma.HSLAColorNullableUpdateEnvelopeInput> = z
	.object({
		set: z
			.lazy(() => HSLAColorCreateInputSchema)
			.optional()
			.nullable(),
		upsert: z.lazy(() => HSLAColorUpsertInputSchema).optional(),
		unset: z.boolean().optional(),
	})
	.strict();

export const EnumFontFamilyFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumFontFamilyFieldUpdateOperationsInput> =
	z
		.object({
			set: z.lazy(() => FontFamilySchema).optional(),
		})
		.strict();

export const BadgeUpdateInputSchema: z.ZodType<Prisma.BadgeUpdateInput> = z
	.object({
		itemId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		active: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
		slot: z.union([z.number(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
	})
	.strict();

export const InventoryItemUpdateInputSchema: z.ZodType<Prisma.InventoryItemUpdateInput> = z
	.object({
		itemId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		amount: z.union([z.number(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
	})
	.strict();

export const DiscordEmbedFooterWhereInputSchema: z.ZodType<Prisma.DiscordEmbedFooterWhereInput> = z
	.object({
		AND: z
			.union([
				z.lazy(() => DiscordEmbedFooterWhereInputSchema),
				z.lazy(() => DiscordEmbedFooterWhereInputSchema).array(),
			])
			.optional(),
		OR: z
			.lazy(() => DiscordEmbedFooterWhereInputSchema)
			.array()
			.optional(),
		NOT: z
			.union([
				z.lazy(() => DiscordEmbedFooterWhereInputSchema),
				z.lazy(() => DiscordEmbedFooterWhereInputSchema).array(),
			])
			.optional(),
		text: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		icon_url: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
	})
	.strict();

export const DiscordEmbedImageWhereInputSchema: z.ZodType<Prisma.DiscordEmbedImageWhereInput> = z
	.object({
		AND: z
			.union([
				z.lazy(() => DiscordEmbedImageWhereInputSchema),
				z.lazy(() => DiscordEmbedImageWhereInputSchema).array(),
			])
			.optional(),
		OR: z
			.lazy(() => DiscordEmbedImageWhereInputSchema)
			.array()
			.optional(),
		NOT: z
			.union([
				z.lazy(() => DiscordEmbedImageWhereInputSchema),
				z.lazy(() => DiscordEmbedImageWhereInputSchema).array(),
			])
			.optional(),
		url: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
	})
	.strict();

export const DiscordEmbedThumbnailWhereInputSchema: z.ZodType<Prisma.DiscordEmbedThumbnailWhereInput> = z
	.object({
		AND: z
			.union([
				z.lazy(() => DiscordEmbedThumbnailWhereInputSchema),
				z.lazy(() => DiscordEmbedThumbnailWhereInputSchema).array(),
			])
			.optional(),
		OR: z
			.lazy(() => DiscordEmbedThumbnailWhereInputSchema)
			.array()
			.optional(),
		NOT: z
			.union([
				z.lazy(() => DiscordEmbedThumbnailWhereInputSchema),
				z.lazy(() => DiscordEmbedThumbnailWhereInputSchema).array(),
			])
			.optional(),
		url: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
	})
	.strict();

export const DiscordEmbedAuthorWhereInputSchema: z.ZodType<Prisma.DiscordEmbedAuthorWhereInput> = z
	.object({
		AND: z
			.union([
				z.lazy(() => DiscordEmbedAuthorWhereInputSchema),
				z.lazy(() => DiscordEmbedAuthorWhereInputSchema).array(),
			])
			.optional(),
		OR: z
			.lazy(() => DiscordEmbedAuthorWhereInputSchema)
			.array()
			.optional(),
		NOT: z
			.union([
				z.lazy(() => DiscordEmbedAuthorWhereInputSchema),
				z.lazy(() => DiscordEmbedAuthorWhereInputSchema).array(),
			])
			.optional(),
		name: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		url: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		icon_url: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
	})
	.strict();

export const DiscordEmbedFieldWhereInputSchema: z.ZodType<Prisma.DiscordEmbedFieldWhereInput> = z
	.object({
		AND: z
			.union([
				z.lazy(() => DiscordEmbedFieldWhereInputSchema),
				z.lazy(() => DiscordEmbedFieldWhereInputSchema).array(),
			])
			.optional(),
		OR: z
			.lazy(() => DiscordEmbedFieldWhereInputSchema)
			.array()
			.optional(),
		NOT: z
			.union([
				z.lazy(() => DiscordEmbedFieldWhereInputSchema),
				z.lazy(() => DiscordEmbedFieldWhereInputSchema).array(),
			])
			.optional(),
		name: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		value: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		inline: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
	})
	.strict();

export const ExpBoostWhereInputSchema: z.ZodType<Prisma.ExpBoostWhereInput> = z
	.object({
		AND: z
			.union([z.lazy(() => ExpBoostWhereInputSchema), z.lazy(() => ExpBoostWhereInputSchema).array()])
			.optional(),
		OR: z
			.lazy(() => ExpBoostWhereInputSchema)
			.array()
			.optional(),
		NOT: z
			.union([z.lazy(() => ExpBoostWhereInputSchema), z.lazy(() => ExpBoostWhereInputSchema).array()])
			.optional(),
		type: z.union([z.lazy(() => EnumDiscordEntityFilterSchema), z.lazy(() => DiscordEntitySchema)]).optional(),
		id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		boost: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
	})
	.strict();

export const NestedEnumDestinationFilterSchema: z.ZodType<Prisma.NestedEnumDestinationFilter> = z
	.object({
		equals: z.lazy(() => DestinationSchema).optional(),
		in: z
			.lazy(() => DestinationSchema)
			.array()
			.optional(),
		notIn: z
			.lazy(() => DestinationSchema)
			.array()
			.optional(),
		not: z.union([z.lazy(() => DestinationSchema), z.lazy(() => NestedEnumDestinationFilterSchema)]).optional(),
	})
	.strict();

export const NestedEnumMessageTypeFilterSchema: z.ZodType<Prisma.NestedEnumMessageTypeFilter> = z
	.object({
		equals: z.lazy(() => MessageTypeSchema).optional(),
		in: z
			.lazy(() => MessageTypeSchema)
			.array()
			.optional(),
		notIn: z
			.lazy(() => MessageTypeSchema)
			.array()
			.optional(),
		not: z.union([z.lazy(() => MessageTypeSchema), z.lazy(() => NestedEnumMessageTypeFilterSchema)]).optional(),
	})
	.strict();

export const RewardWhereInputSchema: z.ZodType<Prisma.RewardWhereInput> = z
	.object({
		AND: z.union([z.lazy(() => RewardWhereInputSchema), z.lazy(() => RewardWhereInputSchema).array()]).optional(),
		OR: z
			.lazy(() => RewardWhereInputSchema)
			.array()
			.optional(),
		NOT: z.union([z.lazy(() => RewardWhereInputSchema), z.lazy(() => RewardWhereInputSchema).array()]).optional(),
		level: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
		roles: z.lazy(() => StringNullableListFilterSchema).optional(),
	})
	.strict();

export const NestedEnumCurrencyIconLocationFilterSchema: z.ZodType<Prisma.NestedEnumCurrencyIconLocationFilter> = z
	.object({
		equals: z.lazy(() => CurrencyIconLocationSchema).optional(),
		in: z
			.lazy(() => CurrencyIconLocationSchema)
			.array()
			.optional(),
		notIn: z
			.lazy(() => CurrencyIconLocationSchema)
			.array()
			.optional(),
		not: z
			.union([z.lazy(() => CurrencyIconLocationSchema), z.lazy(() => NestedEnumCurrencyIconLocationFilterSchema)])
			.optional(),
	})
	.strict();

export const NestedEnumRestrictionTypeFilterSchema: z.ZodType<Prisma.NestedEnumRestrictionTypeFilter> = z
	.object({
		equals: z.lazy(() => RestrictionTypeSchema).optional(),
		in: z
			.lazy(() => RestrictionTypeSchema)
			.array()
			.optional(),
		notIn: z
			.lazy(() => RestrictionTypeSchema)
			.array()
			.optional(),
		not: z
			.union([z.lazy(() => RestrictionTypeSchema), z.lazy(() => NestedEnumRestrictionTypeFilterSchema)])
			.optional(),
	})
	.strict();

export const HSLAColorWhereInputSchema: z.ZodType<Prisma.HSLAColorWhereInput> = z
	.object({
		AND: z
			.union([z.lazy(() => HSLAColorWhereInputSchema), z.lazy(() => HSLAColorWhereInputSchema).array()])
			.optional(),
		OR: z
			.lazy(() => HSLAColorWhereInputSchema)
			.array()
			.optional(),
		NOT: z
			.union([z.lazy(() => HSLAColorWhereInputSchema), z.lazy(() => HSLAColorWhereInputSchema).array()])
			.optional(),
		h: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
		s: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
		l: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
		a: z.union([z.lazy(() => FloatFilterSchema), z.number()]).optional(),
	})
	.strict();

export const NestedEnumFontFamilyFilterSchema: z.ZodType<Prisma.NestedEnumFontFamilyFilter> = z
	.object({
		equals: z.lazy(() => FontFamilySchema).optional(),
		in: z
			.lazy(() => FontFamilySchema)
			.array()
			.optional(),
		notIn: z
			.lazy(() => FontFamilySchema)
			.array()
			.optional(),
		not: z.union([z.lazy(() => FontFamilySchema), z.lazy(() => NestedEnumFontFamilyFilterSchema)]).optional(),
	})
	.strict();

export const DiscordEmbedFooterUpdateEnvelopeInputSchema: z.ZodType<Prisma.DiscordEmbedFooterUpdateEnvelopeInput> = z
	.object({
		set: z.lazy(() => DiscordEmbedFooterCreateInputSchema).optional(),
		update: z.lazy(() => DiscordEmbedFooterUpdateInputSchema).optional(),
	})
	.strict();

export const DiscordEmbedImageUpdateEnvelopeInputSchema: z.ZodType<Prisma.DiscordEmbedImageUpdateEnvelopeInput> = z
	.object({
		set: z.lazy(() => DiscordEmbedImageCreateInputSchema).optional(),
		update: z.lazy(() => DiscordEmbedImageUpdateInputSchema).optional(),
	})
	.strict();

export const DiscordEmbedThumbnailUpdateEnvelopeInputSchema: z.ZodType<Prisma.DiscordEmbedThumbnailUpdateEnvelopeInput> =
	z
		.object({
			set: z.lazy(() => DiscordEmbedThumbnailCreateInputSchema).optional(),
			update: z.lazy(() => DiscordEmbedThumbnailUpdateInputSchema).optional(),
		})
		.strict();

export const DiscordEmbedAuthorUpdateEnvelopeInputSchema: z.ZodType<Prisma.DiscordEmbedAuthorUpdateEnvelopeInput> = z
	.object({
		set: z.lazy(() => DiscordEmbedAuthorCreateInputSchema).optional(),
		update: z.lazy(() => DiscordEmbedAuthorUpdateInputSchema).optional(),
	})
	.strict();

export const DiscordEmbedFieldListUpdateEnvelopeInputSchema: z.ZodType<Prisma.DiscordEmbedFieldListUpdateEnvelopeInput> =
	z
		.object({
			set: z
				.union([
					z.lazy(() => DiscordEmbedFieldCreateInputSchema),
					z.lazy(() => DiscordEmbedFieldCreateInputSchema).array(),
				])
				.optional(),
			push: z
				.union([
					z.lazy(() => DiscordEmbedFieldCreateInputSchema),
					z.lazy(() => DiscordEmbedFieldCreateInputSchema).array(),
				])
				.optional(),
			updateMany: z.lazy(() => DiscordEmbedFieldUpdateManyInputSchema).optional(),
			deleteMany: z.lazy(() => DiscordEmbedFieldDeleteManyInputSchema).optional(),
		})
		.strict();

export const ExpBoostUpdateManyInputSchema: z.ZodType<Prisma.ExpBoostUpdateManyInput> = z
	.object({
		where: z.lazy(() => ExpBoostWhereInputSchema),
		data: z.lazy(() => ExpBoostUpdateInputSchema),
	})
	.strict();

export const ExpBoostDeleteManyInputSchema: z.ZodType<Prisma.ExpBoostDeleteManyInput> = z
	.object({
		where: z.lazy(() => ExpBoostWhereInputSchema),
	})
	.strict();

export const RewardUpdateManyInputSchema: z.ZodType<Prisma.RewardUpdateManyInput> = z
	.object({
		where: z.lazy(() => RewardWhereInputSchema),
		data: z.lazy(() => RewardUpdateInputSchema),
	})
	.strict();

export const RewardDeleteManyInputSchema: z.ZodType<Prisma.RewardDeleteManyInput> = z
	.object({
		where: z.lazy(() => RewardWhereInputSchema),
	})
	.strict();

export const RestrictionUpsertInputSchema: z.ZodType<Prisma.RestrictionUpsertInput> = z
	.object({
		set: z.lazy(() => RestrictionCreateInputSchema).nullable(),
		update: z.lazy(() => RestrictionUpdateInputSchema),
	})
	.strict();

export const ReactionRolePairUpdaterolesInputSchema: z.ZodType<Prisma.ReactionRolePairUpdaterolesInput> = z
	.object({
		set: z.string().array().optional(),
		push: z.union([z.string(), z.string().array()]).optional(),
	})
	.strict();

export const ItemDataUpdaterolesInputSchema: z.ZodType<Prisma.ItemDataUpdaterolesInput> = z
	.object({
		set: z.string().array().optional(),
		push: z.union([z.string(), z.string().array()]).optional(),
	})
	.strict();

export const PurchaseRequiresUpdaterolesInputSchema: z.ZodType<Prisma.PurchaseRequiresUpdaterolesInput> = z
	.object({
		set: z.string().array().optional(),
		push: z.union([z.string(), z.string().array()]).optional(),
	})
	.strict();

export const HSLAColorUpsertInputSchema: z.ZodType<Prisma.HSLAColorUpsertInput> = z
	.object({
		set: z.lazy(() => HSLAColorCreateInputSchema).nullable(),
		update: z.lazy(() => HSLAColorUpdateInputSchema),
	})
	.strict();

export const EnumDiscordEntityFilterSchema: z.ZodType<Prisma.EnumDiscordEntityFilter> = z
	.object({
		equals: z.lazy(() => DiscordEntitySchema).optional(),
		in: z
			.lazy(() => DiscordEntitySchema)
			.array()
			.optional(),
		notIn: z
			.lazy(() => DiscordEntitySchema)
			.array()
			.optional(),
		not: z.union([z.lazy(() => DiscordEntitySchema), z.lazy(() => NestedEnumDiscordEntityFilterSchema)]).optional(),
	})
	.strict();

export const FloatFilterSchema: z.ZodType<Prisma.FloatFilter> = z
	.object({
		equals: z.number().optional(),
		in: z.number().array().optional(),
		notIn: z.number().array().optional(),
		lt: z.number().optional(),
		lte: z.number().optional(),
		gt: z.number().optional(),
		gte: z.number().optional(),
		not: z.union([z.number(), z.lazy(() => NestedFloatFilterSchema)]).optional(),
	})
	.strict();

export const DiscordEmbedFooterUpdateInputSchema: z.ZodType<Prisma.DiscordEmbedFooterUpdateInput> = z
	.object({
		text: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		icon_url: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
	})
	.strict();

export const DiscordEmbedImageUpdateInputSchema: z.ZodType<Prisma.DiscordEmbedImageUpdateInput> = z
	.object({
		url: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
	})
	.strict();

export const DiscordEmbedThumbnailUpdateInputSchema: z.ZodType<Prisma.DiscordEmbedThumbnailUpdateInput> = z
	.object({
		url: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
	})
	.strict();

export const DiscordEmbedAuthorUpdateInputSchema: z.ZodType<Prisma.DiscordEmbedAuthorUpdateInput> = z
	.object({
		name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		url: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		icon_url: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
	})
	.strict();

export const DiscordEmbedFieldUpdateManyInputSchema: z.ZodType<Prisma.DiscordEmbedFieldUpdateManyInput> = z
	.object({
		where: z.lazy(() => DiscordEmbedFieldWhereInputSchema),
		data: z.lazy(() => DiscordEmbedFieldUpdateInputSchema),
	})
	.strict();

export const DiscordEmbedFieldDeleteManyInputSchema: z.ZodType<Prisma.DiscordEmbedFieldDeleteManyInput> = z
	.object({
		where: z.lazy(() => DiscordEmbedFieldWhereInputSchema),
	})
	.strict();

export const ExpBoostUpdateInputSchema: z.ZodType<Prisma.ExpBoostUpdateInput> = z
	.object({
		type: z
			.union([z.lazy(() => DiscordEntitySchema), z.lazy(() => EnumDiscordEntityFieldUpdateOperationsInputSchema)])
			.optional(),
		id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		boost: z.union([z.number(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
	})
	.strict();

export const RewardUpdateInputSchema: z.ZodType<Prisma.RewardUpdateInput> = z
	.object({
		level: z.union([z.number(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		roles: z.union([z.lazy(() => RewardUpdaterolesInputSchema), z.string().array()]).optional(),
	})
	.strict();

export const HSLAColorUpdateInputSchema: z.ZodType<Prisma.HSLAColorUpdateInput> = z
	.object({
		h: z.union([z.number(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		s: z.union([z.number(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		l: z.union([z.number(), z.lazy(() => IntFieldUpdateOperationsInputSchema)]).optional(),
		a: z.union([z.number(), z.lazy(() => FloatFieldUpdateOperationsInputSchema)]).optional(),
	})
	.strict();

export const NestedEnumDiscordEntityFilterSchema: z.ZodType<Prisma.NestedEnumDiscordEntityFilter> = z
	.object({
		equals: z.lazy(() => DiscordEntitySchema).optional(),
		in: z
			.lazy(() => DiscordEntitySchema)
			.array()
			.optional(),
		notIn: z
			.lazy(() => DiscordEntitySchema)
			.array()
			.optional(),
		not: z.union([z.lazy(() => DiscordEntitySchema), z.lazy(() => NestedEnumDiscordEntityFilterSchema)]).optional(),
	})
	.strict();

export const DiscordEmbedFieldUpdateInputSchema: z.ZodType<Prisma.DiscordEmbedFieldUpdateInput> = z
	.object({
		name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		value: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		inline: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
	})
	.strict();

export const EnumDiscordEntityFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumDiscordEntityFieldUpdateOperationsInput> =
	z
		.object({
			set: z.lazy(() => DiscordEntitySchema).optional(),
		})
		.strict();

export const RewardUpdaterolesInputSchema: z.ZodType<Prisma.RewardUpdaterolesInput> = z
	.object({
		set: z.string().array().optional(),
		push: z.union([z.string(), z.string().array()]).optional(),
	})
	.strict();

export const FloatFieldUpdateOperationsInputSchema: z.ZodType<Prisma.FloatFieldUpdateOperationsInput> = z
	.object({
		set: z.number().optional(),
		increment: z.number().optional(),
		decrement: z.number().optional(),
		multiply: z.number().optional(),
		divide: z.number().optional(),
	})
	.strict();

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const MessageFindFirstArgsSchema: z.ZodType<Prisma.MessageFindFirstArgs> = z
	.object({
		select: MessageSelectSchema.optional(),
		include: MessageIncludeSchema.optional(),
		where: MessageWhereInputSchema.optional(),
		orderBy: z
			.union([MessageOrderByWithRelationInputSchema.array(), MessageOrderByWithRelationInputSchema])
			.optional(),
		cursor: MessageWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
		distinct: z.union([MessageScalarFieldEnumSchema, MessageScalarFieldEnumSchema.array()]).optional(),
	})
	.strict();

export const MessageFindFirstOrThrowArgsSchema: z.ZodType<Prisma.MessageFindFirstOrThrowArgs> = z
	.object({
		select: MessageSelectSchema.optional(),
		include: MessageIncludeSchema.optional(),
		where: MessageWhereInputSchema.optional(),
		orderBy: z
			.union([MessageOrderByWithRelationInputSchema.array(), MessageOrderByWithRelationInputSchema])
			.optional(),
		cursor: MessageWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
		distinct: z.union([MessageScalarFieldEnumSchema, MessageScalarFieldEnumSchema.array()]).optional(),
	})
	.strict();

export const MessageFindManyArgsSchema: z.ZodType<Prisma.MessageFindManyArgs> = z
	.object({
		select: MessageSelectSchema.optional(),
		include: MessageIncludeSchema.optional(),
		where: MessageWhereInputSchema.optional(),
		orderBy: z
			.union([MessageOrderByWithRelationInputSchema.array(), MessageOrderByWithRelationInputSchema])
			.optional(),
		cursor: MessageWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
		distinct: z.union([MessageScalarFieldEnumSchema, MessageScalarFieldEnumSchema.array()]).optional(),
	})
	.strict();

export const MessageAggregateArgsSchema: z.ZodType<Prisma.MessageAggregateArgs> = z
	.object({
		where: MessageWhereInputSchema.optional(),
		orderBy: z
			.union([MessageOrderByWithRelationInputSchema.array(), MessageOrderByWithRelationInputSchema])
			.optional(),
		cursor: MessageWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
	})
	.strict();

export const MessageGroupByArgsSchema: z.ZodType<Prisma.MessageGroupByArgs> = z
	.object({
		where: MessageWhereInputSchema.optional(),
		orderBy: z
			.union([MessageOrderByWithAggregationInputSchema.array(), MessageOrderByWithAggregationInputSchema])
			.optional(),
		by: MessageScalarFieldEnumSchema.array(),
		having: MessageScalarWhereWithAggregatesInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
	})
	.strict();

export const MessageFindUniqueArgsSchema: z.ZodType<Prisma.MessageFindUniqueArgs> = z
	.object({
		select: MessageSelectSchema.optional(),
		include: MessageIncludeSchema.optional(),
		where: MessageWhereUniqueInputSchema,
	})
	.strict();

export const MessageFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.MessageFindUniqueOrThrowArgs> = z
	.object({
		select: MessageSelectSchema.optional(),
		include: MessageIncludeSchema.optional(),
		where: MessageWhereUniqueInputSchema,
	})
	.strict();

export const GuildFindFirstArgsSchema: z.ZodType<Prisma.GuildFindFirstArgs> = z
	.object({
		select: GuildSelectSchema.optional(),
		include: GuildIncludeSchema.optional(),
		where: GuildWhereInputSchema.optional(),
		orderBy: z.union([GuildOrderByWithRelationInputSchema.array(), GuildOrderByWithRelationInputSchema]).optional(),
		cursor: GuildWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
		distinct: z.union([GuildScalarFieldEnumSchema, GuildScalarFieldEnumSchema.array()]).optional(),
	})
	.strict();

export const GuildFindFirstOrThrowArgsSchema: z.ZodType<Prisma.GuildFindFirstOrThrowArgs> = z
	.object({
		select: GuildSelectSchema.optional(),
		include: GuildIncludeSchema.optional(),
		where: GuildWhereInputSchema.optional(),
		orderBy: z.union([GuildOrderByWithRelationInputSchema.array(), GuildOrderByWithRelationInputSchema]).optional(),
		cursor: GuildWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
		distinct: z.union([GuildScalarFieldEnumSchema, GuildScalarFieldEnumSchema.array()]).optional(),
	})
	.strict();

export const GuildFindManyArgsSchema: z.ZodType<Prisma.GuildFindManyArgs> = z
	.object({
		select: GuildSelectSchema.optional(),
		include: GuildIncludeSchema.optional(),
		where: GuildWhereInputSchema.optional(),
		orderBy: z.union([GuildOrderByWithRelationInputSchema.array(), GuildOrderByWithRelationInputSchema]).optional(),
		cursor: GuildWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
		distinct: z.union([GuildScalarFieldEnumSchema, GuildScalarFieldEnumSchema.array()]).optional(),
	})
	.strict();

export const GuildAggregateArgsSchema: z.ZodType<Prisma.GuildAggregateArgs> = z
	.object({
		where: GuildWhereInputSchema.optional(),
		orderBy: z.union([GuildOrderByWithRelationInputSchema.array(), GuildOrderByWithRelationInputSchema]).optional(),
		cursor: GuildWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
	})
	.strict();

export const GuildGroupByArgsSchema: z.ZodType<Prisma.GuildGroupByArgs> = z
	.object({
		where: GuildWhereInputSchema.optional(),
		orderBy: z
			.union([GuildOrderByWithAggregationInputSchema.array(), GuildOrderByWithAggregationInputSchema])
			.optional(),
		by: GuildScalarFieldEnumSchema.array(),
		having: GuildScalarWhereWithAggregatesInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
	})
	.strict();

export const GuildFindUniqueArgsSchema: z.ZodType<Prisma.GuildFindUniqueArgs> = z
	.object({
		select: GuildSelectSchema.optional(),
		include: GuildIncludeSchema.optional(),
		where: GuildWhereUniqueInputSchema,
	})
	.strict();

export const GuildFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.GuildFindUniqueOrThrowArgs> = z
	.object({
		select: GuildSelectSchema.optional(),
		include: GuildIncludeSchema.optional(),
		where: GuildWhereUniqueInputSchema,
	})
	.strict();

export const ReactionRoleFindFirstArgsSchema: z.ZodType<Prisma.ReactionRoleFindFirstArgs> = z
	.object({
		select: ReactionRoleSelectSchema.optional(),
		include: ReactionRoleIncludeSchema.optional(),
		where: ReactionRoleWhereInputSchema.optional(),
		orderBy: z
			.union([ReactionRoleOrderByWithRelationInputSchema.array(), ReactionRoleOrderByWithRelationInputSchema])
			.optional(),
		cursor: ReactionRoleWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
		distinct: z.union([ReactionRoleScalarFieldEnumSchema, ReactionRoleScalarFieldEnumSchema.array()]).optional(),
	})
	.strict();

export const ReactionRoleFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ReactionRoleFindFirstOrThrowArgs> = z
	.object({
		select: ReactionRoleSelectSchema.optional(),
		include: ReactionRoleIncludeSchema.optional(),
		where: ReactionRoleWhereInputSchema.optional(),
		orderBy: z
			.union([ReactionRoleOrderByWithRelationInputSchema.array(), ReactionRoleOrderByWithRelationInputSchema])
			.optional(),
		cursor: ReactionRoleWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
		distinct: z.union([ReactionRoleScalarFieldEnumSchema, ReactionRoleScalarFieldEnumSchema.array()]).optional(),
	})
	.strict();

export const ReactionRoleFindManyArgsSchema: z.ZodType<Prisma.ReactionRoleFindManyArgs> = z
	.object({
		select: ReactionRoleSelectSchema.optional(),
		include: ReactionRoleIncludeSchema.optional(),
		where: ReactionRoleWhereInputSchema.optional(),
		orderBy: z
			.union([ReactionRoleOrderByWithRelationInputSchema.array(), ReactionRoleOrderByWithRelationInputSchema])
			.optional(),
		cursor: ReactionRoleWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
		distinct: z.union([ReactionRoleScalarFieldEnumSchema, ReactionRoleScalarFieldEnumSchema.array()]).optional(),
	})
	.strict();

export const ReactionRoleAggregateArgsSchema: z.ZodType<Prisma.ReactionRoleAggregateArgs> = z
	.object({
		where: ReactionRoleWhereInputSchema.optional(),
		orderBy: z
			.union([ReactionRoleOrderByWithRelationInputSchema.array(), ReactionRoleOrderByWithRelationInputSchema])
			.optional(),
		cursor: ReactionRoleWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
	})
	.strict();

export const ReactionRoleGroupByArgsSchema: z.ZodType<Prisma.ReactionRoleGroupByArgs> = z
	.object({
		where: ReactionRoleWhereInputSchema.optional(),
		orderBy: z
			.union([
				ReactionRoleOrderByWithAggregationInputSchema.array(),
				ReactionRoleOrderByWithAggregationInputSchema,
			])
			.optional(),
		by: ReactionRoleScalarFieldEnumSchema.array(),
		having: ReactionRoleScalarWhereWithAggregatesInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
	})
	.strict();

export const ReactionRoleFindUniqueArgsSchema: z.ZodType<Prisma.ReactionRoleFindUniqueArgs> = z
	.object({
		select: ReactionRoleSelectSchema.optional(),
		include: ReactionRoleIncludeSchema.optional(),
		where: ReactionRoleWhereUniqueInputSchema,
	})
	.strict();

export const ReactionRoleFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.ReactionRoleFindUniqueOrThrowArgs> = z
	.object({
		select: ReactionRoleSelectSchema.optional(),
		include: ReactionRoleIncludeSchema.optional(),
		where: ReactionRoleWhereUniqueInputSchema,
	})
	.strict();

export const StarFindFirstArgsSchema: z.ZodType<Prisma.StarFindFirstArgs> = z
	.object({
		select: StarSelectSchema.optional(),
		where: StarWhereInputSchema.optional(),
		orderBy: z.union([StarOrderByWithRelationInputSchema.array(), StarOrderByWithRelationInputSchema]).optional(),
		cursor: StarWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
		distinct: z.union([StarScalarFieldEnumSchema, StarScalarFieldEnumSchema.array()]).optional(),
	})
	.strict();

export const StarFindFirstOrThrowArgsSchema: z.ZodType<Prisma.StarFindFirstOrThrowArgs> = z
	.object({
		select: StarSelectSchema.optional(),
		where: StarWhereInputSchema.optional(),
		orderBy: z.union([StarOrderByWithRelationInputSchema.array(), StarOrderByWithRelationInputSchema]).optional(),
		cursor: StarWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
		distinct: z.union([StarScalarFieldEnumSchema, StarScalarFieldEnumSchema.array()]).optional(),
	})
	.strict();

export const StarFindManyArgsSchema: z.ZodType<Prisma.StarFindManyArgs> = z
	.object({
		select: StarSelectSchema.optional(),
		where: StarWhereInputSchema.optional(),
		orderBy: z.union([StarOrderByWithRelationInputSchema.array(), StarOrderByWithRelationInputSchema]).optional(),
		cursor: StarWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
		distinct: z.union([StarScalarFieldEnumSchema, StarScalarFieldEnumSchema.array()]).optional(),
	})
	.strict();

export const StarAggregateArgsSchema: z.ZodType<Prisma.StarAggregateArgs> = z
	.object({
		where: StarWhereInputSchema.optional(),
		orderBy: z.union([StarOrderByWithRelationInputSchema.array(), StarOrderByWithRelationInputSchema]).optional(),
		cursor: StarWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
	})
	.strict();

export const StarGroupByArgsSchema: z.ZodType<Prisma.StarGroupByArgs> = z
	.object({
		where: StarWhereInputSchema.optional(),
		orderBy: z
			.union([StarOrderByWithAggregationInputSchema.array(), StarOrderByWithAggregationInputSchema])
			.optional(),
		by: StarScalarFieldEnumSchema.array(),
		having: StarScalarWhereWithAggregatesInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
	})
	.strict();

export const StarFindUniqueArgsSchema: z.ZodType<Prisma.StarFindUniqueArgs> = z
	.object({
		select: StarSelectSchema.optional(),
		where: StarWhereUniqueInputSchema,
	})
	.strict();

export const StarFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.StarFindUniqueOrThrowArgs> = z
	.object({
		select: StarSelectSchema.optional(),
		where: StarWhereUniqueInputSchema,
	})
	.strict();

export const ItemFindFirstArgsSchema: z.ZodType<Prisma.ItemFindFirstArgs> = z
	.object({
		select: ItemSelectSchema.optional(),
		include: ItemIncludeSchema.optional(),
		where: ItemWhereInputSchema.optional(),
		orderBy: z.union([ItemOrderByWithRelationInputSchema.array(), ItemOrderByWithRelationInputSchema]).optional(),
		cursor: ItemWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
		distinct: z.union([ItemScalarFieldEnumSchema, ItemScalarFieldEnumSchema.array()]).optional(),
	})
	.strict();

export const ItemFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ItemFindFirstOrThrowArgs> = z
	.object({
		select: ItemSelectSchema.optional(),
		include: ItemIncludeSchema.optional(),
		where: ItemWhereInputSchema.optional(),
		orderBy: z.union([ItemOrderByWithRelationInputSchema.array(), ItemOrderByWithRelationInputSchema]).optional(),
		cursor: ItemWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
		distinct: z.union([ItemScalarFieldEnumSchema, ItemScalarFieldEnumSchema.array()]).optional(),
	})
	.strict();

export const ItemFindManyArgsSchema: z.ZodType<Prisma.ItemFindManyArgs> = z
	.object({
		select: ItemSelectSchema.optional(),
		include: ItemIncludeSchema.optional(),
		where: ItemWhereInputSchema.optional(),
		orderBy: z.union([ItemOrderByWithRelationInputSchema.array(), ItemOrderByWithRelationInputSchema]).optional(),
		cursor: ItemWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
		distinct: z.union([ItemScalarFieldEnumSchema, ItemScalarFieldEnumSchema.array()]).optional(),
	})
	.strict();

export const ItemAggregateArgsSchema: z.ZodType<Prisma.ItemAggregateArgs> = z
	.object({
		where: ItemWhereInputSchema.optional(),
		orderBy: z.union([ItemOrderByWithRelationInputSchema.array(), ItemOrderByWithRelationInputSchema]).optional(),
		cursor: ItemWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
	})
	.strict();

export const ItemGroupByArgsSchema: z.ZodType<Prisma.ItemGroupByArgs> = z
	.object({
		where: ItemWhereInputSchema.optional(),
		orderBy: z
			.union([ItemOrderByWithAggregationInputSchema.array(), ItemOrderByWithAggregationInputSchema])
			.optional(),
		by: ItemScalarFieldEnumSchema.array(),
		having: ItemScalarWhereWithAggregatesInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
	})
	.strict();

export const ItemFindUniqueArgsSchema: z.ZodType<Prisma.ItemFindUniqueArgs> = z
	.object({
		select: ItemSelectSchema.optional(),
		include: ItemIncludeSchema.optional(),
		where: ItemWhereUniqueInputSchema,
	})
	.strict();

export const ItemFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.ItemFindUniqueOrThrowArgs> = z
	.object({
		select: ItemSelectSchema.optional(),
		include: ItemIncludeSchema.optional(),
		where: ItemWhereUniqueInputSchema,
	})
	.strict();

export const UserFindFirstArgsSchema: z.ZodType<Prisma.UserFindFirstArgs> = z
	.object({
		select: UserSelectSchema.optional(),
		where: UserWhereInputSchema.optional(),
		orderBy: z.union([UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema]).optional(),
		cursor: UserWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
		distinct: z.union([UserScalarFieldEnumSchema, UserScalarFieldEnumSchema.array()]).optional(),
	})
	.strict();

export const UserFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserFindFirstOrThrowArgs> = z
	.object({
		select: UserSelectSchema.optional(),
		where: UserWhereInputSchema.optional(),
		orderBy: z.union([UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema]).optional(),
		cursor: UserWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
		distinct: z.union([UserScalarFieldEnumSchema, UserScalarFieldEnumSchema.array()]).optional(),
	})
	.strict();

export const UserFindManyArgsSchema: z.ZodType<Prisma.UserFindManyArgs> = z
	.object({
		select: UserSelectSchema.optional(),
		where: UserWhereInputSchema.optional(),
		orderBy: z.union([UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema]).optional(),
		cursor: UserWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
		distinct: z.union([UserScalarFieldEnumSchema, UserScalarFieldEnumSchema.array()]).optional(),
	})
	.strict();

export const UserAggregateArgsSchema: z.ZodType<Prisma.UserAggregateArgs> = z
	.object({
		where: UserWhereInputSchema.optional(),
		orderBy: z.union([UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema]).optional(),
		cursor: UserWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
	})
	.strict();

export const UserGroupByArgsSchema: z.ZodType<Prisma.UserGroupByArgs> = z
	.object({
		where: UserWhereInputSchema.optional(),
		orderBy: z
			.union([UserOrderByWithAggregationInputSchema.array(), UserOrderByWithAggregationInputSchema])
			.optional(),
		by: UserScalarFieldEnumSchema.array(),
		having: UserScalarWhereWithAggregatesInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
	})
	.strict();

export const UserFindUniqueArgsSchema: z.ZodType<Prisma.UserFindUniqueArgs> = z
	.object({
		select: UserSelectSchema.optional(),
		where: UserWhereUniqueInputSchema,
	})
	.strict();

export const UserFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserFindUniqueOrThrowArgs> = z
	.object({
		select: UserSelectSchema.optional(),
		where: UserWhereUniqueInputSchema,
	})
	.strict();

export const MemberFindFirstArgsSchema: z.ZodType<Prisma.MemberFindFirstArgs> = z
	.object({
		select: MemberSelectSchema.optional(),
		include: MemberIncludeSchema.optional(),
		where: MemberWhereInputSchema.optional(),
		orderBy: z
			.union([MemberOrderByWithRelationInputSchema.array(), MemberOrderByWithRelationInputSchema])
			.optional(),
		cursor: MemberWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
		distinct: z.union([MemberScalarFieldEnumSchema, MemberScalarFieldEnumSchema.array()]).optional(),
	})
	.strict();

export const MemberFindFirstOrThrowArgsSchema: z.ZodType<Prisma.MemberFindFirstOrThrowArgs> = z
	.object({
		select: MemberSelectSchema.optional(),
		include: MemberIncludeSchema.optional(),
		where: MemberWhereInputSchema.optional(),
		orderBy: z
			.union([MemberOrderByWithRelationInputSchema.array(), MemberOrderByWithRelationInputSchema])
			.optional(),
		cursor: MemberWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
		distinct: z.union([MemberScalarFieldEnumSchema, MemberScalarFieldEnumSchema.array()]).optional(),
	})
	.strict();

export const MemberFindManyArgsSchema: z.ZodType<Prisma.MemberFindManyArgs> = z
	.object({
		select: MemberSelectSchema.optional(),
		include: MemberIncludeSchema.optional(),
		where: MemberWhereInputSchema.optional(),
		orderBy: z
			.union([MemberOrderByWithRelationInputSchema.array(), MemberOrderByWithRelationInputSchema])
			.optional(),
		cursor: MemberWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
		distinct: z.union([MemberScalarFieldEnumSchema, MemberScalarFieldEnumSchema.array()]).optional(),
	})
	.strict();

export const MemberAggregateArgsSchema: z.ZodType<Prisma.MemberAggregateArgs> = z
	.object({
		where: MemberWhereInputSchema.optional(),
		orderBy: z
			.union([MemberOrderByWithRelationInputSchema.array(), MemberOrderByWithRelationInputSchema])
			.optional(),
		cursor: MemberWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
	})
	.strict();

export const MemberGroupByArgsSchema: z.ZodType<Prisma.MemberGroupByArgs> = z
	.object({
		where: MemberWhereInputSchema.optional(),
		orderBy: z
			.union([MemberOrderByWithAggregationInputSchema.array(), MemberOrderByWithAggregationInputSchema])
			.optional(),
		by: MemberScalarFieldEnumSchema.array(),
		having: MemberScalarWhereWithAggregatesInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
	})
	.strict();

export const MemberFindUniqueArgsSchema: z.ZodType<Prisma.MemberFindUniqueArgs> = z
	.object({
		select: MemberSelectSchema.optional(),
		include: MemberIncludeSchema.optional(),
		where: MemberWhereUniqueInputSchema,
	})
	.strict();

export const MemberFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.MemberFindUniqueOrThrowArgs> = z
	.object({
		select: MemberSelectSchema.optional(),
		include: MemberIncludeSchema.optional(),
		where: MemberWhereUniqueInputSchema,
	})
	.strict();

export const MessageCreateArgsSchema: z.ZodType<Prisma.MessageCreateArgs> = z
	.object({
		select: MessageSelectSchema.optional(),
		include: MessageIncludeSchema.optional(),
		data: z.union([MessageCreateInputSchema, MessageUncheckedCreateInputSchema]),
	})
	.strict();

export const MessageUpsertArgsSchema: z.ZodType<Prisma.MessageUpsertArgs> = z
	.object({
		select: MessageSelectSchema.optional(),
		include: MessageIncludeSchema.optional(),
		where: MessageWhereUniqueInputSchema,
		create: z.union([MessageCreateInputSchema, MessageUncheckedCreateInputSchema]),
		update: z.union([MessageUpdateInputSchema, MessageUncheckedUpdateInputSchema]),
	})
	.strict();

export const MessageCreateManyArgsSchema: z.ZodType<Prisma.MessageCreateManyArgs> = z
	.object({
		data: z.union([MessageCreateManyInputSchema, MessageCreateManyInputSchema.array()]),
	})
	.strict();

export const MessageDeleteArgsSchema: z.ZodType<Prisma.MessageDeleteArgs> = z
	.object({
		select: MessageSelectSchema.optional(),
		include: MessageIncludeSchema.optional(),
		where: MessageWhereUniqueInputSchema,
	})
	.strict();

export const MessageUpdateArgsSchema: z.ZodType<Prisma.MessageUpdateArgs> = z
	.object({
		select: MessageSelectSchema.optional(),
		include: MessageIncludeSchema.optional(),
		data: z.union([MessageUpdateInputSchema, MessageUncheckedUpdateInputSchema]),
		where: MessageWhereUniqueInputSchema,
	})
	.strict();

export const MessageUpdateManyArgsSchema: z.ZodType<Prisma.MessageUpdateManyArgs> = z
	.object({
		data: z.union([MessageUpdateManyMutationInputSchema, MessageUncheckedUpdateManyInputSchema]),
		where: MessageWhereInputSchema.optional(),
		limit: z.number().optional(),
	})
	.strict();

export const MessageDeleteManyArgsSchema: z.ZodType<Prisma.MessageDeleteManyArgs> = z
	.object({
		where: MessageWhereInputSchema.optional(),
		limit: z.number().optional(),
	})
	.strict();

export const GuildCreateArgsSchema: z.ZodType<Prisma.GuildCreateArgs> = z
	.object({
		select: GuildSelectSchema.optional(),
		include: GuildIncludeSchema.optional(),
		data: z.union([GuildCreateInputSchema, GuildUncheckedCreateInputSchema]),
	})
	.strict();

export const GuildUpsertArgsSchema: z.ZodType<Prisma.GuildUpsertArgs> = z
	.object({
		select: GuildSelectSchema.optional(),
		include: GuildIncludeSchema.optional(),
		where: GuildWhereUniqueInputSchema,
		create: z.union([GuildCreateInputSchema, GuildUncheckedCreateInputSchema]),
		update: z.union([GuildUpdateInputSchema, GuildUncheckedUpdateInputSchema]),
	})
	.strict();

export const GuildCreateManyArgsSchema: z.ZodType<Prisma.GuildCreateManyArgs> = z
	.object({
		data: z.union([GuildCreateManyInputSchema, GuildCreateManyInputSchema.array()]),
	})
	.strict();

export const GuildDeleteArgsSchema: z.ZodType<Prisma.GuildDeleteArgs> = z
	.object({
		select: GuildSelectSchema.optional(),
		include: GuildIncludeSchema.optional(),
		where: GuildWhereUniqueInputSchema,
	})
	.strict();

export const GuildUpdateArgsSchema: z.ZodType<Prisma.GuildUpdateArgs> = z
	.object({
		select: GuildSelectSchema.optional(),
		include: GuildIncludeSchema.optional(),
		data: z.union([GuildUpdateInputSchema, GuildUncheckedUpdateInputSchema]),
		where: GuildWhereUniqueInputSchema,
	})
	.strict();

export const GuildUpdateManyArgsSchema: z.ZodType<Prisma.GuildUpdateManyArgs> = z
	.object({
		data: z.union([GuildUpdateManyMutationInputSchema, GuildUncheckedUpdateManyInputSchema]),
		where: GuildWhereInputSchema.optional(),
		limit: z.number().optional(),
	})
	.strict();

export const GuildDeleteManyArgsSchema: z.ZodType<Prisma.GuildDeleteManyArgs> = z
	.object({
		where: GuildWhereInputSchema.optional(),
		limit: z.number().optional(),
	})
	.strict();

export const ReactionRoleCreateArgsSchema: z.ZodType<Prisma.ReactionRoleCreateArgs> = z
	.object({
		select: ReactionRoleSelectSchema.optional(),
		include: ReactionRoleIncludeSchema.optional(),
		data: z.union([ReactionRoleCreateInputSchema, ReactionRoleUncheckedCreateInputSchema]),
	})
	.strict();

export const ReactionRoleUpsertArgsSchema: z.ZodType<Prisma.ReactionRoleUpsertArgs> = z
	.object({
		select: ReactionRoleSelectSchema.optional(),
		include: ReactionRoleIncludeSchema.optional(),
		where: ReactionRoleWhereUniqueInputSchema,
		create: z.union([ReactionRoleCreateInputSchema, ReactionRoleUncheckedCreateInputSchema]),
		update: z.union([ReactionRoleUpdateInputSchema, ReactionRoleUncheckedUpdateInputSchema]),
	})
	.strict();

export const ReactionRoleCreateManyArgsSchema: z.ZodType<Prisma.ReactionRoleCreateManyArgs> = z
	.object({
		data: z.union([ReactionRoleCreateManyInputSchema, ReactionRoleCreateManyInputSchema.array()]),
	})
	.strict();

export const ReactionRoleDeleteArgsSchema: z.ZodType<Prisma.ReactionRoleDeleteArgs> = z
	.object({
		select: ReactionRoleSelectSchema.optional(),
		include: ReactionRoleIncludeSchema.optional(),
		where: ReactionRoleWhereUniqueInputSchema,
	})
	.strict();

export const ReactionRoleUpdateArgsSchema: z.ZodType<Prisma.ReactionRoleUpdateArgs> = z
	.object({
		select: ReactionRoleSelectSchema.optional(),
		include: ReactionRoleIncludeSchema.optional(),
		data: z.union([ReactionRoleUpdateInputSchema, ReactionRoleUncheckedUpdateInputSchema]),
		where: ReactionRoleWhereUniqueInputSchema,
	})
	.strict();

export const ReactionRoleUpdateManyArgsSchema: z.ZodType<Prisma.ReactionRoleUpdateManyArgs> = z
	.object({
		data: z.union([ReactionRoleUpdateManyMutationInputSchema, ReactionRoleUncheckedUpdateManyInputSchema]),
		where: ReactionRoleWhereInputSchema.optional(),
		limit: z.number().optional(),
	})
	.strict();

export const ReactionRoleDeleteManyArgsSchema: z.ZodType<Prisma.ReactionRoleDeleteManyArgs> = z
	.object({
		where: ReactionRoleWhereInputSchema.optional(),
		limit: z.number().optional(),
	})
	.strict();

export const StarCreateArgsSchema: z.ZodType<Prisma.StarCreateArgs> = z
	.object({
		select: StarSelectSchema.optional(),
		data: z.union([StarCreateInputSchema, StarUncheckedCreateInputSchema]),
	})
	.strict();

export const StarUpsertArgsSchema: z.ZodType<Prisma.StarUpsertArgs> = z
	.object({
		select: StarSelectSchema.optional(),
		where: StarWhereUniqueInputSchema,
		create: z.union([StarCreateInputSchema, StarUncheckedCreateInputSchema]),
		update: z.union([StarUpdateInputSchema, StarUncheckedUpdateInputSchema]),
	})
	.strict();

export const StarCreateManyArgsSchema: z.ZodType<Prisma.StarCreateManyArgs> = z
	.object({
		data: z.union([StarCreateManyInputSchema, StarCreateManyInputSchema.array()]),
	})
	.strict();

export const StarDeleteArgsSchema: z.ZodType<Prisma.StarDeleteArgs> = z
	.object({
		select: StarSelectSchema.optional(),
		where: StarWhereUniqueInputSchema,
	})
	.strict();

export const StarUpdateArgsSchema: z.ZodType<Prisma.StarUpdateArgs> = z
	.object({
		select: StarSelectSchema.optional(),
		data: z.union([StarUpdateInputSchema, StarUncheckedUpdateInputSchema]),
		where: StarWhereUniqueInputSchema,
	})
	.strict();

export const StarUpdateManyArgsSchema: z.ZodType<Prisma.StarUpdateManyArgs> = z
	.object({
		data: z.union([StarUpdateManyMutationInputSchema, StarUncheckedUpdateManyInputSchema]),
		where: StarWhereInputSchema.optional(),
		limit: z.number().optional(),
	})
	.strict();

export const StarDeleteManyArgsSchema: z.ZodType<Prisma.StarDeleteManyArgs> = z
	.object({
		where: StarWhereInputSchema.optional(),
		limit: z.number().optional(),
	})
	.strict();

export const ItemCreateArgsSchema: z.ZodType<Prisma.ItemCreateArgs> = z
	.object({
		select: ItemSelectSchema.optional(),
		include: ItemIncludeSchema.optional(),
		data: z.union([ItemCreateInputSchema, ItemUncheckedCreateInputSchema]),
	})
	.strict();

export const ItemUpsertArgsSchema: z.ZodType<Prisma.ItemUpsertArgs> = z
	.object({
		select: ItemSelectSchema.optional(),
		include: ItemIncludeSchema.optional(),
		where: ItemWhereUniqueInputSchema,
		create: z.union([ItemCreateInputSchema, ItemUncheckedCreateInputSchema]),
		update: z.union([ItemUpdateInputSchema, ItemUncheckedUpdateInputSchema]),
	})
	.strict();

export const ItemCreateManyArgsSchema: z.ZodType<Prisma.ItemCreateManyArgs> = z
	.object({
		data: z.union([ItemCreateManyInputSchema, ItemCreateManyInputSchema.array()]),
	})
	.strict();

export const ItemDeleteArgsSchema: z.ZodType<Prisma.ItemDeleteArgs> = z
	.object({
		select: ItemSelectSchema.optional(),
		include: ItemIncludeSchema.optional(),
		where: ItemWhereUniqueInputSchema,
	})
	.strict();

export const ItemUpdateArgsSchema: z.ZodType<Prisma.ItemUpdateArgs> = z
	.object({
		select: ItemSelectSchema.optional(),
		include: ItemIncludeSchema.optional(),
		data: z.union([ItemUpdateInputSchema, ItemUncheckedUpdateInputSchema]),
		where: ItemWhereUniqueInputSchema,
	})
	.strict();

export const ItemUpdateManyArgsSchema: z.ZodType<Prisma.ItemUpdateManyArgs> = z
	.object({
		data: z.union([ItemUpdateManyMutationInputSchema, ItemUncheckedUpdateManyInputSchema]),
		where: ItemWhereInputSchema.optional(),
		limit: z.number().optional(),
	})
	.strict();

export const ItemDeleteManyArgsSchema: z.ZodType<Prisma.ItemDeleteManyArgs> = z
	.object({
		where: ItemWhereInputSchema.optional(),
		limit: z.number().optional(),
	})
	.strict();

export const UserCreateArgsSchema: z.ZodType<Prisma.UserCreateArgs> = z
	.object({
		select: UserSelectSchema.optional(),
		data: z.union([UserCreateInputSchema, UserUncheckedCreateInputSchema]),
	})
	.strict();

export const UserUpsertArgsSchema: z.ZodType<Prisma.UserUpsertArgs> = z
	.object({
		select: UserSelectSchema.optional(),
		where: UserWhereUniqueInputSchema,
		create: z.union([UserCreateInputSchema, UserUncheckedCreateInputSchema]),
		update: z.union([UserUpdateInputSchema, UserUncheckedUpdateInputSchema]),
	})
	.strict();

export const UserCreateManyArgsSchema: z.ZodType<Prisma.UserCreateManyArgs> = z
	.object({
		data: z.union([UserCreateManyInputSchema, UserCreateManyInputSchema.array()]),
	})
	.strict();

export const UserDeleteArgsSchema: z.ZodType<Prisma.UserDeleteArgs> = z
	.object({
		select: UserSelectSchema.optional(),
		where: UserWhereUniqueInputSchema,
	})
	.strict();

export const UserUpdateArgsSchema: z.ZodType<Prisma.UserUpdateArgs> = z
	.object({
		select: UserSelectSchema.optional(),
		data: z.union([UserUpdateInputSchema, UserUncheckedUpdateInputSchema]),
		where: UserWhereUniqueInputSchema,
	})
	.strict();

export const UserUpdateManyArgsSchema: z.ZodType<Prisma.UserUpdateManyArgs> = z
	.object({
		data: z.union([UserUpdateManyMutationInputSchema, UserUncheckedUpdateManyInputSchema]),
		where: UserWhereInputSchema.optional(),
		limit: z.number().optional(),
	})
	.strict();

export const UserDeleteManyArgsSchema: z.ZodType<Prisma.UserDeleteManyArgs> = z
	.object({
		where: UserWhereInputSchema.optional(),
		limit: z.number().optional(),
	})
	.strict();

export const MemberCreateArgsSchema: z.ZodType<Prisma.MemberCreateArgs> = z
	.object({
		select: MemberSelectSchema.optional(),
		include: MemberIncludeSchema.optional(),
		data: z.union([MemberCreateInputSchema, MemberUncheckedCreateInputSchema]),
	})
	.strict();

export const MemberUpsertArgsSchema: z.ZodType<Prisma.MemberUpsertArgs> = z
	.object({
		select: MemberSelectSchema.optional(),
		include: MemberIncludeSchema.optional(),
		where: MemberWhereUniqueInputSchema,
		create: z.union([MemberCreateInputSchema, MemberUncheckedCreateInputSchema]),
		update: z.union([MemberUpdateInputSchema, MemberUncheckedUpdateInputSchema]),
	})
	.strict();

export const MemberCreateManyArgsSchema: z.ZodType<Prisma.MemberCreateManyArgs> = z
	.object({
		data: z.union([MemberCreateManyInputSchema, MemberCreateManyInputSchema.array()]),
	})
	.strict();

export const MemberDeleteArgsSchema: z.ZodType<Prisma.MemberDeleteArgs> = z
	.object({
		select: MemberSelectSchema.optional(),
		include: MemberIncludeSchema.optional(),
		where: MemberWhereUniqueInputSchema,
	})
	.strict();

export const MemberUpdateArgsSchema: z.ZodType<Prisma.MemberUpdateArgs> = z
	.object({
		select: MemberSelectSchema.optional(),
		include: MemberIncludeSchema.optional(),
		data: z.union([MemberUpdateInputSchema, MemberUncheckedUpdateInputSchema]),
		where: MemberWhereUniqueInputSchema,
	})
	.strict();

export const MemberUpdateManyArgsSchema: z.ZodType<Prisma.MemberUpdateManyArgs> = z
	.object({
		data: z.union([MemberUpdateManyMutationInputSchema, MemberUncheckedUpdateManyInputSchema]),
		where: MemberWhereInputSchema.optional(),
		limit: z.number().optional(),
	})
	.strict();

export const MemberDeleteManyArgsSchema: z.ZodType<Prisma.MemberDeleteManyArgs> = z
	.object({
		where: MemberWhereInputSchema.optional(),
		limit: z.number().optional(),
	})
	.strict();
