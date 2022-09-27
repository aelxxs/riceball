/**
 * Author: Alexis Vielma
 **/

import { write } from "@lib/data";

export default class implements Command {
	/**
	 * Change the color of your level card
	 *
	 * @param {Context} context
	 * @param {Options} options
	 **/
	public async chatInputRun({ t, member }: Context, { color }: Options) {
		if (!/^#?([\da-f]{6})$/i.test(color)) {
			throw "That is not a valid hex-code. Please try again.";
		}

		color = color.replace("#", "");

		await write(member, {
			card: { color },
		});

		return `Successully updated your level card's color to \`#${color}\`.`;
	}
}

interface Options {
	/* ? 6-digit hexadecimal number */
	color: string;
}
