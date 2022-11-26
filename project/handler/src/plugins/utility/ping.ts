export default class implements Command {
	public chatInputRun({ t }: Context) {
		// NOTE: i18n coming soon
		return t("Pong!");
	}
}
