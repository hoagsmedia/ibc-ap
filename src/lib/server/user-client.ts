import type { User } from "./db/schema";

/** Safe to serialize to the browser — never includes `password_hash`. */
export type UserForClient = Omit<User, "password_hash">;

export function userWithoutPasswordHash(user: User): UserForClient {
	const { password_hash: _, ...safe } = user;
	return safe;
}
