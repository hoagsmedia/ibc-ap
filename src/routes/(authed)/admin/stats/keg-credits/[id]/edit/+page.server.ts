import { error, fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { db } from "$lib/server/db/index.js";
import { kegCreditsFormSchema } from "$lib/keg-credits-form-schema.js";
import { statsKegCredits } from "$lib/server/db/schema.js";
import { eq } from "drizzle-orm";
import type { Actions, PageServerLoad } from "./$types.js";

const formSchema = kegCreditsFormSchema;

export const load: PageServerLoad = async ({ params }) => {
	const [row] = await db
		.select()
		.from(statsKegCredits)
		.where(eq(statsKegCredits.id, params.id))
		.limit(1);
	if (!row) throw error(404, "Not found");
	return {
		form: await superValidate(
			{
				sort_order: row.sort_order,
				member_label: row.member_label,
				member_number: row.member_number ?? null,
				credits: row.credits,
				is_cik: row.is_cik
			},
			zod(formSchema)
		)
	};
};

export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		if (!locals.user || locals.user.role !== "admin") {
			return fail(403, { message: "Forbidden" });
		}
		const form = await superValidate(request, zod(formSchema));
		if (!form.valid) {
			return fail(400, { form });
		}
		try {
			await db
				.update(statsKegCredits)
				.set({
					sort_order: form.data.sort_order,
					member_label: form.data.member_label,
					member_number: form.data.member_number,
					credits: form.data.credits,
					is_cik: form.data.is_cik,
					updated_at: new Date()
				})
				.where(eq(statsKegCredits.id, params.id));
		} catch (e) {
			console.error(e);
			return fail(500, { form, message: "Update failed (duplicate rank?)" });
		}
		throw redirect(303, "/admin/stats/keg-credits");
	}
};
