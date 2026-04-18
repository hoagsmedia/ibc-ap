import { fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { z } from "zod";
import { db } from "$lib/server/db/index.js";
import { statsKegCredits } from "$lib/server/db/schema.js";
import { statsRowId } from "$lib/server/stats-id.js";
import type { Actions, PageServerLoad } from "./$types.js";

const formSchema = z.object({
	sort_order: z.coerce.number().int(),
	member_label: z.string().min(1, "Required"),
	credits: z.coerce.number().nonnegative(),
	is_cik: z.boolean().default(false)
});

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(
			{ sort_order: 1, member_label: "", credits: 0, is_cik: false },
			zod(formSchema)
		)
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== "admin") {
			return fail(403, { message: "Forbidden" });
		}
		const form = await superValidate(request, zod(formSchema));
		if (!form.valid) {
			return fail(400, { form });
		}
		try {
			await db.insert(statsKegCredits).values({
				id: statsRowId(),
				sort_order: form.data.sort_order,
				member_label: form.data.member_label,
				credits: form.data.credits,
				is_cik: form.data.is_cik,
				updated_at: new Date()
			});
		} catch (e) {
			console.error(e);
			return fail(500, { form, message: "Could not save (duplicate rank?)" });
		}
		throw redirect(303, "/admin/stats/keg-credits");
	}
};
