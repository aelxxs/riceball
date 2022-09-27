/**
 * Author: Alexis Vielma
 **/

import { write } from "@lib/data";

export default class implements Command {
	/**
	 * Change the theme of your level card
	 *
	 * @param {Context} context
	 * @param {Options} options
	 **/
	public async chatInputRun({ t, member }: Context, { theme }: Options) {
		if (!/^#?([\da-f]{6})$/i.test(theme)) {
			throw "That is not a valid hex-code. Please try again.";
		}

		theme = theme.replace("#", "");

		await write(member, {
			card: { theme },
		});

		return `Successully updated your level card's theme color to \`#${theme}\``;
	}
}

interface Options {
	/* ? 6-digit hexadecimal number */
	theme: string;
}
