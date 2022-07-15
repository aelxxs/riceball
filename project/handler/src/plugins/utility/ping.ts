export default class implements Command {
	public exec({ t }: Context) {
		// NOTE: i18n coming soon
		return t("Pong!");
	}
}
