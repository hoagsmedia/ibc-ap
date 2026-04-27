import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

const VIRTUAL_ID = "virtual:gallery-banner-travel-files";
const RESOLVED_ID = "\0" + VIRTUAL_ID;

/**
 * Lists `static/banner-travel/*.{jpg,jpeg}` at **bundle time** (dev + build).
 * Vercel serverless handlers do not reliably have `static/` on disk at request time,
 * so the gallery must not use `fs.readdir` in `+page.server.ts`.
 */
export function galleryBannerTravelManifest(): Plugin {
	return {
		name: "gallery-banner-travel-manifest",
		resolveId(id) {
			if (id === VIRTUAL_ID) return RESOLVED_ID;
		},
		load(id) {
			if (id !== RESOLVED_ID) return;

			const dir = path.resolve(process.cwd(), "static/banner-travel");
			let files: string[] = [];
			try {
				files = fs.readdirSync(dir).filter((f) => /\.(jpe?g)$/i.test(f));
			} catch {
				files = [];
			}
			files.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

			return `export default ${JSON.stringify(files)};`;
		}
	};
}
