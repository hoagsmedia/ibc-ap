import type { LayoutServerLoad } from './$types';
import { requireUser } from '$lib/server/authz';

export const load: LayoutServerLoad = async (event) => {
	const user = requireUser(event.locals);

	return {
		user
	};
};
