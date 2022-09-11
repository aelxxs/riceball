-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL,
    "locale" TEXT DEFAULT E'en-US',
	"tags" JSONB DEFAULT '[]',
	"reactionRoles" JSONB DEFAULT '[]',
	"levelingRoles" JSONB DEFAULT '[]',
    "levels" JSONB DEFAULT '{
		"enabled": true,
		"replaceRewards": true,
		"expRate": {
			"min": null,
			"max": null,
			"cooldown": null
		},
		"autoPrune": false,
		"maxExpCap": null,
		"clearOnLeave": false,
		"announcement": {
			"channel": null,
			"message": null,
			"enabled": true
		},
		"blacklist": {
			"users": [],
			"roles": [],
			"channels": []
		},
		"whitelist": {
			"users": [],
			"roles": [],
			"channels": []
		}
    }',
	"economy" JSONB DEFAULT '{
		"enabled": true,
		"debugMode": false,
		"autoUseItems": false,
		"clearOnLeave": false,
		"textBasedEarnings": {
			"min": null,
			"max": null,
			"cooldown": null
		},
		"cooldowns": {
			"daily": null
		},
		"wager": {
			"min": 1,
			"max": null
		},
		"blacklist": {
			"users": [],
			"roles": [],
			"channels": []
		},
		"whitelist": {
			"users": [],
			"roles": [],
			"channels": []
		}
	}',
	"starboard" JSONB DEFAULT '{
		"enabled": true,
		"emoji": null,
		"channel": null,
		"threshold": 1,
		"embedColor": null,
		"selfStar": {
			"enabled": true,
			"warning": false
		},
		"blacklist": {
			"users": [],
			"roles": [],
			"channels": []
		},
		"whitelist": {
			"users": [],
			"roles": [],
			"channels": []
		}
	}',

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX ON "Guild" USING GIN ("levels");
CREATE INDEX ON "Guild" USING GIN ("economy");
CREATE INDEX ON "Guild" USING GIN ("starboard");

-- CreateTable
CREATE TABLE "Member" (
    "id" SERIAL NOT NULL,
    "member" TEXT NOT NULL,
    "guild" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "badges" JSONB NOT NULL DEFAULT '[]',
    "inventory" JSONB NOT NULL DEFAULT '[]',
    "cooldowns" JSONB DEFAULT '{ "daily": 0 }',
    "card" JSONB DEFAULT '{
		"background": null,
		"color": null,
		"theme": null,
		"accent": null,
		"opacity": null,
		"textColor": null,
		"shadowColor": null,
		"progressOpacity": null
	}',

    PRIMARY KEY ("id")
);

-- CreateIndex

CREATE UNIQUE INDEX "guildMember" ON "Member" ("member", "guild");
CREATE INDEX ON "Member" USING GIN ("badges");
CREATE INDEX ON "Member" USING GIN ("card");
CREATE INDEX ON "Member" USING GIN ("inventory");
CREATE INDEX ON "Member" USING GIN ("cooldowns");

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "country" TEXT,
    "reputation" INTEGER NOT NULL DEFAULT 0,
    "bio" TEXT,
    "presets" JSONB NOT NULL DEFAULT '[]',
    "cooldowns" JSONB DEFAULT '{ "rep": 0 }',

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopItem" (
    "id" TEXT NOT NULL,
    "guild" TEXT,
    "active" BOOLEAN DEFAULT true,
    "requiredRole" TEXT,
    "requiredLevel" TEXT,
    "purchaseResponse" TEXT,
    "maxPerUser" INTEGER,
    "name" TEXT NOT NULL,
    "price" INTEGER,
    "stock" INTEGER,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "role" TEXT,
    "badge" JSONB,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Star" (
    "guild" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "starredMessage" TEXT,
    "starCount" INTEGER NOT NULL DEFAULT 1,
    "starredBy" TEXT[],

    PRIMARY KEY ("message")
);