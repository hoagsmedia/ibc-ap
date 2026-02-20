import type { PageServerLoad, Actions } from "./$types";
import { createInvitationToken, getInvitationsByUser } from "$lib/server/invitations";
import { fail, redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { users } from "$lib/server/db/schema";
import { and, asc, eq, isNotNull } from "drizzle-orm";

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, "/login");
	}

	// Load user's invitation tokens
	const invitations = await getInvitationsByUser(locals.user.id);

	// IBC-20: For admins, load guests who passed the test (pending acceptance / MBR assignment)
	let pendingMembers: { id: string; name: string; email: string | null; test_passed: Date }[] = [];
	if (locals.user.role === "admin") {
		const rows = await db
			.select({
				id: users.id,
				name: users.name,
				email: users.email,
				test_passed: users.test_passed
			})
			.from(users)
			.where(and(eq(users.role, "guest"), isNotNull(users.test_passed)))
			.orderBy(asc(users.test_passed));
		pendingMembers = rows
			.filter((r) => r.test_passed != null)
			.map((r) => ({
				id: r.id,
				name: r.name,
				email: r.email,
				test_passed: r.test_passed as Date
			}));
	}

	console.log("[IBC-LOG] [dashboard] Page loaded", {
		userId: locals.user.id.slice(0, 5) + "...", // Show only first 5 characters for security
		invitationCount: invitations.length
	});

	return {
		user: locals.user,
		invitations,
		pendingMembers,
		baseUrl: url.origin
	};
};

export const actions: Actions = {
	createInvitation: async ({ locals, url }) => {
		if (!locals.user) {
			return fail(401, { message: "Must be logged in to create invitations" });
		}

		// Check if user has passed the test
		if (!locals.user.test_passed) {
			return fail(403, {
				message:
					"You must pass the official IBC test before creating invitation links. Please visit the test page to complete it."
			});
		}

		try {
			const invitation = await createInvitationToken(locals.user.id);
			const inviteUrl = `${url.origin}/invite/${invitation.token}`;

			console.log("[IBC-LOG] [dashboard] Invitation created", {
				userId: locals.user.id,
				invitationToken: invitation.token
			});

			return {
				success: true,
				invitation,
				inviteUrl,
				message: "Invitation link created successfully!"
			};
		} catch (error) {
			console.error("Error creating invitation:", error);
			return fail(500, { message: "Failed to create invitation link" });
		}
	}
};
