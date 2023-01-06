import { type APIInteraction, InteractionType, APIChatInputApplicationCommandInteraction } from "discord-api-types/v10";
import { runCommand, Event, runAutocomplete, runComponent } from "@lib/core";

export default class implements Event {
	public exec(interaction: APIInteraction) {
		switch (interaction.type) {
			case InteractionType.ApplicationCommand: {
				return runCommand(interaction as APIChatInputApplicationCommandInteraction);
			}
			case InteractionType.ApplicationCommandAutocomplete: {
				return runAutocomplete(interaction);
			}
			case InteractionType.MessageComponent:
			case InteractionType.ModalSubmit: {
				return runComponent(interaction);
			}
			case InteractionType.Ping: {
				break;
			}
		}
	}
}
