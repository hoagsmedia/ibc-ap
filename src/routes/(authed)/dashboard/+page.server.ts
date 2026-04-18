import { dev } from "$app/environment";
import type { PageServerLoad, Actions } from "./$types";
import {
	createInvitationToken,
	getInvitationsByUser,
	getLastInvitationCreatedAt,
	INVITATION_COOLDOWN_DAYS
} from "$lib/server/invitations";
import { fail, redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { getDashboardClubStats } from "$lib/server/dashboard-club-stats-cache";
import { users } from "$lib/server/db/schema";
import { ibcDebugEnabled } from "$lib/server/ibc-debug";
import { and, asc, isNotNull, isNull } from "drizzle-orm";

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, "/login");
	}

	// Load user's invitation tokens
	const invitations = await getInvitationsByUser(locals.user.id);

	// IBC-20: For admins only, load users who passed the test but have no member number yet
	let pendingMembers: { id: string; name: string; email: string | null; test_passed: Date }[] | undefined;
	if (locals.user.role === "admin") {
		const rows = await db
			.select({
				id: users.id,
				name: users.name,
				email: users.email,
				test_passed: users.test_passed
			})
			.from(users)
			.where(and(isNotNull(users.test_passed), isNull(users.mbr)))
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

	if (dev && ibcDebugEnabled()) {
		console.log("[IBC-LOG] [dashboard] Page loaded", {
			userId: locals.user.id.slice(0, 5) + "...",
			invitationCount: invitations.length
		});
	}

	const canViewMembersOnlyEvents =
		locals.user.role === "member" || locals.user.role === "admin";

	const cached = await getDashboardClubStats(db);
	const eventsThisYear = canViewMembersOnlyEvents
		? cached.eventsThisYearMember
		: cached.eventsThisYearGuest;

	return {
		user: locals.user,
		invitations,
		...(pendingMembers !== undefined && { pendingMembers }),
		baseUrl: url.origin,
		clubStats: {
			totalMembers: cached.totalMembers,
			activeMembers: cached.activeMembers,
			eventsThisYear,
			kegsConsumed: cached.kegsConsumed
		}
	};
};

export const actions: Actions = {
	createInvitation: async ({ locals, url }) => {
		if (!locals.user) {
			return fail(401, { message: "Must be logged in to create invitations" });
		}

		// Only full members (role + test passed + MBR assigned) can create invite links
		if (locals.user.role !== "member" && locals.user.role !== "admin") {
			return fail(403, {
				message:
					"You must be an accepted member with a member number before you can create invitation links. An admin will review your profile after you pass the test."
			});
		}
		if (!locals.user.test_passed) {
			return fail(403, {
				message:
					"You must pass the official IBC test before creating invitation links. Please visit the test page to complete it."
			});
		}
		if (locals.user.role === "member" && locals.user.mbr == null) {
			return fail(403, {
				message:
					"You must be assigned a member number by an admin before you can create invitation links."
			});
		}

		// One invitation link per week per member (admins are exempt)
		if (locals.user.role !== "admin") {
			const lastCreated = await getLastInvitationCreatedAt(locals.user.id);
			const cooldownMs = INVITATION_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
			if (lastCreated && Date.now() - lastCreated.getTime() < cooldownMs) {
				const nextAllowed = new Date(lastCreated.getTime() + cooldownMs);
				return fail(429, {
					message: `You can only create one invitation link per week. You can create another on ${nextAllowed.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}.`
				});
			}
		}

		try {
			const invitation = await createInvitationToken(locals.user.id);
			const inviteUrl = `${url.origin}/invite/${invitation.token}`;

			if (dev && ibcDebugEnabled()) {
				console.log("[IBC-LOG] [dashboard] Invitation created", {
					userId: locals.user.id.slice(0, 5) + "..."
				});
			}

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
