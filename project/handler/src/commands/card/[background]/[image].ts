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

import { extname } from "node:path";
import { Database } from "@riceball/db";
import type { APIAttachment } from "discord-api-types/v10";
import { Constants } from "library/common";
import type { Command, Context } from "library/core";
import { inject, injectable } from "tsyringe";

@injectable()
export default class implements Command {
	private readonly validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

	public db: Database;

	public constructor(@inject(Database) db: Database) {
		this.db = db;
	}
	/**
	 * Set a custom background image for your leveling card
	 *
	 * @param {Context} context - The context of the command
	 * @param {Options} options - The options of the command
	 **/
	public async chatInputRun({ guild, author }: Context, { url, attachment, reset }: Options) {
		if (reset) {
			await this.db.setMemberSettings(guild.id, author.id, {
				card: { wrapperImage: null },
			});

			return "Reset your rank card's background image to default.";
		}

		this.validateImage(url, attachment);

		const wrapperImage = url ? url : attachment.url;

		await this.db.setMemberSettings(guild.id, author.id, {
			card: { wrapperImage },
		});

		return {
			embeds: [
				{
					description: `${Constants.Emoji.Success} Successfully set the background image for your rank card.`,
					image: { url: wrapperImage },
				},
			],
		};
	}

	private validateImage(url: string, attachment: APIAttachment): void {
		if (!url && !attachment) {
			throw "Please provide a valid URL or attachment.";
		}

		if (url && !this.validateUrl(url)) {
			throw "Please provide a valid image URL.\n\nOnly `.jpg`, `.jpeg`, `.png`, `.gif` and `.webp` are allowed.";
		}

		if (attachment && !this.validateUrl(attachment.url)) {
			throw "Please provide a valid image.\n\nOnly `.jpg`, `.jpeg`, `.png`, `.gif` and `.webp` are allowed.";
		}
	}

	private validateUrl(value: string): boolean {
		try {
			const url = new URL(value);

			const extension = extname(url.pathname);

			if (!this.validExtensions.includes(extension)) {
				return false;
			}
		} catch (e) {
			return false;
		}
		return true;
	}
}

interface Options {
	/* Provide the URL of the image to use as the background */
	url: string;
	/* Set the image as an attachment instead of a URL */
	attachment: APIAttachment;
	/* Reset the background image to default */
	reset: boolean;
}
