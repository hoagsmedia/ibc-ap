import {
	pgTable,
	integer,
	text,
	timestamp,
	date,
	boolean,
	doublePrecision,
	smallint,
	index,
	primaryKey
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	age: integer("age"),
	username: text("username").notNull().unique(),
	password_hash: text("password_hash").notNull()
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	expires_at: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull()
});

export const users = pgTable("users", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	username: text("username").unique(),
	email: text("email").unique(),
	phone: text("phone"),
	address: text("address"),
	password_hash: text("password_hash").notNull(),
	img: text("img"),
	role: text("role", { enum: ["guest", "member", "admin"] })
		.notNull()
		.default("guest"),
	mbr: doublePrecision("mbr"),
	/** Member since — stored as `timestamptz` (calendar day = UTC midnight). */
	msd: timestamp("msd", { withTimezone: true, mode: "date" }),
	sponsor: text("sponsor"),
	/** When true, member is deceased (memorial) — excluded from keg buying duty on /stats. */
	dops: boolean("dops").notNull().default(false),
	dops_date: date("dops_date"),
	/** Date the member officially rang in. */
	rung_in_date: date("rung_in_date"),
	meeting_1_date: date("meeting_1_date", { mode: "date" }),
	meeting_2_date: date("meeting_2_date", { mode: "date" }),
	meeting_3_date: date("meeting_3_date", { mode: "date" }),
	bio: text("bio"),
	hobbies: text("hobbies"),
	likes: text("likes"),
	test_passed: timestamp("test_passed", { withTimezone: true, mode: "date" }),
	/**
	 * Website / dashboard access. Admins are always treated as active in auth.
	 * Rolled-out members: true after they complete a member rollout activation link.
	 */
	account_active: boolean("account_active").notNull().default(false),
	/** First successful website login; used for “eligible to send member rollout” (non-admins). */
	website_first_login_at: timestamp("website_first_login_at", {
		withTimezone: true,
		mode: "date"
	}),
	created_at: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
	updated_at: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow()
});

/**
 * Existing-member rollout (website onboarding only). Separate from prospect `invitation_tokens`.
 */
export const memberRolloutTokens = pgTable("member_rollout_tokens", {
	id: text("id").primaryKey(),
	token: text("token").notNull().unique(),
	created_by_id: text("created_by_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	target_user_id: text("target_user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	recipient_email_snapshot: text("recipient_email_snapshot"),
	created_at: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
	expires_at: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
	used_at: timestamp("used_at", { withTimezone: true, mode: "date" })
});

export const invitationTokens = pgTable("invitation_tokens", {
	id: text("id").primaryKey(),
	token: text("token").notNull().unique(),
	/** Label for who the invite is for (required on new invites). */
	invite_name: text("invite_name"),
	/** Display name of the member who created the link (avoids a `users` join on public invite page). */
	inviter_name: text("inviter_name"),
	created_by_id: text("created_by_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	created_at: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
	expires_at: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
	used_at: timestamp("used_at", { withTimezone: true, mode: "date" }),
	used_by_id: text("used_by_id").references(() => users.id, { onDelete: "set null" })
});

export const events = pgTable("events", {
	id: text("id").primaryKey(),
	img: text("img"),
	title: text("title").notNull(),
	description: text("description"),
	content: text("content"),
	event_date: timestamp("event_date", { withTimezone: true, mode: "date" }),
	location: text("location"),
	/** When true, only logged-in members and admins see this event on /events. */
	members_only: boolean("members_only").notNull().default(false),
	is_published: integer("is_published").notNull().default(0),
	created_by_id: text("created_by_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	created_at: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
	updated_at: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow()
});

export type Session = typeof session.$inferSelect;

export type User = typeof users.$inferSelect;

export type InvitationToken = typeof invitationTokens.$inferSelect;

export type MemberRolloutToken = typeof memberRolloutTokens.$inferSelect;

/** One-time link to set a new password (self-service or admin-initiated). */
export const passwordResetTokens = pgTable("password_reset_tokens", {
	id: text("id").primaryKey(),
	user_id: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	token: text("token").notNull().unique(),
	expires_at: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
	used_at: timestamp("used_at", { withTimezone: true, mode: "date" }),
	created_at: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
	/** `user` = forgot-password flow; `admin` = admin sent reset from member edit. */
	source: text("source", { enum: ["user", "admin"] }).notNull(),
	created_by_admin_id: text("created_by_admin_id").references(() => users.id, {
		onDelete: "set null"
	})
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

export type Event = typeof events.$inferSelect;

/**
 * Legacy islandbeerclub.com/stats.htm — keg credits leaderboard.
 * `sort_order` is a display rank; **who buys next** is whoever has the **lowest `credits`**
 * among members not marked deceased (`users.dops`).
 */
export const statsKegCredits = pgTable("stats_keg_credits", {
	id: text("id").primaryKey(),
	sort_order: integer("sort_order").notNull().unique(),
	member_label: text("member_label").notNull(),
	/** Parsed from legacy `#123` / `#123-1Nov17` suffix on member_label; optional. */
	member_number: integer("member_number"),
	credits: doublePrecision("credits").notNull(),
	is_cik: boolean("is_cik").notNull().default(false),
	created_at: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
	updated_at: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow()
});

/** Per-keg consumption rows from the legacy stats page (keg #, dates, gallons, beer name). */
export const statsBeerConsumed = pgTable("stats_beer_consumed", {
	id: text("id").primaryKey(),
	keg_number: integer("keg_number").notNull().unique(),
	beer_name: text("beer_name"),
	purchased_on: date("purchased_on", { mode: "date" }),
	delivered_on: date("delivered_on", { mode: "date" }),
	finished_on: date("finished_on", { mode: "date" }),
	gallons: doublePrecision("gallons").notNull(),
	created_at: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
	updated_at: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow()
});

export type StatsKegCredit = typeof statsKegCredits.$inferSelect;
export type StatsBeerConsumedRow = typeof statsBeerConsumed.$inferSelect;

/** Beer Log: a member's "what I'm drinking" check-in (members-only feed on /dashboard/beer-log). */
export const beerCheckins = pgTable(
	"beer_checkins",
	{
		id: text("id").primaryKey(),
		user_id: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		beer_name: text("beer_name").notNull(),
		brewery: text("brewery"),
		/** 1–5 stars (CHECK constraint in scripts/ensure-beer-log-schema.ts). */
		rating: smallint("rating").notNull(),
		note: text("note"),
		created_at: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow()
	},
	(t) => [
		index("beer_checkins_created_at_idx").on(t.created_at),
		index("beer_checkins_user_id_idx").on(t.user_id)
	]
);

/** One 🍻 per member per check-in. */
export const beerCheers = pgTable(
	"beer_cheers",
	{
		checkin_id: text("checkin_id")
			.notNull()
			.references(() => beerCheckins.id, { onDelete: "cascade" }),
		user_id: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		created_at: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow()
	},
	(t) => [primaryKey({ columns: [t.checkin_id, t.user_id] })]
);

export type BeerCheckin = typeof beerCheckins.$inferSelect;
