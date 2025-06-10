import type { PageServerLoad, Actions } from './$types';
import { createInvitationToken, getInvitationsByUser } from '$lib/server/invitations';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		return fail(401);
	}

	// Load user's invitation tokens
	const invitations = await getInvitationsByUser(locals.user.id);

	return {
		user: locals.user,
		invitations,
		baseUrl: url.origin
	};
};

export const actions: Actions = {
	createInvitation: async ({ locals, url }) => {
		if (!locals.user) {
			return fail(401, { message: 'Must be logged in to create invitations' });
		}

		try {
			const invitation = await createInvitationToken(locals.user.id);
			const inviteUrl = `${url.origin}/invite/${invitation.token}`;

			return {
				success: true,
				invitation,
				inviteUrl,
				message: 'Invitation link created successfully!'
			};
		} catch (error) {
			console.error('Error creating invitation:', error);
			return fail(500, { message: 'Failed to create invitation link' });
		}
	}
};
