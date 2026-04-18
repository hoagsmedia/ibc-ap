import { error, fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { z } from "zod";
import { db } from "$lib/server/db/index.js";
import { statsBeerConsumed } from "$lib/server/db/schema.js";
import { formatDateInput, parseOptionalDate } from "$lib/server/stats-form.js";
import { eq } from "drizzle-orm";
import type { Actions, PageServerLoad } from "./$types.js";

const formSchema = z.object({
	keg_number: z.coerce.number().int().positive(),
	beer_name: z.string().optional(),
	purchased_on: z.string().optional(),
	delivered_on: z.string().optional(),
	finished_on: z.string().optional(),
	gallons: z.coerce.number().positive()
});

export const load: PageServerLoad = async ({ params }) => {
	const [row] = await db
		.select()
		.from(statsBeerConsumed)
		.where(eq(statsBeerConsumed.id, params.id))
		.limit(1);
	if (!row) throw error(404, "Not found");
	return {
		form: await superValidate(
			{
				keg_number: row.keg_number,
				beer_name: row.beer_name ?? "",
				purchased_on: formatDateInput(row.purchased_on),
				delivered_on: formatDateInput(row.delivered_on),
				finished_on: formatDateInput(row.finished_on),
				gallons: row.gallons
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
				.update(statsBeerConsumed)
				.set({
					keg_number: form.data.keg_number,
					beer_name: form.data.beer_name?.trim() || null,
					purchased_on: parseOptionalDate(form.data.purchased_on),
					delivered_on: parseOptionalDate(form.data.delivered_on),
					finished_on: parseOptionalDate(form.data.finished_on),
					gallons: form.data.gallons,
					updated_at: new Date()
				})
				.where(eq(statsBeerConsumed.id, params.id));
		} catch (e) {
			console.error(e);
			return fail(500, { form, message: "Update failed (duplicate keg #?)" });
		}
		throw redirect(303, "/admin/stats/beer-consumed");
	}
};
