// - Icons
import { Workflow, type Icon as IconType } from "lucide-svelte";
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
  ReactionRolesEdit: (guildID: string, reactionRoleID: string) => `/manage/${guildID}/reaction-roles/${reactionRoleID}`,
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
        desc: "Configure your server settings.",
      },
      {
        name: "Settings",
        link: `/manage/${guildID}/settings`,
        icon: SettingsIcon,
        desc: "Configure your server settings.",
      },
      {
        name: "Leaderboard",
        link: `/manage/${guildID}/leaderboard`,
        icon: AwardIcon,
        desc: "Configure your server leaderboard.",
      },
    ],
    plugins: [
      {
        id: "economy",
        name: "Shop",
        link: `/manage/${guildID}/shop`,
        icon: ShoppingCartIcon,
        desc: "Configure your server's shop.",
      },
      {
        id: "economy",
        name: "Economy",
        link: `/manage/${guildID}/economy`,
        icon: LandmarkIcon,
        desc: "Configure your server's economy.",
      },
      {
        id: "levels",
        name: "Leveling",
        link: `/manage/${guildID}/leveling`,
        icon: ChartAreaIcon,
        desc: "Configure your server's leveling settings.",
      },
      {
        id: "stars",
        name: "Starboard",
        link: `/manage/${guildID}/starboard`,
        icon: StarIcon,
        desc: "Configure your server's starboard.",
      },
      {
        name: "Reaction Roles",
        link: `/manage/${guildID}/reaction-roles`,
        icon: SmileIcon,
        desc: "Configure your server's reaction roles.",
      },
    ],
    utilities: [
      {
        name: "Automations",
        link: `/manage/${guildID}/automations`,
        icon: Workflow,
        desc: "Configure your server's automations.",
      },
      {
        name: "Embeds & Messages",
        link: `/manage/${guildID}/embeds`,
        icon: LayoutIcon,
        desc: "Configure your server's embeds.",
      },
      {
        name: "Custom Commands",
        link: `/manage/${guildID}/custom-commands`,
        icon: EditIcon,
        desc: "Configure your server's custom commands.",
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
