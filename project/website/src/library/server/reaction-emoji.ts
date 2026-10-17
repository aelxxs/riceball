const CUSTOM_EMOJI = /^<?(?:(a)?:)?(\w{2,32}):(\d{17,21})>?$/;
const VARIATION_SELECTOR = /️/g;

/**
 * Converts a stored emoji (`<:name:id>`, `<a:name:id>`, `name:id` or unicode) into the
 * URL-encoded form Discord's reaction routes expect (`name:id` or unicode).
 */
export const toReactionParam = (emoji: string) => {
	const trimmed = emoji.trim();
	const custom = CUSTOM_EMOJI.exec(trimmed);

	return encodeURIComponent(custom ? `${custom[2]}:${custom[3]}` : trimmed);
};

/**
 * A key that matches the bot's emoji comparison, so the same emoji stored two ways is treated as one.
 */
export const emojiKey = (emoji: string) => {
	const trimmed = emoji.trim();
	const custom = CUSTOM_EMOJI.exec(trimmed);

	return custom ? custom[3] : trimmed.replace(VARIATION_SELECTOR, "");
};

// Discord caps a message at 20 unique reactions, and the bot only ever matches the first pair for an emoji.
export const validateReactionPairs = (pairs: { emoji: string }[]) => {
	if (pairs.length === 0) return "Add at least one reaction.";
	if (pairs.length > 20) return "A message can have at most 20 reactions.";

	const keys = pairs.map((pair) => emojiKey(pair.emoji));
	if (new Set(keys).size !== keys.length) return "Each reaction must use a different emoji.";

	return null;
};

export const describeDiscordError = (error: unknown) =>
	error instanceof Error ? error.message : "Discord rejected the request.";
