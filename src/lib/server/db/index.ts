import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Resolve from repo root — relative ".env.local" breaks when cwd is not the project root.
const _root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
dotenv.config({ path: path.join(_root, ".env") });
// Local overrides; also wins over a stale DATABASE_URL exported in the shell.
dotenv.config({ path: path.join(_root, ".env.local"), override: true });

// Neon pooled URLs (Vercel/serverless) require prepare: false; max: 1 limits connections per instance.
export const client = postgres(process.env.DATABASE_URL!, { prepare: false, max: 1 });
export const db = drizzle(client, { schema });
