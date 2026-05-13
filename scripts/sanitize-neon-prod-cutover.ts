/**
 * One-time production cutover sanitization (run against **target** Neon DB after pg_dump restore).
 *
 * Steps:
 *  A. DELETE all sessions
 *  B–D. DELETE invitation_tokens, member_rollout_tokens, password_reset_tokens
 *  E. DELETE all events
 *  F. DELETE users created in the last 4 weeks whose email local-part OR domain contains "test" (case-insensitive)
 *
 * Usage:
 *   DATABASE_URL="postgresql://...@neon.../ibc-db?sslmode=require" pnpm exec tsx scripts/sanitize-neon-prod-cutover.ts
 *   DATABASE_URL="..." pnpm exec tsx scripts/sanitize-neon-prod-cutover.ts --apply
 *
 * Default is dry-run (counts + candidate emails). Pass --apply to execute deletes.
 */
import dotenv from "dotenv";
import path from "path";
import postgres from "postgres";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });

const args = process.argv.slice(2);
const apply = args.includes("--apply");

const url = process.env.DATABASE_URL?.trim();
if (!url) {
	console.error("DATABASE_URL is not set.");
	process.exit(1);
}

const sql = postgres(url, { max: 1, onnotice: () => {} });

/** SQL fragment: recent signup + "test" in local or domain part of email */
const RECENT_TEST_USERS_WHERE = `
email IS NOT NULL
AND created_at >= NOW() - INTERVAL '4 weeks'
AND (
  split_part(lower(trim(email)), '@', 1) LIKE '%test%'
  OR COALESCE(split_part(lower(trim(email)), '@', 2), '') LIKE '%test%'
)
`;

async function main() {
	console.log(`Mode: ${apply ? "APPLY (destructive deletes)" : "DRY RUN (no writes)"}`);

	const sessions = await sql`SELECT count(*)::text AS c FROM session`;
	const invites = await sql`SELECT count(*)::text AS c FROM invitation_tokens`;
	const rollouts = await sql`SELECT count(*)::text AS c FROM member_rollout_tokens`;
	const resets = await sql`SELECT count(*)::text AS c FROM password_reset_tokens`;
	const events = await sql`SELECT count(*)::text AS c FROM events`;
	const recentTest = await sql.unsafe(
		`SELECT count(*)::text AS c FROM users WHERE ${RECENT_TEST_USERS_WHERE}`
	);

	console.log("Current row counts:", {
		sessions: sessions[0].c,
		invitation_tokens: invites[0].c,
		member_rollout_tokens: rollouts[0].c,
		password_reset_tokens: resets[0].c,
		events: events[0].c,
		recent_test_users: recentTest[0].c
	});

	const previewEmails = (await sql.unsafe(
		`SELECT id, email, created_at FROM users WHERE ${RECENT_TEST_USERS_WHERE} ORDER BY created_at DESC`
	)) as { id: string; email: string; created_at: Date }[];

	if (previewEmails.length > 0) {
		console.log(`Users that would be deleted (${previewEmails.length}):`);
		for (const row of previewEmails.slice(0, 50)) {
			console.log(`  ${row.id}  ${row.email}  created=${row.created_at.toISOString()}`);
		}
		if (previewEmails.length > 50) {
			console.log(`  ... and ${previewEmails.length - 50} more`);
		}
	} else {
		console.log("No users match the recent + email test pattern.");
	}

	if (!apply) {
		console.log("\nDry run complete. Re-run with --apply to execute deletes.");
		await sql.end();
		return;
	}

	await sql.begin(async (tx) => {
		await tx`DELETE FROM session`;
		await tx`DELETE FROM invitation_tokens`;
		await tx`DELETE FROM member_rollout_tokens`;
		await tx`DELETE FROM password_reset_tokens`;
		await tx`DELETE FROM events`;
		const deleted = await tx.unsafe(
			`DELETE FROM users WHERE ${RECENT_TEST_USERS_WHERE} RETURNING id`
		);
		console.log(`Deleted ${deleted.length} user row(s) matching recent test-email rule.`);
	});

	console.log("Sanitization applied.");
	await sql.end();
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
