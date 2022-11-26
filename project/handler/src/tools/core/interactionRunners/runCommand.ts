import { Injectors, logger } from "@lib/util";
import { Client } from "@spectacles/proxy";
import {
	ApplicationCommandType,
	Routes,
	type APIApplicationCommandInteraction,
	type APIChatInputApplicationCommandInteraction,
} from "discord-api-types/v10";
import { container } from "tsyringe";
import { getCommandName, getGuild, transformInteraction } from "../";

export async function runCommand(interaction: APIChatInputApplicationCommandInteraction) {
	const plugins = container.resolve<Map<string, Command>>(Injectors.Plugins);
	const discord = container.resolve<Client>(Injectors.Rest);

	if (interaction.data.type === ApplicationCommandType.ChatInput) {
		const name = getCommandName(interaction);

		const command = plugins.get(name);
		const context = await createContext(interaction);
		const options = transformInteraction(interaction);

		if (command?.chatInputRun) {
			try {
				const output = await command.chatInputRun(context, options);

				if (typeof output === "string") {
					return discord.post(Routes.interactionCallback(interaction.id, interaction.token), {
						body: {
							type: 4,
							data: {
								embeds: [
									{
										color: 12704186,
										description: `${output}`,
									},
								],
							},
						},
					});
				}

				if (typeof output === "object") {
					console.dir(output, { depth: null });

					// @ts-ignore skjsksjhs
					if (output?.files) {
						return discord.post(
							Routes.interactionCallback(interaction.id, interaction.token),
							{
								body: {
									type: 4,
									data: {
										content: "test",
										...output,
									},
								},
							},
							{
								// @ts-ignore sjdhksjdh
								"content-type": "multipart/form-data",
							}
						);
					}
					// @ts-ignore skjsksjhs
					if (output?.components) {
						console.log("sending");
						return discord.post(Routes.interactionCallback(interaction.id, interaction.token), {
							body: {
								type: 4,
								data: {
									...output,
								},
							},
						});
					}
					return discord.post(Routes.interactionCallback(interaction.id, interaction.token), {
						body: {
							type: 4,
							data: {
								embeds: [output],
							},
						},
					});
				}
			} catch (error) {
				if (error instanceof Error) {
					logger.error(error);

					return discord.post(Routes.interactionCallback(interaction.id, interaction.token), {
						body: {
							type: 4,
							data: {
								embeds: [
									{
										color: 15755126,
										description: `An unexpected error occured. Please try again.`,
									},
								],
							},
						},
					});
				}

				return discord.post(Routes.interactionCallback(interaction.id, interaction.token), {
					body: {
						type: 4,
						data: {
							embeds: [
								{
									color: 15755126,
									description: `${error}`,
								},
							],
						},
					},
				});
			}
		}
	}
}

function handleCommandResponse(res: any) {
	console.log({ res });
}

async function createContext(interaction: APIApplicationCommandInteraction): Promise<Context> {
	const guild = await getGuild(interaction.guild_id!);

	interaction.member!.guild_id = guild.id;

	return {
		guild,
		member: interaction.member!,
		user: interaction.member!.user,
		t: (s) => s,
	};
}
