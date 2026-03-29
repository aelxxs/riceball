export type ThemeMode = "dark" | "light";

export const THEME_STORAGE_KEY = "riceball-theme";
export const THEME_CHANGE_EVENT = "riceball-theme-change";
const THEME_TRANSITION_ATTR = "data-theme-changing";

// Legacy contract in this codebase: `:root[dark]` maps to light mode.
const ROOT_LIGHT_ATTR = "dark";

const isThemeMode = (value: string | null): value is ThemeMode => {
	return value === "dark" || value === "light";
};

const getRoot = (): HTMLElement | null => {
	if (typeof document === "undefined") {
		return null;
	}

	return document.documentElement;
};

export const getActiveTheme = (): ThemeMode => {
	const root = getRoot();
	if (!root) {
		return "dark";
	}

	return root.hasAttribute(ROOT_LIGHT_ATTR) ? "light" : "dark";
};

const applyThemeToRoot = (theme: ThemeMode): void => {
	const root = getRoot();
	if (!root) {
		return;
	}

	root.setAttribute("data-theme", theme);

	if (theme === "light") {
		root.setAttribute(ROOT_LIGHT_ATTR, "");
		return;
	}

	root.removeAttribute(ROOT_LIGHT_ATTR);
};

const suppressTransitions = (callback: () => void): void => {
	const root = getRoot();
	if (!root) {
		callback();
		return;
	}

	root.setAttribute(THEME_TRANSITION_ATTR, "");
	callback();

	if (typeof window === "undefined") {
		root.removeAttribute(THEME_TRANSITION_ATTR);
		return;
	}

	window.requestAnimationFrame(() => {
		window.requestAnimationFrame(() => {
			root.removeAttribute(THEME_TRANSITION_ATTR);
		});
	});
};

const emitThemeChange = (theme: ThemeMode): void => {
	if (typeof window === "undefined") {
		return;
	}

	window.dispatchEvent(
		new CustomEvent<{ theme: ThemeMode }>(THEME_CHANGE_EVENT, {
			detail: { theme },
		}),
	);
};

export const setTheme = (theme: ThemeMode): ThemeMode => {
	if (typeof window !== "undefined") {
		window.localStorage.setItem(THEME_STORAGE_KEY, theme);
	}

	suppressTransitions(() => {
		applyThemeToRoot(theme);
	});
	emitThemeChange(theme);
	return theme;
};

export const toggleTheme = (): ThemeMode => {
	const nextTheme = getActiveTheme() === "dark" ? "light" : "dark";
	return setTheme(nextTheme);
};

export const initializeTheme = (): ThemeMode => {
	if (typeof window === "undefined") {
		return "dark";
	}

	const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
	if (isThemeMode(savedTheme)) {
		applyThemeToRoot(savedTheme);
		emitThemeChange(savedTheme);
		return savedTheme;
	}

	const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
	const initialTheme: ThemeMode = prefersLight ? "light" : "dark";
	applyThemeToRoot(initialTheme);
	window.localStorage.setItem(THEME_STORAGE_KEY, initialTheme);
	emitThemeChange(initialTheme);
	return initialTheme;
};
