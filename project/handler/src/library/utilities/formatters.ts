import { bold } from "@discordjs/formatters";
import type { APIPartialEmoji } from "discord-api-types/v10";
import { Constants } from "library/common";

export const formatBoolean = (value: boolean, presentTense = true) => {
	if (value) return `${Constants.Emoji.Enabled} ${presentTense ? "Enabled" : "Enable"}`;
	return `${Constants.Emoji.Disabled} ${presentTense ? "Disabled" : "Disable"}`;
};

export const formatBooleanForButton = (value: boolean) => {
	const { id, name } = parseEmoji(value ? Constants.Emoji.Disabled : Constants.Emoji.Enabled) as APIPartialEmoji;

	return {
		text: value ? "Disable" : "Enable",
		emoji: { id, name, animated: false },
	};
};

export const formatEconomyRate = (min: number, max: number, cooldown: number) => {
	if (!max) return `${min} every ${bold(cooldown.toString())} seconds`;
	return `${bold(`${min}–${max}`)} every ${bold(cooldown.toString())} seconds`;
};

export const emtpyInlineField = {
	name: "",
	value: "",
	inline: true,
};

export const emptyField = {
	name: Constants.EmptyWhitespace,
	value: Constants.EmptyWhitespace,
};

/**
 * Parses emoji info out of a string. The string must be one of:
 * * A UTF-8 emoji (no id)
 * * A URL-encoded UTF-8 emoji (no id)
 * * A Discord custom emoji (`<:name:id>`, `<a:name:id>`, or `<:_:id>`)
 * @param {string} text Emoji string to parse
 * @returns {?APIPartialEmoji}
 */
function parseEmoji(text: string): APIPartialEmoji | null {
	let decodedText = text;
	if (text.includes("%")) decodedText = decodeURIComponent(text);
	if (!text.includes(":")) return { animated: false, name: decodedText, id: null };
	const match = decodedText.match(/<?(?:(a):)?(\w{0,32}):(\d{17,19})?>?/);
	return match && { animated: Boolean(match[1]), name: match[2] || null, id: match[3] };
}
