/**
 * Author: Alexis Vielma
 **/

import { write } from "@lib/data";

export default class implements Command {
	/**
	 * Change the opacity of your level card
	 *
	 * @param {Context} context
	 * @param {Options} options
	 **/
	public async chatInputRun({ t, member }: Context, { opacity }: Options) {
		await write(member, {
			card: {
				opacity: opacity / 100,
			},
		});

		return `Successully updated your level card's opacuty to \`${opacity}%\`.`;
	}
}

interface Options {
	/* ? The opacity as a percentage */
	opacity: number;
}
