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

import { bold, codeBlock, subtext } from "@discordjs/formatters";
import { getGuild } from "@riceball/db";
import { stripIndents } from "common-tags";
import { Constants } from "library/common";
import type { Command, Context } from "library/core";
import { formatBoolean, formatEconomyRate } from "library/utilities/formatters";

export default class implements Command {
	/**
	 * View your server's Economy settings
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ guild }: Context) {
		const { economy } = await getGuild(guild.id);

		// 	economy: {
		//     enabled: true,
		//     currencyName: null,
		//     currencyIcon: '💴',
		//     inventorySize: 10,
		//     wagerMin: 1,
		//     wagerMax: 0,
		//     dailyRewardMin: 5,
		//     dailyRewardMax: 25,
		//     textRateMin: 5,
		//     textRateMax: 25,
		//     textCooldown: 25,
		//     allowNegativeBalance: false,
		//     negativeBalanceLimit: 0,
		//     defaultBalance: 0,
		//     debugMode: false,
		//     clearOnLeave: false,
		//     autoUseItems: false,
		//     roleRestriction: null,
		//     channelRestriction: null
		// }

		return {
			title: "Economy",
			description: stripIndents`
				${subtext("View and edit your server's Economy settings.")}

				${economy.enabled ? "" : `${bold("Note")}: The Economy plugin is disabled in this server.`}
			`,
			fields: [
				{
					name: "Enabled",
					value: formatBoolean(economy.enabled),
					inline: true,
				},
				{
					name: "Currency Name",
					value: economy.currencyName || "None",
					inline: true,
				},
				{
					name: "Currency Icon",
					value: economy.currencyIcon,
					inline: true,
				},
				{
					name: "Inventory Size",
					value: economy.inventorySize.toString(),
					inline: true,
				},
				{
					name: "Wager Min",
					value: economy.wagerMin.toString(),
					inline: true,
				},
				{
					name: "Wager Max",
					value: economy.wagerMax.toString(),
					inline: true,
				},

				{
					name: "Daily Reward",
					value: stripIndents`
						${subtext("How much users earn from the daily reward.")}
						${bold(
							economy.dailyRewardMin === economy.dailyRewardMax
								? economy.dailyRewardMin.toString()
								: `${economy.dailyRewardMin}–${economy.dailyRewardMax}`,
						)}
					`,
				},

				{
					name: "Text Rate",
					value: stripIndents`
						${subtext("The rate at which users earn currency for sending messages.")}
						${formatEconomyRate(economy.textRateMin, economy.textRateMax, economy.textCooldown)}
					`,
				},

				{
					name: "Negative Balance",
					value: subtext("Configure the negative balance settings."),
				},

				{
					name: "",
					value: formatBoolean(economy.allowNegativeBalance),
					inline: true,
				},
				{
					name: "",
					value: economy.negativeBalanceLimit.toString(),
					inline: true,
				},
				{
					name: "",
					value: "",
					inline: true,
				},

				{
					name: "Default Balance",
					value: economy.defaultBalance.toString(),
					inline: true,
				},
				{
					name: "Advanced Settings",
					value: subtext("Configure advanced settings for the Economy plugin."),
				},
				{
					name: "Clear On Leave",
					value: formatBoolean(economy.clearOnLeave),
					inline: true,
				},
				{
					name: "Auto Use Items",
					value: formatBoolean(economy.autoUseItems),
					inline: true,
				},
				{
					name: "Debug Mode",
					value: formatBoolean(economy.debugMode),
					inline: true,
				},
				{
					name: "Restrictions",
					value: stripIndents`
								${subtext("Allow or deny roles, users, or channels from using the starboard.")}
								${codeBlock(
									"yaml",
									stripIndents`
										Roles    :: ${economy.roleRestriction?.omit.length ?? 0} ${economy.roleRestriction?.type ?? "Not Set"}
										Channels :: ${economy.channelRestriction?.omit.length ?? 0} ${economy.channelRestriction?.type ?? "Not Set"}
									`,
								)}
							`,
				},
			],
		};
	}
}
