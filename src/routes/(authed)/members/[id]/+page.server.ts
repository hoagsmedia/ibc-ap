import { error, redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { users } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, params }) => {
	// Check if user is authenticated
	if (!locals.user) {
		throw redirect(302, "/login");
	}

	const { id } = params;

	if (!id) {
		throw error(400, "User ID is required");
	}

	// Fetch the member details
	const member = await db.query.users.findFirst({
		where: eq(users.id, id)
	});

	if (!member) {
		throw error(404, "Member not found");
	}

	return {
		member
	};
};
