import { pgTable, integer, text, timestamp, date, boolean } from "drizzle-orm/pg-core";

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
	msd: date("msd"), // member since date
	sponsor: text("sponsor"),
	dops: boolean("dops").notNull().default(false),
	dops_date: date("dops_date"), // date of permanent sobriety
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

export type Event = typeof events.$inferSelect;
