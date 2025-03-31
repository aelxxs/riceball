import type { SingleASTNode } from "@khanacademy/simple-markdown";
import type { APIChannel, APIRole } from "discord-api-types/v10";
import parse from "discord-markdown-parser";
import twemoji from "twemoji";

/**
 * Interface for partial emoji data.
 */
interface PartialEmoji {
	animated: boolean;
	name: string;
	id?: string;
}

/**
 * Converts a Discord emoji or Twemoji into its corresponding URL.
 */
function parseDiscordEmoji(emoji: PartialEmoji): string {
	if (emoji.id) {
		return `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? "gif" : "png"}`;
	}

	const codepoints = twemoji.convert
		.toCodePoint(emoji.name?.includes(String.fromCharCode(0x200d)) ? emoji.name : emoji.name.replace(/\uFE0F/g, ""))
		.toLowerCase();

	return `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${codepoints}.svg`;
}

/**
 * Recursively interprets tokens into HTML.
 */
function interpret(tokens: SingleASTNode | SingleASTNode[], ctx: Context): string {
	if (Array.isArray(tokens)) {
		return tokens.map((token) => interpret(token, ctx)).join("");
	}

	switch (tokens.type) {
		case "heading":
			return `<h${tokens.level}>${interpret(tokens.content, ctx)}</h${tokens.level}>`;
		case "text":
			return tokens.content as string;
		case "br":
		case "newline":
			return "<p/>";
		case "strong":
			return `<strong>${interpret(tokens.content, ctx)}</strong>`;
		case "underline":
			return `<u>${interpret(tokens.content, ctx)}</u>`;
		case "em":
			return `<em>${interpret(tokens.content, ctx)}</em>`;
		case "strikethrough":
			return `<s>${interpret(tokens.content, ctx)}</s>`;
		case "inlineCode":
			return `<code>${tokens.content}</code>`;
		case "codeBlock":
			return `<pre><code>${tokens.content}</code></pre>`;
		case "blockQuote":
			if (Array.isArray(tokens.content) && tokens.content[tokens.content.length - 1]?.type === "br") {
				tokens.content.pop();
			}
			return `<blockquote>${interpret(tokens.content, ctx)}</blockquote>`;
		case "emoji":
		case "twemoji": {
			const emoji = tokens as unknown as PartialEmoji;
			return `<img src="${parseDiscordEmoji(emoji)}" alt="${tokens.name}" class="emoji" />`;
		}
		case "channel":
			return makeMention("channel", tokens.id, ctx);
		case "role":
			return makeMention("role", tokens.id, ctx);
		case "user":
			return tokens.content;
		case "here":
		case "everyone":
			return makeMention(tokens.type, "", ctx);
		default:
			return "";
	}
}

/**
 * Creates a mention element for roles, channels, or special mentions.
 */
const makeMention = (type: MentionType, id: string, ctx: Context): string => {
	const mention = getMention(type, id);
	const name = getName(type, id, ctx);

	return `<discord-mention type="${type}" name="${name}" mention="${mention}"></discord-mention>`;
};

/**
 * Retrieves the name of a role or channel based on its ID.
 */
const getName = (type: MentionType, id: string, ctx: Context): string => {
	if (type === "role") {
		const role = ctx.roles.find((role) => role.id === id);
		return role?.name || "Unknown Role";
	}
	if (type === "channel") {
		console.log(ctx.channels, id);
		const channel = ctx.channels.find((channel) => channel.id === id);
		return channel?.name || "Unknown Channel";
	}
	return type;
};

/**
 * Generates the raw mention string for roles, channels, or special mentions.
 */
const getMention = (type: MentionType, id?: string): string => {
	switch (type) {
		case "role":
			return `<@&${id}>`;
		case "channel":
			return `<#${id}>`;
		case "everyone":
			return "@everyone";
		case "here":
			return "@here";
		default:
			return "";
	}
};

const TAG_REGEX = /{([^}]+)}/g;

type MentionType = "role" | "channel" | "everyone" | "here";
type Context = {
	roles: APIRole[];
	channels: APIChannel[];
};

/**
 * Converts Markdown to HTML with Discord-specific parsing.
 */
export function markdownToHTML(markdown: string, context: Context): string {
	const tokens = parse(markdown);
	let output = interpret(tokens, context);

	output = output.replaceAll(TAG_REGEX, (_, tag) => `<tag id="${tag}">${tag}</tag>`);

	return output;
}
