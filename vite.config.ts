import tailwindcss from '@tailwindcss/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { galleryBannerTravelManifest } from './vite-plugins/gallery-banner-travel-manifest';

export default defineConfig({
	plugins: [tailwindcss(), galleryBannerTravelManifest(), sveltekit()],
	server: {
		// Allow opening the dev server by LAN IP / hostname (e.g. iPhone on same Wi‑Fi).
		// Use `pnpm dev:host` so Vite binds to all interfaces (`--host`).
		allowedHosts: true
	},
	// LayerChart ships `.svelte` in `node_modules`; let Vite transform it during SSR (not raw Node ESM).
	ssr: {
		noExternal: ['layerchart']
	},
	test: {
		workspace: [
			{
				extends: './vite.config.ts',
				plugins: [svelteTesting()],
				test: {
					name: 'client',
					environment: 'jsdom',
					clearMocks: true,
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
					setupFiles: ['./vitest-setup-client.ts']
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
