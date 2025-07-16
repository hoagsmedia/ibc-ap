import { mdsvex } from "mdsvex";
import adapter from "@sveltejs/adapter-vercel";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const config = {
	extensions: [".svelte", ".svx", ".md"],
	preprocess: [vitePreprocess(), mdsvex({ extensions: [".svx", ".md"] })],
	kit: { adapter: adapter() }
};

export default config;
