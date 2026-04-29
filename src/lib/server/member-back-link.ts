type BackKey = "members" | "invitations" | "prospects" | "dashboard";

export type MemberBackLink = {
	key: BackKey;
	href: string;
	label: string;
};

const BACK_LINKS: Record<BackKey, Omit<MemberBackLink, "key">> = {
	members: { href: "/dashboard/members", label: "Back to Members" },
	invitations: { href: "/dashboard/invitations", label: "Back to Invite Links" },
	prospects: { href: "/dashboard/pending-members", label: "Back to Prospects" },
	dashboard: { href: "/dashboard", label: "Back to Dashboard" }
};

function fromPathname(pathname: string): BackKey | null {
	if (pathname.startsWith("/dashboard/invitations")) return "invitations";
	if (pathname.startsWith("/dashboard/pending-members")) return "prospects";
	if (pathname.startsWith("/dashboard/members")) return "members";
	if (pathname.startsWith("/dashboard")) return "dashboard";
	return null;
}

export function resolveMemberBackLink(params: {
	backQuery: string | null;
	referer: string | null;
	urlOrigin: string;
}): MemberBackLink {
	const { backQuery, referer, urlOrigin } = params;

	if (backQuery && backQuery in BACK_LINKS) {
		const key = backQuery as BackKey;
		return { key, ...BACK_LINKS[key] };
	}

	if (referer) {
		try {
			const ref = new URL(referer);
			if (ref.origin === urlOrigin) {
				const key = fromPathname(ref.pathname);
				if (key) return { key, ...BACK_LINKS[key] };
			}
		} catch {
			// ignore invalid referer
		}
	}

	return { key: "members", ...BACK_LINKS.members };
}
