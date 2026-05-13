import { client } from "$lib/server/db";

/** Matches `scripts/ensure-users-schema.ts` — local DBs may omit newer columns until ensured. */
let ensured = false;

export async function ensureWebsiteAccessUserColumns(): Promise<void> {
	if (ensured) return;
	try {
		await client.unsafe(
			`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS account_active boolean NOT NULL DEFAULT false`
		);
		await client.unsafe(
			`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS website_first_login_at timestamptz`
		);
		await client.unsafe(`UPDATE public.users SET account_active = true WHERE role = 'admin'`);
		ensured = true;
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		if (msg.includes("does not exist") && msg.includes("users")) {
			ensured = true;
			return;
		}
		throw err;
	}
}
