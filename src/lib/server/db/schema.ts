import {
	pgTable,
	integer,
	text,
	timestamp,
	date,
	boolean,
	doublePrecision
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
	mbr: integer("mbr"),
	/** Member since — stored as `timestamptz` (calendar day = UTC midnight). */
	msd: timestamp("msd", { withTimezone: true, mode: "date" }),
	sponsor: text("sponsor"),
	/** When true, member is deceased (memorial) — excluded from keg buying duty on /stats. */
	dops: boolean("dops").notNull().default(false),
	dops_date: date("dops_date"),
	meeting_1_date: date("meeting_1_date", { mode: "date" }),
	meeting_2_date: date("meeting_2_date", { mode: "date" }),
	meeting_3_date: date("meeting_3_date", { mode: "date" }),
	bio: text("bio"),
	hobbies: text("hobbies"),
	likes: text("likes"),
	test_passed: timestamp("test_passed", { withTimezone: true, mode: "date" }),
	created_at: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
	updated_at: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow()
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
