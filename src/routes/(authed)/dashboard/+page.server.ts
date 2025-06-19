import type { PageServerLoad, Actions } from './$types';
import { createInvitationToken, getInvitationsByUser } from '$lib/server/invitations';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, url }) => {
	console.log('user in dashboard load:', locals.user);
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

		// Check if user has passed the test
		if (!locals.user.test_passed) {
			return fail(403, {
				message:
					'You must pass the official IBC test before creating invitation links. Please visit the test page to complete it.'
			});
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
