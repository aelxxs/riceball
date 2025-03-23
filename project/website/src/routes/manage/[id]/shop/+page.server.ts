import type { Actions, ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = async ({ locals, fetch }) => {
  return new Promise((resolve, reject) => {
    resolve({});
  });
};

export const actions: Actions = {};
