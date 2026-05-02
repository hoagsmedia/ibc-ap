import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { deleteExpiredInvitationByUser, getInvitationsByUser } from "$lib/server/invitations";
import { deleteExpiredInvitationSchema } from "./delete-expired-schema";
import { requireMemberDirectoryAccess } from "$lib/server/authz";

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = requireMemberDirectoryAccess(locals, {
		forbiddenPath: "/dashboard?restricted=invitations"
	});

	const invitations = await getInvitationsByUser(user.id);

	return {
		user,
		invitations,
		baseUrl: url.origin
	};
};

export const actions: Actions = {
	deleteExpired: async ({ locals, request }) => {
		const user = requireMemberDirectoryAccess(locals, {
			forbiddenPath: "/dashboard?restricted=invitations"
		});

		const formData = await request.formData();
		const parsed = deleteExpiredInvitationSchema.safeParse({
			token: formData.get("token")
		});
		if (!parsed.success) {
			return fail(400, { message: parsed.error.issues[0]?.message ?? "Missing invite token." });
		}
		const { token } = parsed.data;

		const deleted = await deleteExpiredInvitationByUser(user.id, token);
		if (!deleted) {
			return fail(400, {
				message: "Invite not found, not expired yet, or you don’t have permission to delete it."
			});
		}

		return { success: true };
	}
};
