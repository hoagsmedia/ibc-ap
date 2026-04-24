import { dev } from "$app/environment";
import type { PageServerLoad, Actions } from "./$types";
import {
	createInvitationToken,
	getInvitationsByUser,
	getInvitationCountInWindow,
	INVITATION_MEMBER_WEEKLY_LIMIT,
	INVITATION_LIMIT_WINDOW_DAYS
} from "$lib/server/invitations";
import { fail, redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { getDashboardClubStats } from "$lib/server/dashboard-club-stats-cache";
import { events, users } from "$lib/server/db/schema";
import { ibcDebugEnabled } from "$lib/server/ibc-debug";
import { canViewMembersOnlyClubEvents, requiresIbcTest } from "$lib/ibc-test";
import { and, asc, count, desc, eq, gte, isNotNull, isNull } from "drizzle-orm";

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, "/login");
	}

	const invitationYear = new Date().getUTCFullYear();
	// Latest 3 invites created in the current calendar year (UTC), for dashboard card
	const invitations = await getInvitationsByUser(locals.user.id, {
		limit: 3,
		year: invitationYear
	});

	// IBC-20: For admins only — up to 3 most recent Prospects (oldest-first) + total count
	let pendingMembers:
		| { id: string; name: string; email: string | null; test_passed: Date }[]
		| undefined;
	let pendingMembersCount: number | undefined;
	if (locals.user.role === "admin") {
		const wherePending = and(isNotNull(users.test_passed), isNull(users.mbr));

		const [countRow] = await db.select({ n: count() }).from(users).where(wherePending);
		pendingMembersCount = Number(countRow?.n ?? 0);

		const rows = await db
			.select({
				id: users.id,
				name: users.name,
				email: users.email,
				test_passed: users.test_passed
			})
			.from(users)
			.where(wherePending)
			.orderBy(desc(users.test_passed))
			.limit(3);

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

	const canViewMemberEvents = canViewMembersOnlyClubEvents(locals.user);

	const cached = await getDashboardClubStats(db);
	const eventsThisYear = canViewMemberEvents
		? cached.eventsThisYearMember
		: cached.eventsThisYearGuest;
	const eventsThisMonth = canViewMemberEvents
		? cached.eventsThisMonthMember
		: cached.eventsThisMonthGuest;

	const startOfToday = new Date();
	startOfToday.setUTCHours(0, 0, 0, 0);

	const membersOnlyVisibility = canViewMemberEvents ? undefined : eq(events.members_only, false);

	const upcomingEvents = await db
		.select({
			id: events.id,
			title: events.title,
			event_date: events.event_date,
			location: events.location,
			members_only: events.members_only
		})
		.from(events)
		.where(
			and(
				eq(events.is_published, 1),
				isNotNull(events.event_date),
				gte(events.event_date, startOfToday),
				...(membersOnlyVisibility ? [membersOnlyVisibility] : [])
			)
		)
		.orderBy(asc(events.event_date))
		.limit(8);

	return {
		user: locals.user,
		invitations,
		invitationYear,
		...(pendingMembers !== undefined && { pendingMembers }),
		...(pendingMembersCount !== undefined && { pendingMembersCount }),
		baseUrl: url.origin,
		upcomingEvents,
		clubStats: {
			totalMembers: cached.totalMembers,
			activeMembers: cached.activeMembers,
			eventsThisYear,
			eventsThisMonth,
			kegsConsumed: cached.kegsConsumed,
			membersJoinedThisMonth: cached.membersJoinedThisMonth,
			kegsAddedThisMonth: cached.kegsAddedThisMonth
		}
	};
};

export const actions: Actions = {
	createInvitation: async ({ locals, request }) => {
		if (!locals.user) {
			return fail(401, { message: "Must be logged in to create invitations" });
		}

		const formData = await request.formData();
		const inviteName = String(formData.get("inviteName") ?? "").trim();
		if (!inviteName) {
			return fail(400, {
				message: "Add a name for this invite so you remember who it’s for."
			});
		}
		if (inviteName.length > 120) {
			return fail(400, { message: "Invite name must be 120 characters or fewer." });
		}

		// Only full members (role + MBR assigned) or admins can create invite links
		if (locals.user.role !== "member" && locals.user.role !== "admin") {
			if (requiresIbcTest(locals.user)) {
				return fail(403, {
					message:
						"You must be an accepted member with a member number before you can create invitation links. An admin will review your profile after you pass the test."
				});
			}
			return fail(403, {
				message:
					"You must be an accepted member with a member number before you can create invitation links. You’ve passed the IBC test — an admin will assign your member number when you’re accepted."
			});
		}
		if (requiresIbcTest(locals.user)) {
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

		// Members can create up to 3 invitation links in a rolling 7-day window (admins exempt)
		if (locals.user.role !== "admin") {
			const inviteCountInWindow = await getInvitationCountInWindow(locals.user.id);
			if (inviteCountInWindow >= INVITATION_MEMBER_WEEKLY_LIMIT) {
				return fail(429, {
					message: `You can create up to ${INVITATION_MEMBER_WEEKLY_LIMIT} invitation links every ${INVITATION_LIMIT_WINDOW_DAYS} days. Please try again later.`
				});
			}
		}

		try {
			const invitation = await createInvitationToken(
				locals.user.id,
				inviteName,
				locals.user.name?.trim() || "Member"
			);

			if (dev && ibcDebugEnabled()) {
				console.log("[IBC-LOG] [dashboard] Invitation created", {
					userId: locals.user.id.slice(0, 5) + "..."
				});
			}

			return { invitation };
		} catch (error) {
			console.error("Error creating invitation:", error);
			return fail(500, { message: "Failed to create invitation link" });
		}
	}
};
