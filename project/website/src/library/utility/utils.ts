import type { ItemizedChannels } from "$lib/types";

export const getRandomChannelFromItemizedChannelList = (itemizedChannels: ItemizedChannels) => {
	const flattedChannels = itemizedChannels.flatMap((channel) => {
		if ("items" in channel) {
			return channel.items;
		}
		return channel;
	});

	const randomIndex = Math.floor(Math.random() * flattedChannels.length);

	return flattedChannels[randomIndex];
};

export const getFirstChannelFromItemizedChannelList = (itemizedChannels: ItemizedChannels) => {
	const flattedChannels = itemizedChannels.flatMap((channel) => {
		if ("items" in channel) {
			return channel.items;
		}
		return channel;
	});

	return flattedChannels[0];
};
