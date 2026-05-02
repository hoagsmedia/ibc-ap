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
import {
	canAccessMemberDirectoryAndStats,
	canTakeIbcTest,
	canViewMembersOnlyClubEvents,
	prospectMeetingCount,
	requiresIbcTest
} from "$lib/ibc-test";
import { and, asc, count, desc, eq, gte, isNotNull, isNull } from "drizzle-orm";
import {
	clearProspectMeetingDateSchema,
	createInvitationSchema,
	saveProspectMeetingDateSchema
} from "./action-schemas";

function toDateInputValue(date: Date | null | undefined): string {
	if (!date) return "";
	const year = date.getUTCFullYear();
	const month = String(date.getUTCMonth() + 1).padStart(2, "0");
	const day = String(date.getUTCDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function parseDateInput(value: FormDataEntryValue | null): Date | null {
	if (typeof value !== "string") return null;
	const trimmed = value.trim();
	if (!trimmed) return null;
	const parsed = new Date(`${trimmed}T00:00:00.000Z`);
	return Number.isFinite(parsed.getTime()) ? parsed : null;
}

function isWednesday(date: Date): boolean {
	return date.getUTCDay() === 3;
}

function compareDateOnly(a: Date, b: Date): number {
	return a.getTime() - b.getTime();
}

function validateProspectMeetingDateSequence(
	slot: number,
	date: Date,
	existing: {
		meeting_1_date: Date | null;
		meeting_2_date: Date | null;
		meeting_3_date: Date | null;
	}
): string | null {
	if (!isWednesday(date)) {
		return "Prospect meeting dates must be Wednesdays.";
	}

	const previousDate =
		slot === 2 ? existing.meeting_1_date : slot === 3 ? existing.meeting_2_date : null;
	const nextDate =
		slot === 1 ? existing.meeting_2_date : slot === 2 ? existing.meeting_3_date : null;

	if (previousDate && compareDateOnly(date, previousDate) <= 0) {
		return `Meeting ${slot} must be later than Meeting ${slot - 1}.`;
	}

	if (nextDate && compareDateOnly(date, nextDate) >= 0) {
		return `Meeting ${slot} must be earlier than Meeting ${slot + 1}.`;
	}

	return null;
}

function validateProspectMeetingDateClear(
	slot: number,
	existing: {
		meeting_1_date: Date | null;
		meeting_2_date: Date | null;
		meeting_3_date: Date | null;
	}
): string | null {
	if (slot === 1 && (existing.meeting_2_date || existing.meeting_3_date)) {
		return "Clear Meeting 3 and Meeting 2 before clearing Meeting 1.";
	}
	if (slot === 2 && existing.meeting_3_date) {
		return "Clear Meeting 3 before clearing Meeting 2.";
	}
	return null;
}

async function getProspectMeetingState(userId: string) {
	const [user] = await db
		.select({
			meeting_1_date: users.meeting_1_date,
			meeting_2_date: users.meeting_2_date,
			meeting_3_date: users.meeting_3_date
		})
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	return user ?? { meeting_1_date: null, meeting_2_date: null, meeting_3_date: null };
}

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, "/login");
	}

	const invitationYear = new Date().getUTCFullYear();
	const canAccessExclusiveFeatures = canAccessMemberDirectoryAndStats(locals.user);
	const meetingCount = prospectMeetingCount(locals.user);
	const canTakeTestNow = canTakeIbcTest(locals.user);
	const prospectGate = canAccessExclusiveFeatures
		? null
		: {
				active: true,
				meetingCount,
				meetingsRequired: 3,
				canTakeTestNow,
				requiresTest: requiresIbcTest(locals.user),
				testPassed: locals.user.test_passed != null,
				meetingDates: [
					toDateInputValue(locals.user.meeting_1_date),
					toDateInputValue(locals.user.meeting_2_date),
					toDateInputValue(locals.user.meeting_3_date)
				]
			};

	const invitations = canAccessExclusiveFeatures
		? await getInvitationsByUser(locals.user.id, {
				limit: 3,
				year: invitationYear
			})
		: [];

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

	const cached = canAccessExclusiveFeatures ? await getDashboardClubStats(db) : null;
	const eventsThisYear = cached
		? canViewMemberEvents
			? cached.eventsThisYearMember
			: cached.eventsThisYearGuest
		: 0;
	const eventsThisMonth = cached
		? canViewMemberEvents
			? cached.eventsThisMonthMember
			: cached.eventsThisMonthGuest
		: 0;

	const startOfToday = new Date();
	startOfToday.setUTCHours(0, 0, 0, 0);

	const membersOnlyVisibility = canViewMemberEvents ? undefined : eq(events.members_only, false);

	const upcomingEvents = canAccessExclusiveFeatures
		? await db
				.select({
					id: events.id,
					title: events.title,
					description: events.description,
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
				.limit(8)
		: [];

	return {
		user: locals.user,
		invitations,
		invitationYear,
		canAccessExclusiveFeatures,
		prospectGate,
		pendingMembers,
		pendingMembersCount,
		baseUrl: url.origin,
		upcomingEvents,
		clubStats: {
			totalMembers: cached?.totalMembers ?? 0,
			activeMembers: cached?.activeMembers ?? 0,
			eventsThisYear,
			eventsThisMonth,
			kegsConsumed: cached?.kegsConsumed ?? 0,
			membersJoinedThisMonth: cached?.membersJoinedThisMonth ?? 0,
			kegsAddedThisMonth: cached?.kegsAddedThisMonth ?? 0
		}
	};
};

export const actions: Actions = {
	saveProspectMeetingDate: async ({ locals, request }) => {
		if (!locals.user) {
			return fail(401, { message: "Must be logged in to save prospect meetings" });
		}
		if (canAccessMemberDirectoryAndStats(locals.user)) {
			throw redirect(303, "/dashboard");
		}

		const formData = await request.formData();
		const parsed = saveProspectMeetingDateSchema.safeParse({
			slot: formData.get("slot"),
			meetingDate: formData.get("meetingDate")
		});
		if (!parsed.success) {
			return fail(400, {
				message: parsed.error.issues[0]?.message ?? "Invalid meeting date input"
			});
		}
		const { slot } = parsed.data;
		const date = parseDateInput(parsed.data.meetingDate);
		if (!date) {
			return fail(400, { message: "Pick a valid meeting date before saving." });
		}

		const existing = await getProspectMeetingState(locals.user.id);
		const validationError = validateProspectMeetingDateSequence(slot, date, existing);
		if (validationError) {
			return fail(400, { message: validationError });
		}

		const column =
			slot === 1 ? users.meeting_1_date : slot === 2 ? users.meeting_2_date : users.meeting_3_date;
		await db
			.update(users)
			.set({ [column.name]: date, updated_at: new Date() })
			.where(eq(users.id, locals.user.id));

		throw redirect(303, "/dashboard#prospect-progress");
	},

	clearProspectMeetingDate: async ({ locals, request }) => {
		if (!locals.user) {
			return fail(401, { message: "Must be logged in to update prospect meetings" });
		}
		if (canAccessMemberDirectoryAndStats(locals.user)) {
			throw redirect(303, "/dashboard");
		}

		const formData = await request.formData();
		const parsed = clearProspectMeetingDateSchema.safeParse({
			slot: formData.get("slot")
		});
		if (!parsed.success) {
			return fail(400, { message: parsed.error.issues[0]?.message ?? "Invalid meeting slot" });
		}
		const { slot } = parsed.data;

		const existing = await getProspectMeetingState(locals.user.id);
		const validationError = validateProspectMeetingDateClear(slot, existing);
		if (validationError) {
			return fail(400, { message: validationError });
		}

		const column =
			slot === 1 ? users.meeting_1_date : slot === 2 ? users.meeting_2_date : users.meeting_3_date;
		await db
			.update(users)
			.set({ [column.name]: null, updated_at: new Date() })
			.where(eq(users.id, locals.user.id));

		throw redirect(303, "/dashboard#prospect-progress");
	},

	createInvitation: async ({ locals, request }) => {
		if (!locals.user) {
			return fail(401, { message: "Must be logged in to create invitations" });
		}

		const formData = await request.formData();
		const parsed = createInvitationSchema.safeParse({
			inviteName: formData.get("inviteName")
		});
		if (!parsed.success) {
			return fail(400, { message: parsed.error.issues[0]?.message ?? "Invalid invite name." });
		}
		const { inviteName } = parsed.data;

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
					"You must have a member number assigned before creating invitation links. An admin will assign it once your membership is finalized."
			});
		}

		const createdInWindow = await getInvitationCountInWindow(
			locals.user.id,
			INVITATION_LIMIT_WINDOW_DAYS
		);
		if (locals.user.role === "member" && createdInWindow >= INVITATION_MEMBER_WEEKLY_LIMIT) {
			return fail(429, {
				message: `You’ve reached your ${INVITATION_MEMBER_WEEKLY_LIMIT} invite limit for the last ${INVITATION_LIMIT_WINDOW_DAYS} days.`
			});
		}

		try {
			const invitation = await createInvitationToken(
				locals.user.id,
				inviteName,
				locals.user.name,
				7
			);
			return {
				success: true,
				invitation
			};
		} catch (error) {
			console.error("Failed to create invitation", error);
			return fail(500, { message: "Could not create invite right now. Please try again." });
		}
	}
};
