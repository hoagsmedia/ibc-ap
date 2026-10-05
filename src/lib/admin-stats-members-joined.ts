/** One counted `users` row in a "Member growth by year" bucket. Display fields only. */
export type JoinedYearMember = { name: string; mbr: number | null };

export type MembersJoinedYear = {
	year: number;
	/** Number of counted rows; always equals `members.length`. */
	count: number;
	members: JoinedYearMember[];
};
