// /  <reference types="svelte" />

declare namespace App {
	interface Locals {
		api: import("@discordjs/rest").REST;
		userApi: import("@discordjs/rest").REST;
		session: import("@auth/core/types").Session;
		gateway: import("@spectacles/brokers").Redis;
		db: import("@riceball/db").Database;
	}
}

declare module "colorthief" {
	export type RGBColor = [number, number, number];
	export default class ColorThief {
		getColor: (img: HTMLImageElement | null, quality = 10) => RGBColor | null;

		getPalette: (img: HTMLImageElement | null, colorCount = 10, quality = 10) => RGBColor[] | null;
	}
}
