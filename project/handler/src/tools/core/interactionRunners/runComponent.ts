import { Injectors } from "@lib/util";
import Client from "@spectacles/proxy";
import { APIMessageComponentInteraction, APIModalSubmitInteraction, Routes } from "discord-api-types/v10";
import { parseUniqueID, getGuild } from "@lib/core";
import { container } from "tsyringe";

export async function runComponent(interaction: APIMessageComponentInteraction | APIModalSubmitInteraction) {
	const plugins = container.resolve<Map<string, Command>>(Injectors.Plugins);
	const client = container.resolve<Client>(Injectors.Rest);

	const guild = await getGuild(interaction.guild_id!);

	interaction.member!.guild_id = guild.id;

	const ctx: Context = {
		member: interaction.member!,
		user: interaction!.member!.user,
		guild,
		t: (s: string) => s,
	};

	const { command, method, state } = parseUniqueID(interaction.data.custom_id);

	console.log({ command, method, state });
	if (!command || !method) return;

	const plugin = plugins.get(command);

	if (!plugin) return;

	const run = Reflect.get(plugin, method) as Component | undefined;

	if (run) {
		// @ts-ignore - This is a valid component
		const args = interaction.data.values ?? [state];

		const response = await run(ctx, args);

		return client.post(Routes.interactionCallback(interaction.id, interaction.token), {
			body: {
				type: 7,
				data: response,
			},
		});
	}
}
