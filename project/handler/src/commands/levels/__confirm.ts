import type { REST } from "@discordjs/rest";
import { type APIInteraction, ButtonStyle, InteractionResponseType, Routes } from "discord-api-types/v10";
import { Constants, Deps } from "library/common";
import { actionRow, button } from "library/components";
import { type Context, reply } from "library/core";
import { container } from "tsyringe";

export const CONFIRM_TIMEOUT = 5 * 60;

/**
 * Confirm and cancel buttons routed to the `confirm` and `cancel` components of a command.
 */
export const confirmationRow = (command: string, state: string) =>
	actionRow({
		command,
		context: state,
		components: [
			button({ method: "confirm", label: "Confirm", style: ButtonStyle.Danger }),
			button({ method: "cancel", label: "Cancel" }),
		],
	});

/**
 * Whether the member pressing a confirmation button is the one who asked for it, telling them otherwise.
 */
export const isRequester = async (ctx: Context, requesterId: string) => {
	if (ctx.author.id === requesterId) return true;

	await reply(ctx.i, "Only the member who ran this command can use these buttons.", { prefix: "error" });
	return false;
};

/**
 * Whether the message holding a confirmation prompt is older than {@link CONFIRM_TIMEOUT}.
 */
export const isExpired = ({ i }: Context) => {
	if (!("message" in i) || !i.message) return false;

	const age = Date.now() - Date.parse(i.message.edited_timestamp ?? i.message.timestamp);
	return age > CONFIRM_TIMEOUT * 1000;
};

/**
 * Acknowledges a component so slow work can run before the message is edited.
 */
export const deferUpdate = (interaction: APIInteraction) => {
	const rest = container.resolve<REST>(Deps.Rest);

	return rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
		body: { type: InteractionResponseType.DeferredMessageUpdate },
	});
};

/**
 * A finished confirmation prompt, with its buttons removed.
 */
export const closed = (description: string, prefix: "success" | "error" | null = "success") => {
	const emoji = prefix === "success" ? Constants.Emoji.Success : prefix === "error" ? Constants.Emoji.Error : "";

	return {
		embeds: [{ description: `${emoji} ${description}`.trim() }],
		components: [],
	};
};

export const EXPIRED_MESSAGE = "This confirmation has expired. Run the command again.";
