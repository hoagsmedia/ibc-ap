import { fail } from "@sveltejs/kit";
import { db } from "$lib/server/db/index.js";
import { statsKegCredits } from "$lib/server/db/schema.js";
import { asc, count, eq } from "drizzle-orm";
import type { Actions, PageServerLoad } from "./$types.js";

const PER_PAGE = 50;

export const load: PageServerLoad = async ({ url }) => {
	const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
	const offset = (page - 1) * PER_PAGE;

	const [countRow] = await db.select({ n: count() }).from(statsKegCredits);
	const total = Number(countRow?.n ?? 0);
	const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

	const rows = await db
		.select()
		.from(statsKegCredits)
		.orderBy(asc(statsKegCredits.sort_order))
		.limit(PER_PAGE)
		.offset(offset);

	return { rows, page, totalPages, total, perPage: PER_PAGE };
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== "admin") return fail(403, { message: "Forbidden" });
		const data = await request.formData();
		const id = data.get("id") as string | null;
		if (!id) return fail(400, { message: "Missing id" });
		try {
			await db.delete(statsKegCredits).where(eq(statsKegCredits.id, id));
		} catch (e) {
			console.error(e);
			return fail(500, { message: "Delete failed" });
		}
		return { success: true };
	}
};
