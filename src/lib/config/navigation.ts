export interface NavLink {
	href: string;
	label: string;
	description: string;
}

export const navLinks: NavLink[] = [
	{ href: "/", label: "Home", description: "Return to the homepage." },
	{ href: "/history", label: "History", description: "Our club history." },
	{ href: "/members", label: "Members", description: "Meet our members." },
	{ href: "/events", label: "Events", description: "Upcoming and past events." },
	{ href: "/stats", label: "IBC Stats", description: "View club statistics and records." },
	{ href: "/fun", label: "Fun", description: "Games, jokes, and more." },
	{ href: "/contact", label: "Contact", description: "Get in touch with us." },
	{ href: "/gallery", label: "Gallery", description: "Photo gallery of club events." }
];

export const dropdownLinks: NavLink[] = [
	{ href: "/founders-day", label: "Founders Day", description: "Celebrating our founders." },
	{ href: "/links", label: "Links", description: "Beer resources and friends." },
	{ href: "/movie", label: "IBC Movie", description: "Watch the IBC movie." },
	{ href: "/foodog", label: "Foo Dogs", description: "Learn about Foo Dogs." },
	{
		href: "/science",
		label: "Science Corner",
		description: "Explore beer science and fun facts."
	},
	{ href: "/styles", label: "Beer Styles", description: "Learn about different beer styles." }
];
