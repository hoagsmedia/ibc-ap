import { fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { z } from "zod";
import { db } from "$lib/server/db/index.js";
import { statsBeerConsumed } from "$lib/server/db/schema.js";
import { parseOptionalDate } from "$lib/server/stats-form.js";
import { statsRowId } from "$lib/server/stats-id.js";
import type { Actions, PageServerLoad } from "./$types.js";

const formSchema = z.object({
	keg_number: z.coerce.number().int().positive(),
	beer_name: z.string().optional(),
	purchased_on: z.string().optional(),
	delivered_on: z.string().optional(),
	finished_on: z.string().optional(),
	gallons: z.coerce.number().positive()
});

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(
			{
				keg_number: 1,
				beer_name: "",
				purchased_on: "",
				delivered_on: "",
				finished_on: "",
				gallons: 15.5
			},
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
			await db.insert(statsBeerConsumed).values({
				id: statsRowId(),
				keg_number: form.data.keg_number,
				beer_name: form.data.beer_name?.trim() || null,
				purchased_on: parseOptionalDate(form.data.purchased_on),
				delivered_on: parseOptionalDate(form.data.delivered_on),
				finished_on: parseOptionalDate(form.data.finished_on),
				gallons: form.data.gallons,
				updated_at: new Date()
			});
		} catch (e) {
			console.error(e);
			return fail(500, { form, message: "Could not save (duplicate keg #?)" });
		}
		throw redirect(303, "/admin/stats/beer-consumed");
	}
};
