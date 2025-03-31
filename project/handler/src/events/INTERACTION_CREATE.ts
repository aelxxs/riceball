import { isGuildInteraction } from "discord-api-types/utils/v10";
import { type APIInteraction, InteractionType } from "discord-api-types/v10";
import { type Event, reply, runAutocomplete, runCommand, runComponent } from "library/core";

export default class implements Event {
	public exec(interaction: APIInteraction) {
		if (!isGuildInteraction(interaction)) {
			return reply(interaction, "Commands are not supported in DMs", {
				prefix: "error",
				ephemeral: true,
			});
		}

		switch (interaction.type) {
			case InteractionType.ApplicationCommand: {
				return runCommand(interaction);
			}
			case InteractionType.MessageComponent:
			case InteractionType.ModalSubmit: {
				return runComponent(interaction);
			}
			case InteractionType.ApplicationCommandAutocomplete: {
				return runAutocomplete(interaction);
			}
		}
	}
}
