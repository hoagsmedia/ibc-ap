import { afterAll, describe, expect, it } from "vitest";
import { isActionFailure, isRedirect } from "@sveltejs/kit";
import { checkinSchema } from "./beer-log-schema";

const { load, actions } = await import("./+page.server");
const { client } = await import("$lib/server/db");

type LoadEvent = Parameters<typeof load>[0];
type ActionName = keyof typeof actions;
type ActionEvent = Parameters<NonNullable<(typeof actions)[ActionName]>>[0];

// Synthetic users only.
const sam = { id: "synthetic-sam", name: "Sam Member", role: "member", account_active: true };
const pat = { id: "synthetic-pat", name: "Pat Member", role: "member", account_active: true };
const admin = { id: "synthetic-admin", name: "Ada Admin", role: "admin", account_active: false };
const guest = { ...sam, id: "synthetic-guest", role: "guest" };
const inactiveMember = { ...sam, id: "synthetic-inactive", account_active: false };

const loadEvent = (user: unknown) => ({ locals: { user, session: null } }) as unknown as LoadEvent;

function act(name: ActionName, user: unknown, fields: Record<string, string>) {
	const body = new FormData();
	for (const [k, v] of Object.entries(fields)) body.set(k, v);
	const event = {
		locals: { user, session: null },
		request: new Request("http://test.local/dashboard/beer-log", { method: "POST", body })
	} as unknown as ActionEvent;
	return actions[name]!(event);
}

async function expectRedirect(promise: Promise<unknown>, location: string) {
	try {
		await promise;
	} catch (err) {
		expect(isRedirect(err)).toBe(true);
		if (isRedirect(err)) expect(err.location).toBe(location);
		return;
	}
	throw new Error("expected a redirect");
}

describe("beer log checkin schema", () => {
	it("trims input and turns blank optional fields into null", () => {
		const parsed = checkinSchema.parse({
			beer_name: "  Golden Ale ",
			brewery: " ",
			rating: "4",
			note: ""
		});
		expect(parsed).toEqual({ beer_name: "Golden Ale", brewery: null, rating: 4, note: null });
	});

	it.each([
		{ beer_name: "", rating: "3" },
		{ beer_name: "Ale", rating: "0" },
		{ beer_name: "Ale", rating: "6" },
		{ beer_name: "Ale", rating: "2.5" },
		{ beer_name: "x".repeat(81), rating: "3" },
		{ beer_name: "Ale", rating: "3", note: "x".repeat(201) }
	])("rejects %o", (input) => {
		expect(checkinSchema.safeParse({ brewery: "", note: "", ...input }).success).toBe(false);
	});
});

describe("beer log access", () => {
	it("sends signed-out visitors to login", async () => {
		await expectRedirect(
			Promise.resolve().then(() => load(loadEvent(null))),
			"/login"
		);
	});

	it.each([
		["guest", guest],
		["inactive member", inactiveMember]
	])("keeps a %s out of the page and every action", async (_label, user) => {
		await expectRedirect(
			Promise.resolve().then(() => load(loadEvent(user))),
			"/dashboard"
		);
		for (const name of ["checkin", "cheer", "delete"] as const) {
			await expectRedirect(
				Promise.resolve().then(() => act(name, user, { id: "x", beer_name: "Ale", rating: "3" })),
				"/dashboard"
			);
		}
	});

	it("rejects an invalid check-in before touching the database", async () => {
		const result = await act("checkin", sam, { beer_name: "", rating: "3" });
		expect(isActionFailure(result)).toBe(true);
	});
});

// Real queries run only against a throwaway database you point at explicitly, e.g.
// BEER_LOG_TEST_DATABASE_URL=postgres://localhost/scratch DATABASE_URL=$BEER_LOG_TEST_DATABASE_URL
// with a `users` table holding the synthetic rows above and scripts/ensure-beer-log-schema.ts applied.
const testDb = process.env.BEER_LOG_TEST_DATABASE_URL;
describe.skipIf(!testDb || testDb !== process.env.DATABASE_URL)(
	"beer log against a test database",
	() => {
		afterAll(async () => {
			await client`delete from beer_checkins where user_id in (${sam.id}, ${pat.id}, ${admin.id})`;
			await client.end();
		});

		type Feed = {
			feed: Array<{
				id: string;
				beer_name: string;
				cheers: number;
				cheered: boolean;
				canDelete: boolean;
			}>;
			leaders: Array<{ user_id: string; checkins: number }>;
			myTotal: number;
		};
		const feedFor = async (user: unknown) => (await load(loadEvent(user))) as Feed;

		it("posts, cheers, un-cheers and deletes", async () => {
			await client`delete from beer_checkins where user_id in (${sam.id}, ${pat.id}, ${admin.id})`;
			expect(
				await act("checkin", sam, { beer_name: "Golden Ale", brewery: "", rating: "4", note: "" })
			).toEqual({
				posted: true
			});

			let feed = await feedFor(pat);
			const post = feed.feed[0]!;
			expect(post).toMatchObject({
				beer_name: "Golden Ale",
				cheers: 0,
				cheered: false,
				canDelete: false
			});
			expect(feed.leaders[0]).toMatchObject({ user_id: sam.id, checkins: 1 });

			expect(isActionFailure(await act("cheer", sam, { id: post.id }))).toBe(true);
			expect(await act("cheer", pat, { id: post.id })).toEqual({ cheered: true });
			expect(await act("cheer", admin, { id: post.id })).toEqual({ cheered: true });
			feed = await feedFor(pat);
			expect(feed.feed[0]).toMatchObject({ cheers: 2, cheered: true });
			expect(await act("cheer", pat, { id: post.id })).toEqual({ cheered: false });
			expect((await feedFor(pat)).feed[0]).toMatchObject({ cheers: 1, cheered: false });

			expect(isActionFailure(await act("delete", pat, { id: post.id }))).toBe(true);
			expect((await feedFor(admin)).feed[0]).toMatchObject({ canDelete: true });
			expect((await feedFor(sam)).myTotal).toBe(1);
			expect(await act("delete", sam, { id: post.id })).toEqual({ deleted: true });
			expect((await feedFor(sam)).feed.find((f) => f.id === post.id)).toBeUndefined();
		});

		it("caps check-ins per member per day", async () => {
			for (let i = 0; i < 20; i++) {
				await act("checkin", pat, { beer_name: `Ale ${i}`, rating: "3" });
			}
			const result = await act("checkin", pat, { beer_name: "One more", rating: "3" });
			expect(isActionFailure(result) && result.status).toBe(429);
		});
	}
);
