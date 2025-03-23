// @riceball/color-utils.ts

import { CardWithRelations } from "db/zod";

export type HSLColorString = `hsla(${number}, ${number}%, ${number}%, ${number})`;
export type HEXColorString = `#${string}`;

export type HSLAColorObject = {
	h: number;
	s: number;
	l: number;
	a: number; // float 0-1
};

export type RGBAColorObject = {
	r: number;
	g: number;
	b: number; // Integer 0-255
	a: number; // float 0-1
};

export const defaultCard = {
	name: "Default Card",
	fontFamily: "MONOSPACE",
	borderRadius: 25,
	wrapperImage: null,
	wrapperColor: { h: 230, s: 75, l: 60, a: 1 },
	overlayColor: { h: 230, s: 25, l: 10, a: 1 },
	overlayAccentColor: { h: 230, s: 25, l: 20, a: 1 },
	textColor: { h: 230, s: 25, l: 90, a: 1 },
	subtextColor: { h: 230, s: 25, l: 80, a: 1 },
	progressBarColor: { h: 230, s: 75, l: 60, a: 1 },
};

export const isLight = (hsla: HSLAColorObject): boolean => {
	// Convert HSLA to RGB
	const l = hsla.l / 100;
	const a = (hsla.s * Math.min(l, 1 - l)) / 100;
	const f = (n: number): number => {
		const k = (n + hsla.h / 30) % 12;
		const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
		return Math.round(255 * color);
	};

	const r = f(0);
	const g = f(8);
	const b = f(4);

	// Calculate perceived brightness
	const brightness = (r * 299 + g * 587 + b * 114) / 1000;

	// Return true if the color is light, false otherwise
	return brightness > 128;
};

// return a card with hsla strings
export const composeLevelCard = (card: CardWithRelations) => {
	return {
		...card,
		wrapperColor: hslaToStr(card.wrapperColor ?? defaultCard.wrapperColor),
		overlayColor: hslaToStr(card.overlayColor ?? defaultCard.overlayColor),
		overlayAccentColor: hslaToStr(card.overlayAccentColor ?? defaultCard.overlayAccentColor),
		textColor: hslaToStr(card.textColor ?? defaultCard.textColor),
		subtextColor: hslaToStr(card.subtextColor ?? defaultCard.subtextColor),
		progressBarColor: hslaToStr(card.progressBarColor ?? defaultCard.progressBarColor),
		borderRadius: card.borderRadius ?? defaultCard.borderRadius,
	};
};

export const getHSLAOpacity = (hsla: HSLAColorObject) => {
	return hsla.a;
};

export const setHSLAOpacity = (hsla: HSLAColorObject, opacity: number) => {
	return { ...hsla, a: opacity };
};

export const hslaToStr = ({ h, s, l, a }: HSLAColorObject): HSLColorString => {
	return `hsla(${h}, ${s}%, ${l}%, ${a})`;
};

export const hslaToObj = (hslaString: HSLColorString): HSLAColorObject => {
	// Regular expression to match HSLA values
	const regex = /hsla?\((\d+),\s*(\d+)%,\s*(\d+)%,?\s*(\d*\.?\d+)?\)/;

	// Extract values using regex
	const match = hslaString.match(regex);

	if (!match) {
		throw new Error("Invalid HSLA string format");
	}

	// Create and return the object
	return {
		h: parseInt(match[1]),
		s: parseInt(match[2]),
		l: parseInt(match[3]),
		a: match[4] ? parseFloat(match[4]) : 1,
	};
};

export const hexToHsla = (hex: string): HSLAColorObject => {
	// Remove the hash if it's there
	hex = hex.replace(/^#/, "");

	// Parse the hex string
	let r: number,
		g: number,
		b: number,
		a: number = 1;

	if (hex.length === 8) {
		// Handle 8-character hex (with alpha)
		r = parseInt(hex.slice(0, 2), 16);
		g = parseInt(hex.slice(2, 4), 16);
		b = parseInt(hex.slice(4, 6), 16);
		a = parseInt(hex.slice(6, 8), 16) / 255;
	} else if (hex.length === 6) {
		// Handle 6-character hex
		r = parseInt(hex.slice(0, 2), 16);
		g = parseInt(hex.slice(2, 4), 16);
		b = parseInt(hex.slice(4, 6), 16);
	} else {
		throw new Error("Invalid HEX color");
	}

	r /= 255;
	g /= 255;
	b /= 255;

	const min = Math.min(r, g, b);
	const max = Math.max(r, g, b);

	let h: number = 0;
	let s: number = 0;
	const l: number = (max + min) / 2;

	if (max !== min) {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}
		h /= 6;
	}

	return {
		h: Math.round(h * 360),
		s: Math.round(s * 100),
		l: Math.round(l * 100),
		a: Math.round(a * 100) / 100, // Round to 2 decimal places
	};
};

export const abbreviateNumber = (value: number) => {
	const suffixes = ["", "k", "m", "b", "t"];
	const tier = (Math.log10(value) / 3) | 0;

	const suffix = suffixes[tier];
	const scaled = value / 10 ** (tier * 3);

	return parseFloat(scaled.toFixed(1)) + suffix;
};

/**
 * Converts an HSLA color object to an RGBA color object.
 */
export function hslaToRgba(hsla: HSLAColorObject): RGBAColorObject {
	const h = hsla.h;
	const s = hsla.s / 100;
	const l = hsla.l / 100;
	const a = hsla.a;

	let r: number, g: number, b: number;

	if (s === 0) {
		r = g = b = l; // achromatic
	} else {
		const hue2rgb = (p: number, q: number, t: number): number => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};

		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;
		r = hue2rgb(p, q, h / 360 + 1 / 3);
		g = hue2rgb(p, q, h / 360);
		b = hue2rgb(p, q, h / 360 - 1 / 3);
	}
	return {
		r: Math.round(r * 255),
		g: Math.round(g * 255),
		b: Math.round(b * 255),
		a: a,
	};
}

/**
 * Calculates the relative luminance of a color in RGBA format.
 * Follows the WCAG 2.0 definition.
 */
function relativeLuminance(color: RGBAColorObject): number {
	const a = (x: number): number => {
		x /= 255;
		return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
	};

	const R = a(color.r);
	const G = a(color.g);
	const B = a(color.b);

	return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Calculates the contrast ratio between two colors.
 * Follows the WCAG 2.0 definition.
 */
export function getContrastRatio(color1: RGBAColorObject, color2: RGBAColorObject): number {
	const L1 = relativeLuminance(color1);
	const L2 = relativeLuminance(color2);

	return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
}

/**
 * Formats the contrast ratio for display.
 * @param ratio - The contrast ratio.
 * @param fractionDigits - The number of digits to appear after the decimal point
 */
export function formatContrastRatio(ratio: number, fractionDigits: number = 2): string {
	return ratio.toFixed(fractionDigits);
}

export const rgbaArrayToHex = (rgba: number[]): HEXColorString => {
	return `#${rgba.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
};

// Helper function to normalize hue values (0-360)
const normalizeHue = (h: number): number => ((h % 360) + 360) % 360;

// Helper function to clamp values between min and max
const clamp = (value: number, min: number, max: number): number => {
	return Math.min(Math.max(value, min), max);
};

export type LevelingCardPalette = {
	overlayColor: HSLAColorObject;
	overlayAccentColor: HSLAColorObject;
	progressBarColor: HSLAColorObject;
	textColor: HSLAColorObject;
	subtextColor: HSLAColorObject;
};

function generatePalette(baseColor: HSLAColorObject): LevelingCardPalette {
	const overlay = adjustBrightness(baseColor, -20);
	const overlayAccent = adjustBrightness(baseColor, -10);
	const progressBar = adjustSaturation(baseColor, 20);
	const text = getContrastColor(overlay);
	const subtext = adjustBrightness(text, text.l > 50 ? -20 : 20);

	return {
		overlayColor: overlay,
		overlayAccentColor: overlayAccent,
		progressBarColor: progressBar,
		textColor: text,
		subtextColor: subtext,
	};
}

export function generateComplementaryPalette(baseColor: HSLAColorObject): LevelingCardPalette[] {
	const complement = { ...baseColor, h: normalizeHue(baseColor.h + 180) };
	return [generatePalette(baseColor), generatePalette(complement)];
}

export function generateAnalogousPalette(baseColor: HSLAColorObject): LevelingCardPalette[] {
	return [
		generatePalette({ ...baseColor, h: normalizeHue(baseColor.h - 30) }),
		generatePalette(baseColor),
		generatePalette({ ...baseColor, h: normalizeHue(baseColor.h + 30) }),
	];
}

export function generateTriadicPalette(baseColor: HSLAColorObject): LevelingCardPalette[] {
	return [
		generatePalette(baseColor),
		generatePalette({ ...baseColor, h: normalizeHue(baseColor.h + 120) }),
		generatePalette({ ...baseColor, h: normalizeHue(baseColor.h + 240) }),
	];
}

export function adjustBrightness(color: HSLAColorObject, delta: number): HSLAColorObject {
	return {
		...color,
		l: clamp(color.l + delta, 0, 100),
	};
}

export function adjustSaturation(color: HSLAColorObject, delta: number): HSLAColorObject {
	return {
		...color,
		s: clamp(color.s + delta, 0, 100),
	};
}

export function getContrastColor(baseColor: HSLAColorObject): HSLAColorObject {
	return isLight(baseColor)
		? { h: baseColor.h, s: baseColor.s, l: 10, a: baseColor.a } // Dark version
		: { h: baseColor.h, s: baseColor.s, l: 90, a: baseColor.a }; // Light version
}

export function generateEnhancedPalettes(baseColor: HSLAColorObject): LevelingCardPalette[] {
	const palettes: LevelingCardPalette[] = [];

	// Original darker palettes
	palettes.push(generatePalette(baseColor));
	palettes.push(generatePalette({ ...baseColor, h: normalizeHue(baseColor.h + 180) }));
	palettes.push(generatePalette({ ...baseColor, h: normalizeHue(baseColor.h - 30) }));
	palettes.push(generatePalette({ ...baseColor, h: normalizeHue(baseColor.h + 30) }));
	palettes.push(generatePalette({ ...baseColor, h: normalizeHue(baseColor.h + 120) }));
	palettes.push(generatePalette({ ...baseColor, h: normalizeHue(baseColor.h + 240) }));
	palettes.push(generatePalette({ ...baseColor, s: clamp(baseColor.s - 20, 0, 100) }));
	palettes.push(generatePalette({ ...baseColor, l: clamp(baseColor.l - 15, 0, 100) }));

	// Light-themed palettes
	palettes.push(...generateLightPalettes(baseColor));

	return palettes;
}

function generateLightPalettes(baseColor: HSLAColorObject): LevelingCardPalette[] {
	const lightPalettes: LevelingCardPalette[] = [];

	// Very light (almost white) overlay and accent
	const lightOverlay = { ...baseColor, s: 10, l: 95, a: randomOpacity() }; // Random opacity
	const lightAccent = { ...baseColor, s: 15, l: 90, a: randomOpacity() }; // Random opacity

	// Generate palettes with light overlay and accent, but varying text and progress bar colors
	const variations = [
		baseColor,
		{ ...baseColor, h: normalizeHue(baseColor.h + 180) },
		{ ...baseColor, h: normalizeHue(baseColor.h - 30) },
		{ ...baseColor, h: normalizeHue(baseColor.h + 30) },
	];

	variations.forEach((variation) => {
		lightPalettes.push({
			overlayColor: lightOverlay,
			overlayAccentColor: lightAccent,
			progressBarColor: adjustSaturation(variation, 20),
			textColor: { ...variation, l: clamp(variation.l - 40, 0, 100) }, // Darker text for contrast
			subtextColor: { ...variation, l: clamp(variation.l - 20, 0, 100) }, // Slightly lighter subtext
		});
	});

	return lightPalettes;
}

function randomOpacity(min = 0.5, max = 1): number {
	return Math.random() * (max - min) + min; // Generates a random number between min and max
}
