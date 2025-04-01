import { bold } from "@discordjs/formatters";
import { defaultCard, hexToHsla, isValidHex, setHSLAOpacity } from "@riceball/colorify";
import { Database } from "@riceball/db";
import type { Card } from "@riceball/db/zod";
import { container } from "tsyringe";

interface BaseCommandOptions {
	guildId: string;
	userId: string;
}

interface ColorCommandOptions extends BaseCommandOptions {
	value: string;
}

export const runColorCommand = async (key: keyof Card, { value, guildId, userId }: ColorCommandOptions) => {
	if (!isValidHex(value)) {
		throw `Invalid color: ${value}. Please provide a valid hex color code.`;
	}

	const hsla = hexToHsla(value);
	const db = container.resolve(Database);

	await db.setMemberSettings(guildId, userId, {
		card: { [key]: hsla },
	});

	return `Set your rank card's ${camelCaseToRegular(key)} color to ${bold(value)}.`;
};

const camelCaseToRegular = (str: string) => {
	return str.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
};

interface OpacityCommandOptions extends BaseCommandOptions {
	value: number;
}

type KeysWithOpacity =
	| "overlayColor"
	| "overlayAccentColor"
	| "wrapperColor"
	| "subtextColor"
	| "textColor"
	| "progressBarColor";

export const runOpacityCommand = async (key: KeysWithOpacity, { value, guildId, userId }: OpacityCommandOptions) => {
	if (Number.isNaN(Number(value)) || Number(value) < 0 || Number(value) > 100) {
		throw `Invalid opacity value: ${value}. Please provide a number between 0 and 100.`;
	}

	const db = container.resolve(Database);

	const { card } = await db.getMemberSettings(guildId, userId);

	const color = card[key] ?? defaultCard[key];
	const alpha = value / 100;

	await db.setMemberSettings(guildId, userId, {
		card: {
			[key]: setHSLAOpacity(color, alpha),
		},
	});

	return `Set your rank card's ${camelCaseToRegular(key)} opacity to ${bold(value.toString())}%.`;
};

export const runResetCommand = async (key: keyof Card, { guildId, userId }: BaseCommandOptions) => {
	const db = container.resolve(Database);

	await db.setMemberSettings(guildId, userId, {
		card: { [key]: defaultCard[key] },
	});

	return `Reset your rank card's ${camelCaseToRegular(key)} to default.`;
};
