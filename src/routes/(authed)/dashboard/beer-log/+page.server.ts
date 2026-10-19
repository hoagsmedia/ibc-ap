import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "$lib/server/db";
import { beerCheckins, beerCheers, users } from "$lib/server/db/schema";
import { isAdmin, requireActiveMemberAccess } from "$lib/server/authz";
import { FEED_LIMIT, MAX_CHECKINS_PER_DAY, checkinSchema } from "./beer-log-schema";

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfMonthUtc(now = new Date()): Date {
	return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireActiveMemberAccess(locals);

	const cheerCount = sql<number>`(select count(*)::int from ${beerCheers} where ${beerCheers.checkin_id} = ${beerCheckins.id})`;
	const cheeredByMe = sql<boolean>`exists (select 1 from ${beerCheers} where ${beerCheers.checkin_id} = ${beerCheckins.id} and ${beerCheers.user_id} = ${user.id})`;

	const [feed, leaders, [mine]] = await Promise.all([
		db
			.select({
				id: beerCheckins.id,
				beer_name: beerCheckins.beer_name,
				brewery: beerCheckins.brewery,
				rating: beerCheckins.rating,
				note: beerCheckins.note,
				created_at: beerCheckins.created_at,
				user_id: users.id,
				name: users.name,
				img: users.img,
				mbr: users.mbr,
				cheers: cheerCount,
				cheered: cheeredByMe
			})
			.from(beerCheckins)
			.innerJoin(users, eq(beerCheckins.user_id, users.id))
			.orderBy(desc(beerCheckins.created_at))
			.limit(FEED_LIMIT),
		db
			.select({ user_id: users.id, name: users.name, img: users.img, checkins: count() })
			.from(beerCheckins)
			.innerJoin(users, eq(beerCheckins.user_id, users.id))
			.where(gte(beerCheckins.created_at, startOfMonthUtc()))
			.groupBy(users.id, users.name, users.img)
			.orderBy(desc(count()), users.name)
			.limit(5),
		db.select({ total: count() }).from(beerCheckins).where(eq(beerCheckins.user_id, user.id))
	]);

	return {
		feed: feed.map((row) => ({
			...row,
			cheers: Number(row.cheers),
			canDelete: row.user_id === user.id || isAdmin(user)
		})),
		leaders,
		myTotal: mine?.total ?? 0
	};
};

export const actions: Actions = {
	checkin: async ({ request, locals }) => {
		const user = requireActiveMemberAccess(locals);
		const formData = await request.formData();
		const values = {
			beer_name: String(formData.get("beer_name") ?? ""),
			brewery: String(formData.get("brewery") ?? ""),
			rating: String(formData.get("rating") ?? ""),
			note: String(formData.get("note") ?? "")
		};
		const parsed = checkinSchema.safeParse(values);
		if (!parsed.success) {
			return fail(400, { values, error: parsed.error.issues[0]?.message ?? "Check your entry." });
		}

		const [recent] = await db
			.select({ n: count() })
			.from(beerCheckins)
			.where(
				and(
					eq(beerCheckins.user_id, user.id),
					gte(beerCheckins.created_at, new Date(Date.now() - DAY_MS))
				)
			);
		if ((recent?.n ?? 0) >= MAX_CHECKINS_PER_DAY) {
			return fail(429, {
				values,
				error: "That's a lot of beer for one day. Try again tomorrow."
			});
		}

		await db.insert(beerCheckins).values({
			id: crypto.randomUUID(),
			user_id: user.id,
			...parsed.data
		});
		return { posted: true };
	},

	cheer: async ({ request, locals }) => {
		const user = requireActiveMemberAccess(locals);
		const id = String((await request.formData()).get("id") ?? "");
		const [checkin] = await db
			.select({ user_id: beerCheckins.user_id })
			.from(beerCheckins)
			.where(eq(beerCheckins.id, id))
			.limit(1);
		if (!checkin) return fail(404, { error: "That check-in is gone." });
		if (checkin.user_id === user.id) return fail(400, { error: "You can't cheers yourself." });

		const removed = await db
			.delete(beerCheers)
			.where(and(eq(beerCheers.checkin_id, id), eq(beerCheers.user_id, user.id)))
			.returning({ id: beerCheers.checkin_id });
		if (removed.length === 0) {
			try {
				await db
					.insert(beerCheers)
					.values({ checkin_id: id, user_id: user.id })
					.onConflictDoNothing();
			} catch (err) {
				// Deleted between the lookup and the insert (foreign key violation).
				if ((err as { code?: string }).code === "23503") {
					return fail(404, { error: "That check-in is gone." });
				}
				throw err;
			}
		}
		return { cheered: removed.length === 0 };
	},

	delete: async ({ request, locals }) => {
		const user = requireActiveMemberAccess(locals);
		const id = String((await request.formData()).get("id") ?? "");
		const ownerOnly = isAdmin(user) ? undefined : eq(beerCheckins.user_id, user.id);
		const deleted = await db
			.delete(beerCheckins)
			.where(and(eq(beerCheckins.id, id), ownerOnly))
			.returning({ id: beerCheckins.id });
		if (deleted.length === 0) return fail(404, { error: "Check-in not found." });
		return { deleted: true };
	}
};
