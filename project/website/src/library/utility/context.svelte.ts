// context for the save modal which appears
// when a form is tainted, it pops up at the bottom of the screen
// like discord's save modal
// since there is a save button, we need to pass in the form submit function
// and also a callback to reset the form's dirty state

import type { Icon } from "lucide-svelte";
import { getContext, setContext } from "svelte";
import type { ButtonVariant } from "$lib/blocks/button";
import type { DashboardGuild, ManagedGuild } from "$lib/types";

type SaveModalProps = {
	save: () => void;
	undo: () => void;
	delayed: boolean;
	submitting: boolean;
};

class SaveModalState {
	public show = $state(false);
	public save = $state(() => {});
	public undo = $state(() => {});
	public delayed = $state(false);
	public submitting = $state(false);

	public showModal = (props: SaveModalProps) => {
		this.show = true;
		this.save = props.save;
		this.undo = props.undo;
		this.delayed = props.delayed;
		this.submitting = props.submitting;
	};

	public hideModal = () => {
		this.show = false;
	};
}

export const saveModal = new SaveModalState();

export const getSaveModal = () => {
	return saveModal;
};

export const shake = $state({
	shake: false,
});

export const layoutState = $state({
	sideBarOpen: false,
	scrollY: 0,
	showControlsInHeader: false,
});

const guildContextSymbol = Symbol("guildContext");

export const getGuild = () => {
	return getContext<DashboardGuild>(guildContextSymbol);
};

export const setGuild = (guild: DashboardGuild) => {
	setContext(guildContextSymbol, guild);
};

const guildsContextSymbol = Symbol("guildsContext");

export const getGuilds = () => {
	return getContext<ManagedGuild[]>(guildsContextSymbol);
};

export const setGuilds = (guilds: ManagedGuild[]) => {
	setContext(guildsContextSymbol, guilds);
};

type Control = {
	icon?: typeof Icon;
	label: string;
	handler: () => void;
	variant?: ButtonVariant;
};

class AppState {
	/**
	 * The controls to show in the header
	 *
	 * A control is an object with a label and an onClick function,
	 * rendering a button with the label that calls the onClick function
	 *
	 * The controls are shown in the header when `showControls` is true
	 */
	public controls = $state<Control[]>([]);
	/**
	 * Whether the controls are shown in the header
	 */
	public showControls = $state(false);

	/**
	 * The title of the controls
	 */
	public controlTitle = $state({
		value: "",
	});

	public setControlTitle = (title: string) => {
		this.controlTitle.value = title;
	};

	public setControlsVisible = (visible: boolean) => {
		this.showControls = visible;
	};

	public setControls = (controls: Control[]) => {
		this.controls = controls;
	};

	public destroyControls = () => {
		this.setControlsVisible(false);
		this.setControls([]);
	};
}

export const appState = new AppState();

export const getAppState = () => {
	return appState;
};
