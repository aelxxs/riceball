// - Icons
import { type Icon as IconType, Workflow } from "lucide-svelte";
import AwardIcon from "lucide-svelte/icons/award";
import ChartAreaIcon from "lucide-svelte/icons/chart-area";
import EditIcon from "lucide-svelte/icons/edit";
import LandmarkIcon from "lucide-svelte/icons/landmark";
import LayoutIcon from "lucide-svelte/icons/layout";
import SettingsIcon from "lucide-svelte/icons/settings";
import ShoppingCartIcon from "lucide-svelte/icons/shopping-cart";
import SmileIcon from "lucide-svelte/icons/smile";
import StarIcon from "lucide-svelte/icons/star";

export type SidebarRoute = {
	name: string;
	link: string;
	icon: typeof IconType;
	desc: string;
	id?: string;
	extendedInfo: { title: string; description: string };
};

export type SidebarRoutes = { [key: string]: SidebarRoute[] };

export const getDefaultSidebarRoute = (guildID: string) => {
	const routes = generateSidebarRoutes(guildID);

	return routes.dashboard.filter((route) => route.name === "Settings")[0];
};

export const WebsiteRoutes = {
	CustomCommands: (guildID: string) => `/manage/${guildID}/custom-commands`,
	Economy: (guildID: string) => `/manage/${guildID}/economy`,
	Embeds: (guildID: string) => `/manage/${guildID}/embeds`,
	EmbedsCreate: (guildID: string) => `/manage/${guildID}/embeds/create`,
	EmbedsEdit: (guildID: string, embedID: string) => `/manage/${guildID}/embeds/${embedID}`,
	home: "/",
	Leveling: (guildID: string) => `/manage/${guildID}/leveling`,
	Profile: "/profile",
	ReactionRoles: (guildID: string) => `/manage/${guildID}/reaction-roles`,
	ReactionRolesCreate: (guildID: string) => `/manage/${guildID}/reaction-roles/create`,
	ReactionRolesEdit: (guildID: string, reactionRoleID: string) =>
		`/manage/${guildID}/reaction-roles/${reactionRoleID}`,
	Shop: (guildID: string) => `/manage/${guildID}/shop`,
	Starboard: (guildID: string) => `/manage/${guildID}/starboard`,
};

export const generateSidebarRoutes = (guildID: string) => {
	return {
		dashboard: [
			{
				desc: "Configure your server plugins.",
				extendedInfo: {
					description:
						"Browse and manage all available plugins for your server. Enable, disable, or configure features to enhance your community's experience.",
					title: "Plugin Overview",
				},
				icon: SettingsIcon,
				link: `/manage/${guildID}`,
				name: "Plugins",
			},
			{
				desc: "Configure your server settings.",
				extendedInfo: {
					description:
						"Adjust core server settings including moderation, permissions, notifications, and more. Ensure your server runs smoothly and securely.",
					title: "Server Settings",
				},
				icon: SettingsIcon,
				link: `/manage/${guildID}/settings`,
				name: "Settings",
			},
			{
				desc: "Configure your server leaderboard.",
				extendedInfo: {
					description:
						"View and customize the server leaderboard. Track member activity, reward top contributors, and foster friendly competition.",
					title: "Leaderboard Management",
				},
				icon: AwardIcon,
				link: `/manage/${guildID}/leaderboard`,
				name: "Leaderboard",
			},
		],
		plugins: [
			{
				desc: "Configure your server's shop.",
				extendedInfo: {
					description:
						"Set up and manage the in-server shop. Create custom items, set prices, and allow members to purchase with virtual currency.",
					title: "Virtual Shop",
				},
				icon: ShoppingCartIcon,
				id: "economy",
				link: `/manage/${guildID}/shop`,
				name: "Shop",
			},
			{
				desc: "Configure your server's economy.",
				extendedInfo: {
					description:
						"Manage your server's virtual economy. Set up earning methods, adjust currency settings, and monitor transactions.",
					title: "Economy System",
				},
				icon: LandmarkIcon,
				id: "economy",
				link: `/manage/${guildID}/economy`,
				name: "Economy",
			},
			{
				desc: "Configure your server's leveling settings.",
				extendedInfo: {
					description:
						"Enable and customize the leveling system. Reward active members with XP, roles, and perks as they participate in your server.",
					title: "Leveling System",
				},
				icon: ChartAreaIcon,
				id: "levels",
				link: `/manage/${guildID}/leveling`,
				name: "Leveling",
			},
			{
				desc: "Configure your server's starboard.",
				extendedInfo: {
					description:
						"Highlight the best messages in your server. Customize star thresholds and manage featured content.",
					title: "Starboard",
				},
				icon: StarIcon,
				id: "stars",
				link: `/manage/${guildID}/starboard`,
				name: "Starboard",
			},
			{
				desc: "Configure your server's reaction roles.",
				extendedInfo: {
					description:
						"Allow members to assign themselves roles by reacting to messages. Create, edit, and manage role menus easily.",
					title: "Reaction Roles",
				},
				icon: SmileIcon,
				link: `/manage/${guildID}/reaction-roles`,
				name: "Reaction Roles",
			},
		],
		utilities: [
			{
				desc: "Configure your server's automations.",
				extendedInfo: {
					description:
						"Set up automated actions and workflows. Automate moderation, welcome messages, and more to streamline server management.",
					title: "Server Automations",
				},
				icon: Workflow,
				link: `/manage/${guildID}/automations`,
				name: "Automations",
			},
			{
				desc: "Configure your server's embeds.",
				extendedInfo: {
					description:
						"Design and schedule custom embedded messages. Enhance announcements, welcome messages, and server updates.",
					title: "Embeds & Messages",
				},
				icon: LayoutIcon,
				link: `/manage/${guildID}/embeds`,
				name: "Embeds & Messages",
			},
			{
				desc: "Configure your server's custom commands.",
				extendedInfo: {
					description:
						"Create and manage custom commands for your server. Automate responses, provide information, and engage your community.",
					title: "Custom Commands",
				},
				icon: EditIcon,
				link: `/manage/${guildID}/custom-commands`,
				name: "Custom Commands",
			},
		],
	} as SidebarRoutes;
};

export const Constants = {
	EmptyEmbed: {
		author: { icon_url: "", name: "", url: "" },
		color: 5072614,
		description: "",
		fields: [],
		footer: { icon_url: "", text: "" },
		image: { url: "" },
		thumbnail: { url: "" },
		timestamp: "",
		title: "",
		url: "",
	},
};
