import { write } from "#lib/db";

export default class implements Command {
	public async exec({ t, member }: Context, { color }: Args) {
		await write(member, { card: { color } });

		return t("@success", { color });
	}
}

interface Args {
	color: string;
}
