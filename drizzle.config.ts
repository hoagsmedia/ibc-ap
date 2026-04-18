import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";
import path from "path";

// Load .env first, then .env.local so local overrides (same as typical app behavior)
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// One config, one output dir. Target is chosen by env:
//   no TARGET or TARGET=local → DATABASE_URL (local)
//   TARGET=dev  → DATABASE_URL_DEV (Neon dev)
//   TARGET=prod → DATABASE_URL_PROD (Neon prod)
const target = process.env.TARGET || "local";
const url =
	target === "dev"
		? process.env.DATABASE_URL_DEV
		: target === "prod"
			? process.env.DATABASE_URL_PROD
			: process.env.DATABASE_URL;

if (!url) {
	const varName = target === "local" ? "DATABASE_URL" : `DATABASE_URL_${target.toUpperCase()}`;
	const hint = target === "local" ? ".env.local or .env" : ".env";
	throw new Error(`${varName} is not set. Add it to ${hint}. See .env.example.`);
}

export default defineConfig({
	schema: "./src/lib/server/db/schema.ts",
	dialect: "postgresql",
	dbCredentials: { url },
	verbose: true,
	strict: true,
	out: "./drizzle",
});
