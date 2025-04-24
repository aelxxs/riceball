// - Icons
import { type Icon as IconType, Workflow } from "lucide-svelte";
import AwardIcon from "lucide-svelte/icons/award";
import ChartAreaIcon from "lucide-svelte/icons/chart-area";
import ChartPieIcon from "lucide-svelte/icons/chart-pie";
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
	extendedInfo: {
		title: string;
		description: string;
	};
};

export type SidebarRoutes = {
	[key: string]: SidebarRoute[];
};

export const getDefaultSidebarRoute = (guildID: string) => {
	const routes = generateSidebarRoutes(guildID);

	return routes.dashboard.filter((route) => route.name === "Settings")[0];
};

export const WebsiteRoutes = {
	home: "/",
	Shop: (guildID: string) => `/manage/${guildID}/shop`,
	Leveling: (guildID: string) => `/manage/${guildID}/leveling`,
	Starboard: (guildID: string) => `/manage/${guildID}/starboard`,
	Economy: (guildID: string) => `/manage/${guildID}/economy`,
	ReactionRoles: (guildID: string) => `/manage/${guildID}/reaction-roles`,
	ReactionRolesCreate: (guildID: string) => `/manage/${guildID}/reaction-roles/create`,
	ReactionRolesEdit: (guildID: string, reactionRoleID: string) =>
		`/manage/${guildID}/reaction-roles/${reactionRoleID}`,
	Embeds: (guildID: string) => `/manage/${guildID}/embeds`,
	EmbedsCreate: (guildID: string) => `/manage/${guildID}/embeds/create`,
	EmbedsEdit: (guildID: string, embedID: string) => `/manage/${guildID}/embeds/${embedID}`,
	CustomCommands: (guildID: string) => `/manage/${guildID}/custom-commands`,
};

export const generateSidebarRoutes = (guildID: string) => {
	return {
		dashboard: [
			{
				name: "Plugins",
				link: `/manage/${guildID}`,
				icon: SettingsIcon,
				desc: "Configure your server plugins.",
				extendedInfo: {
					title: "Plugin Overview",
					description:
						"Browse and manage all available plugins for your server. Enable, disable, or configure features to enhance your community's experience.",
				},
			},
			{
				name: "Settings",
				link: `/manage/${guildID}/settings`,
				icon: SettingsIcon,
				desc: "Configure your server settings.",
				extendedInfo: {
					title: "Server Settings",
					description:
						"Adjust core server settings including moderation, permissions, notifications, and more. Ensure your server runs smoothly and securely.",
				},
			},
			{
				name: "Leaderboard",
				link: `/manage/${guildID}/leaderboard`,
				icon: AwardIcon,
				desc: "Configure your server leaderboard.",
				extendedInfo: {
					title: "Leaderboard Management",
					description:
						"View and customize the server leaderboard. Track member activity, reward top contributors, and foster friendly competition.",
				},
			},
		],
		plugins: [
			{
				id: "economy",
				name: "Shop",
				link: `/manage/${guildID}/shop`,
				icon: ShoppingCartIcon,
				desc: "Configure your server's shop.",
				extendedInfo: {
					title: "Virtual Shop",
					description:
						"Set up and manage the in-server shop. Create custom items, set prices, and allow members to purchase with virtual currency.",
				},
			},
			{
				id: "economy",
				name: "Economy",
				link: `/manage/${guildID}/economy`,
				icon: LandmarkIcon,
				desc: "Configure your server's economy.",
				extendedInfo: {
					title: "Economy System",
					description:
						"Manage your server's virtual economy. Set up earning methods, adjust currency settings, and monitor transactions.",
				},
			},
			{
				id: "levels",
				name: "Leveling",
				link: `/manage/${guildID}/leveling`,
				icon: ChartAreaIcon,
				desc: "Configure your server's leveling settings.",
				extendedInfo: {
					title: "Leveling System",
					description:
						"Enable and customize the leveling system. Reward active members with XP, roles, and perks as they participate in your server.",
				},
			},
			{
				id: "stars",
				name: "Starboard",
				link: `/manage/${guildID}/starboard`,
				icon: StarIcon,
				desc: "Configure your server's starboard.",
				extendedInfo: {
					title: "Starboard",
					description:
						"Highlight the best messages in your server. Customize star thresholds and manage featured content.",
				},
			},
			{
				name: "Reaction Roles",
				link: `/manage/${guildID}/reaction-roles`,
				icon: SmileIcon,
				desc: "Configure your server's reaction roles.",
				extendedInfo: {
					title: "Reaction Roles",
					description:
						"Allow members to assign themselves roles by reacting to messages. Create, edit, and manage role menus easily.",
				},
			},
		],
		utilities: [
			{
				name: "Automations",
				link: `/manage/${guildID}/automations`,
				icon: Workflow,
				desc: "Configure your server's automations.",
				extendedInfo: {
					title: "Server Automations",
					description:
						"Set up automated actions and workflows. Automate moderation, welcome messages, and more to streamline server management.",
				},
			},
			{
				name: "Embeds & Messages",
				link: `/manage/${guildID}/embeds`,
				icon: LayoutIcon,
				desc: "Configure your server's embeds.",
				extendedInfo: {
					title: "Embeds & Messages",
					description:
						"Design and schedule custom embedded messages. Enhance announcements, welcome messages, and server updates.",
				},
			},
			{
				name: "Custom Commands",
				link: `/manage/${guildID}/custom-commands`,
				icon: EditIcon,
				desc: "Configure your server's custom commands.",
				extendedInfo: {
					title: "Custom Commands",
					description:
						"Create and manage custom commands for your server. Automate responses, provide information, and engage your community.",
				},
			},
		],
	} as SidebarRoutes;
};

export const Constants = {
	EmptyEmbed: {
		title: "",
		description: "",
		color: 5072614,
		fields: [],
		author: {
			name: "",
			url: "",
			icon_url: "",
		},
		footer: {
			text: "",
			icon_url: "",
		},
		image: {
			url: "",
		},
		thumbnail: {
			url: "",
		},
		url: "",
		timestamp: "",
	},
};
