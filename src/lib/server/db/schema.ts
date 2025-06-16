import { pgTable, integer, text, timestamp, date } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	age: integer('age'),
	username: text('username').notNull().unique(),
	password_hash: text('password_hash').notNull()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expires_at: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const users = pgTable('users', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	password_hash: text('password_hash').notNull(),
	bio: text('bio'),
	hobbies: text('hobbies'),
	img: text('img'),
	phone: text('phone'),
	role: text('role', { enum: ['guest', 'member', 'admin'] })
		.notNull()
		.default('guest'),
	likes: text('likes'),
	mbr: integer('mbr'),
	msd: date('msd'), // member since date
	sponsor: text('sponsor'),
	test_passed: timestamp('test_passed', { withTimezone: true, mode: 'date' }),
	created_at: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updated_at: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

export const invitationTokens = pgTable('invitation_tokens', {
	id: text('id').primaryKey(),
	token: text('token').notNull().unique(),
	created_by_id: text('created_by_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	created_at: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	expires_at: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
	used_at: timestamp('used_at', { withTimezone: true, mode: 'date' }),
	used_by_id: text('used_by_id').references(() => users.id, { onDelete: 'set null' })
});

export type Session = typeof session.$inferSelect;

export type User = typeof users.$inferSelect;

export type InvitationToken = typeof invitationTokens.$inferSelect;
