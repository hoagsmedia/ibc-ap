import type { User } from "$lib/server/db/schema";

/** Dashboard session access: admins always; others need `account_active`. */
export function canAccessPlatform(user: Pick<User, "role" | "account_active">): boolean {
	return user.role === "admin" || user.account_active === true;
}
