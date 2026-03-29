import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  optimizeDeps: {
    exclude: ["svelte-motion"],
  },
  build: {
    rollupOptions: {
      external: ["@riceball/db"],
    },
  },
});
