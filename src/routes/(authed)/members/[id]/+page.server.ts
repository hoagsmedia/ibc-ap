import { error, redirect } from "@sveltejs/kit";
import { canAccessMemberDirectoryAndStats } from "$lib/ibc-test";
import { getMemberById } from "$lib/server/member-lookup";
import { resolveMemberBackLink } from "$lib/server/member-back-link";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, params, url, request }) => {
	if (!locals.user) {
		throw redirect(302, "/login");
	}
	if (!canAccessMemberDirectoryAndStats(locals.user)) {
		throw redirect(302, "/dashboard?restricted=member-profile");
	}

	const id = params.id;
	if (!id) {
		throw error(400, "Member id is required");
	}

	const member = await getMemberById(id);
	if (!member) {
		throw error(404, "Member not found");
	}

	const backLink = resolveMemberBackLink({
		backQuery: url.searchParams.get("back"),
		referer: request.headers.get("referer"),
		urlOrigin: url.origin
	});

	return { member: toMemberProfile(member), backLink };
};

/** Only the fields the profile page renders: other members must not receive phone, address, etc. */
function toMemberProfile(m: NonNullable<Awaited<ReturnType<typeof getMemberById>>>) {
	return {
		id: m.id,
		name: m.name,
		username: m.username,
		email: m.email,
		role: m.role,
		img: m.img,
		mbr: m.mbr,
		msd: m.msd,
		dops: m.dops,
		dops_date: m.dops_date,
		bio: m.bio,
		hobbies: m.hobbies,
		likes: m.likes,
		sponsor: m.sponsor,
		test_passed: m.test_passed,
		rung_in_date: m.rung_in_date
	};
}
