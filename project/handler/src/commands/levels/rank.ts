/**
 * This file is part of the Rice Ball (https://github.com/aelxxs/riceball).
 * Copyright (c) 2023 Alexis Vielma.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Affero Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 **/

import { Command, Context, getGuildIcon, getUserAvatar } from "@lib/core";
import { Levels } from "@lib/plugins";
import { Canvas, loadFont, loadImage } from "canvas-constructor/napi-rs";
import { getEquippedBadges, getMember, getUser } from "db";
import type { APIGuild, APIUser } from "discord-api-types/v10";
import Redis from "ioredis";
import { Deps } from "library/common";
import { join } from "path";
import { inject, injectable } from "tsyringe";

// load fonts
// JetBrainsMono-VariableFont_wght.ttf

loadFont(join(__dirname, "../../../assets/fonts/JetBrainsMono-VariableFont_wght.ttf"), "Onigiri");

@injectable()
export default class implements Command {
	public constructor(
		@inject(Levels) private levels: Levels,
		@inject(Deps.Redis) private redis: Redis,
	) {}

	/**
	 * View your or another users rank in this server
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ guild, author, member }: Context, { user }: Options) {
		const rankCard = await this.generateRankCard(guild, user ?? author);

		const name = (user ?? author).username;
		const fileName = `${Date.now()}-${name}-${guild.id}.png`;

		return {
			content: `${name}'s rank card:`,
			files: [{ name: fileName, data: rankCard }],
		};
	}

	/**
	 * Generate a rank card for a user
	 * @param {APIGuild} guild - The guild to generate the rank card for
	 * @param {APIUser} user - The user to generate the rank card for
	 * @returns {Promise<Buffer>} The rank card
	 * @private
	 * */
	public async generateRankCard(guild: APIGuild, user: APIUser): Promise<Buffer> {
		const { reputation, country, bio } = await getUser(user.id);
		const { card, badges, exp } = await getMember(guild.id, user.id);

		const rank = await this.levels.getMemberRank(guild.id, user.id);

		const currentLvl = this.levels.getLvl(exp);
		const currentExp = this.levels.getProgress(exp);
		const expReq = this.levels.expReq(currentLvl);

		const [avatar, icon, background, flag] = await Promise.all([
			loadImage(getUserAvatar(user)),
			loadImage(getGuildIcon(guild) ?? ""),
			loadImage("https://i.imgur.com/WMKqKYF.jpeg"),
			loadImage(join(__dirname, `../../../assets/flags/flag-${country ?? "mx"}.png`)),
		]);

		const equippedBadges = await getEquippedBadges(user.id, guild.id);

		const bioText = user.bot ? "Beep boop, I'm a bot!" : (bio ?? "No bio set... 🍙");

		const {
			showBio,
			showStatsBox,
			showStatsBar,
			showBadges,
			showIcon,
			showFlag,
			backgroundUrl,
			backgroundBlur,
			backgroundColor,
			backgroundOpacity,
			fontColor,
			fontFamily,
			primaryColor,
			accentColor,
			progressColor,
			primaryOpacity,
			accentOpacity,
			progressOpacity,
			borderRadius,
		} = card;

		const { primary, secondary, text, subtext } = composeColorPalette(
			primaryColor ?? "#23313D",
			primaryOpacity * 0.01,
		);

		const s = 6; // 1/4 of the original size
		const br = 35;

		const progress = Math.max(Math.round((currentExp / expReq) * 249), 20);

		console.log(progress);

		// const skeleton = await this.renderSkeleton(s, br, primary, secondary, guild.id, user.id);
		// const skeletonImg = await loadImage(skeleton);

		const render = new Canvas(380 * s, 112 * s)
			// add skeleton
			// .printImage(skeletonImg, 0, 0, 380 * s, 112 * s)
			/* Background */
			// .printRectangle(0, 0, 380 * s, 112 * s)
			.printRoundedRectangle(0, 0, 380 * s, 112 * s, br * 1.25)
			.printRoundedImage(background, 0, 0, 380 * s, 112 * s, br * 1.25)

			// Layout
			.setColor(primary)
			.printRoundedRectangle(8 * s, 8 * s, 364 * s, 96 * s, br)
			/* Avatar Panel */
			.setColor(secondary)
			.printRectangle(16 * s, 8 * s, 74 * s, 96 * s)
			.setColor(primary)
			.printCircle(53 * s, 45 * s, 29 * s)
			.setColor(secondary)
			/* Server Icon */
			.printCircle(358 * s, 90 * s, 6 * s)
			/* Progress Bar */
			.printRoundedRectangle(98 * s, 84 * s, 249 * s, 12 * s, 10000)
			/* Stats Panel */
			.printRoundedRectangle(292 * s, 16 * s, 72 * s, 60 * s, br * 0.75)
			/* Stat Sections */
			.setColor(primary)
			.printRoundedRectangle(300 * s, 24 * s, 56 * s, 18 * s, br * 0.5)
			.printRoundedRectangle(300 * s, 50 * s, 56 * s, 18 * s, br * 0.5)
			/* Badge Panel */
			.setColor(secondary)
			.printRoundedRectangle(98 * s, 49 * s, 186 * s, 20 * s, br * 0.75)
			/* Badge Placeholders */
			.setColor(primary)
			.process((canvas) => {
				for (let i = 0; i < 6; i++) {
					const x = 98 + (186 / 6) * (i + 0.5);
					canvas.printCircle(x * s, 59 * s, 2.5 * s);
				}
			})
			// * User Info
			.process((ctx) => {
				if (icon) {
					ctx.printCircularImage(icon, 358 * s, 90 * s, 6 * s);
				}

				if (showBio) {
					ctx.setTextFont(`medium ${8 * s}px Onigiri`);
					ctx.setColor(subtext);
					ctx.printText(bioText, 98 * s, 43 * s);
				}

				if (showBadges) {
					ctx.setColor(primary);
					ctx.process((canvas) => {
						let distance = 980 * s;
						for (let i = 0; i < 6; i++) {
							canvas.printCircle(distance, 480 * s, 20 * s);
							distance += 216 * s;
						}
					});
				}
			})
			.printCircularImage(avatar, 53 * s, 45 * s, 29 * s)
			.printRoundedImage(flag, 350 * s, 660 * s, 180 * s, 120 * s, 25 * s)
			// Progress Bar
			.save()
			.setColor(this.toRGBA(progressColor ?? "#e95262", Math.max(primaryOpacity, 0.55)))
			.createRoundedClip(98 * s, 84 * s, 249 * s, 12 * s, 10000)
			.printRectangle(98 * s, 84 * s, progress * s, 12 * s)
			.restore()
			// Name & Subtext
			.process((ctx) => {
				const measureText = (ctx: Canvas, text: string, font: string) => {
					ctx.setTextFont(font);
					return ctx.measureText(text).width;
				};

				// render +<reputation>rep
				const rep = this.abbreviateNumber(reputation);
				const plusTextWidth = measureText(ctx, "+", `600 ${8 * s}px Onigiri`);
				const repLabelWidth = measureText(ctx, "rep", `600 ${8 * s}px Onigiri`);
				const repNumberWidth = measureText(ctx, rep, `800 ${9 * s}px Onigiri`);

				const reputationGroupStartX = 328 * s - (plusTextWidth + repNumberWidth + repLabelWidth) / 2;

				ctx.setTextAlign("start");
				ctx.setColor(subtext);
				ctx.setTextFont(`600 ${8 * s}px Onigiri`);
				ctx.printText("+", reputationGroupStartX, 62 * s);
				ctx.setColor(text);
				ctx.setTextFont(`800 ${9 * s}px Onigiri`);
				ctx.printText(rep, reputationGroupStartX + plusTextWidth, 62 * s);
				ctx.setColor(subtext);
				ctx.setTextFont(`600 ${8 * s}px Onigiri`);
				ctx.printText("rep", reputationGroupStartX + plusTextWidth + repNumberWidth, 62 * s);

				// render #<rank>
				const abbreviatedRank = this.abbreviateNumber(rank);
				const hashtagTextWidth = measureText(ctx, "#", `800 ${7 * s}px Onigiri`);
				const rankTextWidth = measureText(ctx, abbreviatedRank, `800 ${9 * s}px Onigiri`);
				const rankGroupStartX = 328 * s - (rankTextWidth + hashtagTextWidth) / 2;

				ctx.setColor(subtext);
				ctx.setTextFont(`600 ${7 * s}px Onigiri`);
				ctx.printText("#", rankGroupStartX, 36 * s);
				ctx.setColor(text);
				ctx.setTextFont(`800 ${9 * s}px Onigiri`);
				ctx.printText(abbreviatedRank, rankGroupStartX + hashtagTextWidth, 36 * s);

				// render Lvl. <level>
				const lvlTextWidth = measureText(ctx, "Lvl.", `600 ${7 * s}px Onigiri`);

				ctx.setColor(subtext);
				ctx.setTextFont(`600 ${7 * s}px Onigiri`);
				ctx.printText("Lvl.", 98 * s, 79.625 * s);
				ctx.setColor(text);
				ctx.setTextFont(`800 ${9 * s}px Onigiri`);
				ctx.printText(currentLvl.toLocaleString(), 98 * s + lvlTextWidth, 79.625 * s);

				// render <currentXP>/<maxXP> Exp.
				const cur = this.abbreviateNumber(currentExp);
				const req = this.abbreviateNumber(expReq);
				const xpTextWidth = measureText(ctx, `/${req} Exp.`, `600 ${7 * s}px Onigiri`);

				ctx.setTextAlign("end");
				// current
				ctx.setColor(text);
				ctx.setTextFont(`800 ${9 * s}px Onigiri`);
				ctx.printText(cur, 284 * s - xpTextWidth, 79.625 * s);
				// /maxXP
				ctx.setColor(subtext);
				ctx.setTextFont(`600 ${7 * s}px Onigiri`);
				ctx.printText(`/${req} Exp.`, 284 * s, 79.625 * s);
			})

			.setTextAlign("start")
			.setColor(text)
			.setTextFont(`800 ${18 * s}px JetBrains Mono`)
			.printText(user.username, 98 * s, 30 * s)
			.png();

		return render;
	}

	private async renderSkeleton(
		s: number,
		br: number,
		primary: string,
		secondary: string,
		guildId: string,
		userId: string,
	) {
		const key = `rank-card-skeleton:${guildId}:${userId}`;
		const cached = await this.redis.get(key);

		if (cached) {
			return cached;
		}

		const canvas = new Canvas(380 * s, 112 * s)
			/* Background */
			.printRectangle(0, 0, 380 * s, 112 * s)
			.printRoundedRectangle(0, 0, 380 * s, 112 * s, br * 1.25)
			// .printRoundedImage(background, 0, 0, 380 * s, 112 * s, br * 1.25)

			// Layout
			.setColor(primary)
			.printRoundedRectangle(8 * s, 8 * s, 364 * s, 96 * s, br)
			/* Avatar Panel */
			.setColor(secondary)
			.printRectangle(16 * s, 8 * s, 74 * s, 96 * s)
			.setColor(primary)
			.printCircle(53 * s, 45 * s, 29 * s)
			.setColor(secondary)
			/* Server Icon */
			.printCircle(358 * s, 90 * s, 6 * s)
			/* Progress Bar */
			.printRoundedRectangle(98 * s, 84 * s, 249 * s, 12 * s, 10000)
			/* Stats Panel */
			.printRoundedRectangle(292 * s, 16 * s, 72 * s, 60 * s, br * 0.75)
			/* Stat Sections */
			.setColor(primary)
			.printRoundedRectangle(300 * s, 24 * s, 56 * s, 18 * s, br * 0.5)
			.printRoundedRectangle(300 * s, 50 * s, 56 * s, 18 * s, br * 0.5)
			/* Badge Panel */
			.setColor(secondary)
			.printRoundedRectangle(98 * s, 49 * s, 186 * s, 20 * s, br * 0.5)
			/* Badge Placeholders */
			.setColor(primary)
			.process((canvas) => {
				for (let i = 0; i < 6; i++) {
					const x = 98 + (186 / 6) * (i + 0.5);
					canvas.printCircle(x * s, 59 * s, 2.5 * s);
				}
			});

		const img = await canvas.toDataURLAsync();

		this.redis.set(key, img, "EX", 60 * 60 * 24); // 24 hours

		return img;
	}

	private abbreviateNumber(value: number) {
		const suffixes = ["", "k", "m", "b", "t"];
		const tier = (Math.log10(value) / 3) | 0;

		const suffix = suffixes[tier];
		const scaled = value / 10 ** (tier * 3);

		return parseFloat(scaled.toFixed(1)) + suffix;
	}

	private adjust(hex: string, amount: number) {
		return hex.replace(/\w\w/g, (str) => {
			return Math.min(255, Math.max(0, parseInt(str, 16) + amount)).toString(16);
		});
	}

	private toRGBA(hex: string, a = 1) {
		const [r, g, b] = hex.match(/\w\w/g)!.map((str) => {
			return parseInt(str, 16);
		});

		return `rgba(${r}, ${g}, ${b}, ${a})`;
	}

	private toHEX(rgba: string) {
		function trim(str: string) {
			return str.replace(/^\s+|\s+$/gm, "");
		}

		const parts = rgba.substring(rgba.indexOf("(")).split(",");
		const r = parseInt(trim(parts[0].substring(1)), 10);
		const g = parseInt(trim(parts[1]), 10);
		const b = parseInt(trim(parts[2]), 10);
		const a = parseFloat(trim(parts[3].substring(0, parts[3].length - 1))).toFixed(2);

		// @ts-ignore - This is a valid hex code
		return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}${(a * 255).toString(16)}`.substring(0, 7);
	}

	private isLight(hex: string) {
		const [r, g, b] = hex.match(/\w\w/g)!.map((str) => {
			return parseInt(str, 16);
		});

		return (r * 299 + g * 587 + b * 114) / 1000 > 128;
	}
}
function isLight(hex: string) {
	const [r, g, b] = hex.match(/\w\w/g)!.map((str) => {
		return parseInt(str, 16);
	});

	return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

const composeColorPalette = (color: HEXColorString, opacity: number = 1) => {
	const light = isLight(color);
	const { h, s, l, a } = hexToHsla(color, opacity);

	return {
		primary: hslaToStr({ h, s, l, a: opacity }),
		secondary: hslaToStr({
			h,
			s,
			l: light ? l - 0.1 : l + 0.1,
			a: opacity,
		}),
		text: hslaToStr({
			h,
			s,
			l: light ? 0.1 : 0.95,
			a: 1,
		}),
		subtext: hslaToStr({ h, s, l: light ? 0.2 : 0.85, a: 1 }),
	};
};

interface Options {
	/* A user in this server */
	user: APIUser;
}

export type HEXColorString = string | `#${string}`;
export type HSLColorString = `hsla(${number}, ${number}%, ${number}%, ${number})`;

export type HSLAColorObject = {
	h: number;
	s: number;
	l: number;
	a: number;
};

export const hslaToStr = ({ h, s, l, a }: HSLAColorObject): HSLColorString => {
	return `hsla(${h}, ${s * 100}%, ${l * 100}%, ${a})`;
};

export const hexToHsla = (hex: HEXColorString, opacity?: number): HSLAColorObject => {
	if (!hex.match(/\w\w/g)) throw new Error("Invalid HEX color");

	let [r, g, b] = hex?.match(/\w\w/g)!.map((str) => {
		return parseInt(str, 16);
	});

	r /= 255;
	g /= 255;
	b /= 255;

	const min = Math.min(r, g, b);
	const max = Math.max(r, g, b);

	let h: number = 0;
	let s: number = 0;
	const l: number = (max + min) / 2;

	if (max === min) {
		h = 0;
		s = 0;
	} else {
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

	return { h: h * 360, s, l, a: opacity ?? 1 };
};

export const hslToHex = (hsl: HSLColorString): HEXColorString => {
	if (!hsl.match(/\d+(\.\d+)?/g)) throw new Error("Invalid HSL color");

	let [h, s, l] = hsl.match(/\d+(\.\d+)?/g)!.map((str) => {
		return parseFloat(str);
	});

	l /= 100;

	const a = (s * Math.min(l, 1 - l)) / 100;

	const f = (n: number) => {
		const k = (n + h / 30) % 12;

		const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);

		return Math.round(255 * color)
			.toString(16)
			.padStart(2, "0");
	};

	return `#${f(0)}${f(8)}${f(4)}`;
};
