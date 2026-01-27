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

import { Database } from "@riceball/db";
import { stripIndents } from "common-tags";
import { ButtonStyle } from "discord-api-types/v10";
import { Constants } from "library/common";
import { actionRow, button } from "library/components";
import { type Command, type Component, type Context, edit, reply, update } from "library/core";
import { randomItem, randomNItems, shuffle } from "library/utilities/arrays";
import { inject, injectable } from "tsyringe";

type SpinResult = {
	render: string;
	isWin: boolean;
	isJackpot: boolean;
	winnings: number;
};

@injectable()
export default class implements Command {
	public db: Database;

	public constructor(@inject(Database) db: Database) {
		this.db = db;
	}
	/**
	 * Play a game of slots
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ i, guild, member, author }: Context, { wager }: Options, replay = false) {
		const { economy } = await this.db.getGuildSettings(guild.id);
		const { bal } = await this.db.getMemberSettings(guild.id, author.id);

		const currency = `${economy.currencyIcon ?? economy.currencyName}`;

		if (
			wager < economy.wagerMin
			|| wager > (economy.wagerMax === 0 ? Number.POSITIVE_INFINITY : economy.wagerMax)
		) {
			const message = `You must wager between ${currency} ${economy.wagerMin.toLocaleString()} and ${currency} ${economy.wagerMax.toLocaleString()}.`;

			if (replay) reply(i, message, { prefix: "error" });
			else throw message;
		}

		if (bal < wager) {
			const message = `You do not have enough ${currency} to play slots.`;

			if (replay) reply(i, message, { prefix: "error" });
			else throw message;
		}

		const compose = (spin: SpinResult, resultMessage = "") => stripIndents`
			**${member.nick ?? author?.username}**, you wagered ${currency} **${wager.toLocaleString()}**  and...

			${this.visualize(spin.render, resultMessage)}
		`;

		if (replay) {
			await update(i, {
				embeds: [{ description: compose(this.spin()) }],
				components: this.composeComponents(wager.toString(), wager, true),
			});
		} else {
			await edit(i, compose(this.spin()), { prefix: null });
		}

		const interval = setInterval(async () => {
			await edit(i, compose(this.spin()), { prefix: null });
		}, 1000);

		setTimeout(async () => {
			clearInterval(interval);

			setTimeout(async () => {
				const finalSpin = this.spin();
				const finalWins = finalSpin.isWin ? finalSpin.winnings * wager : 0;

				const resultMessage = this.composeResultMessage(finalSpin, finalWins, wager, currency, bal);

				await edit(i, {
					embeds: [{ description: compose(finalSpin, resultMessage) }],
					components: this.composeComponents(wager.toString(), wager),
				});

				const newBal = bal + (finalSpin.isWin ? finalWins : -wager);

				await this.db.setMemberSettings(guild.id, author.id, {
					bal: newBal,
				});
			}, 450);
		}, 2500);
	}

	public spinAgin: Component = async (ctx, [wager]) => {
		return this.chatInputRun(ctx, { wager: Number(wager) }, true);
	};

	public viewPrizeTable: Component = (ctx, [wager]) => {
		return {
			embeds: [
				{
					title: "Slots Prize Table",
					description: stripIndents`
						**Common**
						🍒: 2x, 3x
						🍌: 2x, 3x

						**Uncommon**
						🍉: 3x, 4x
						🍓: 3x, 4x

						**Rare**
						🍎: 5x, 6x
						🍇: 5x, 6x

						**Very Rare**
						🍐: 10x, 50x

						**Extremely Rare**
						💎: 50x, 100x
					`,
				},
			],
			components: [
				actionRow({
					context: wager,
					command: "slots",
					components: [
						button({
							method: this.spinAgin,
							label: "🎰",
							style: ButtonStyle.Secondary,
						}),
					],
				}),
			],
		};
	};

	private composeResultMessage(spin: SpinResult, winnings: number, wager: number, currency: string, balance: number) {
		if (spin.isJackpot)
			return stripIndents`
			...**JACKPOT**! You won ${currency} ${winnings.toLocaleString()}! 📈 **${balance.toLocaleString()} ➜ ${(balance + winnings).toLocaleString()}**
		`;
		if (spin.isWin)
			return stripIndents`
			...**won** ${currency} ${winnings.toLocaleString()}! 📈 **${balance.toLocaleString()} ➜ ${(balance + winnings).toLocaleString()}**
		`;
		return stripIndents`
			...**lost everything**! 📉 **${balance.toLocaleString()} ➜ ${(balance - wager).toLocaleString()}**
		`;
	}

	private spin(): SpinResult {
		const middleRow = Array.from({ length: 3 }, () => randomItem(shuffle(Constants.Slots.WeightedSymbols)));

		const row1 = randomNItems(Constants.Slots.Symbols, 3).join("⎪");
		const row2 = middleRow.join("⎪");
		const row3 = randomNItems(Constants.Slots.Symbols, 3).join("⎪");

		const isWin = new Set(middleRow).size < 3;
		const isJackpot = new Set(middleRow).size === 1;

		const winnings = isWin ? this.calculateWinnings(middleRow) : 0;

		return {
			render: stripIndents`
				${row1}

				${row2} **⇐**

				${row3}
			`,
			isWin,
			isJackpot,
			winnings,
		};
	}

	private composeComponents(context: string, wager: number, disabled = false) {
		return [
			actionRow({
				context,
				command: "slots",
				components: [
					button({
						method: this.spinAgin,
						label: `🎰 ${wager.toLocaleString()}`,
						style: ButtonStyle.Secondary,
						disabled,
					}),
					button({
						method: this.viewPrizeTable,
						label: "Chart",
						style: ButtonStyle.Secondary,
						disabled,
					}),
				],
			}),
		];
	}

	private calculateWinnings(row: string[]): number {
		const counts = row.reduce(
			(acc, symbol) => {
				acc[symbol] = (acc[symbol] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>,
		);

		const maxCount = Math.max(...Object.values(counts));
		if (maxCount < 2) return 0;

		const symbol = Object.keys(counts).find((s) => counts[s] === maxCount);

		if (!symbol) return 0;

		return Constants.Slots.Paytable[symbol][maxCount as 2 | 3];
	}

	private visualize(body: string, result = " ") {
		return stripIndents`
			**[ ${Constants.EmptyWhitespace}  ❘ ▪︎ ❘ 🎰 ❘ ▪︎ ❘ ${Constants.EmptyWhitespace}  ]**
				**‒‒‒‒‒‒‒‒‒‒‒‒**
				${body}
				**‒‒‒‒‒‒‒‒‒‒‒‒**
			**[ ${Constants.EmptyWhitespace}  ❘ ▪︎ ❘ 🎰 ❘ ▪︎ ❘ ${Constants.EmptyWhitespace}  ]**

			${result}
		`;
	}
}

interface Options {
	/* The amount of money you want to wager */
	wager: number;
}
