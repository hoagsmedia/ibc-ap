import { fail, redirect } from "@sveltejs/kit";
import { canAccessMemberDirectoryAndStats } from "$lib/ibc-test";
import type { Actions, PageServerLoad } from "./$types";
import { deleteExpiredInvitationByUser, getInvitationsByUser } from "$lib/server/invitations";
import { deleteExpiredInvitationSchema } from "./delete-expired-schema";

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, "/login");
	}
	if (!canAccessMemberDirectoryAndStats(locals.user)) {
		throw redirect(302, "/dashboard?restricted=invitations");
	}

	const invitations = await getInvitationsByUser(locals.user.id);

	return {
		user: locals.user,
		invitations,
		baseUrl: url.origin
	};
};

export const actions: Actions = {
	deleteExpired: async ({ locals, request }) => {
		if (!locals.user) {
			throw redirect(302, "/login");
		}
		if (!canAccessMemberDirectoryAndStats(locals.user)) {
			throw redirect(302, "/dashboard?restricted=invitations");
		}

		const formData = await request.formData();
		const parsed = deleteExpiredInvitationSchema.safeParse({
			token: formData.get("token")
		});
		if (!parsed.success) {
			return fail(400, { message: parsed.error.issues[0]?.message ?? "Missing invite token." });
		}
		const { token } = parsed.data;

		const deleted = await deleteExpiredInvitationByUser(locals.user.id, token);
		if (!deleted) {
			return fail(400, { message: "Only unused expired invites can be deleted." });
		}

		return { success: true };
	}
};
