/**
 * Author: Alexis Vielma
 **/

import { write } from "@lib/data";
import type { APIAttachment } from "discord-api-types/v10";
import { extname } from "path";

const validExt = [".png", ".jpg", ".jpeg", ".gif"];

export default class implements Command {
	/**
	 * Change the background image of your level card
	 *
	 * @param {Context} context
	 * @param {Options} options
	 **/
	public async chatInputRun({ t, member }: Context, { background }: Options) {
		if (!validExt.includes(extname(background.url))) {
			throw "Invalid file format provided. Please upload one of the following:\n `.png`, `.jpg`, `.jpeg`, or `.gif`.";
		}

		await write(member, {
			card: {
				background: background.url,
			},
		});

		return `Successfully updated your level card's background.`;
	}
}

interface Options {
	/* ? An image attachment of at least 760x224 px */
	background: APIAttachment;
}
