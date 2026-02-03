import type { Actions, ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = async ({ locals, fetch }) => {
	return new Promise((resolve, _reject) => {
		resolve({});
	});
};

export const actions: Actions = {};
