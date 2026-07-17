import { fail, redirect } from "@sveltejs/kit";
import { hash } from "argon2";
import { z } from "zod";
import {
	completeMemberRolloutActivation,
	validateMemberRolloutToken
} from "$lib/server/member-rollout";
import {
	enforceRateLimits,
	getClientIp,
	hashIdentifier,
	TOKEN_ACTIVATION_IP_RULE,
	TOKEN_ACTIVATION_TOKEN_RULE,
	RATE_LIMITED_MESSAGE
} from "$lib/server/rate-limit";
import type { Actions, PageServerLoad } from "./$types";

const activateSchema = z
	.object({
		password: z.string().min(8, "At least 8 characters").max(24, "At most 24 characters"),
		confirmPassword: z.string().min(8).max(24)
	})
	.refine((d) => d.password === d.confirmPassword, {
		message: "Passwords must match",
		path: ["confirmPassword"]
	});

export const load: PageServerLoad = async ({ params }) => {
	const token = params.token?.trim();
	if (!token) {
		return { valid: false as const };
	}
	const state = await validateMemberRolloutToken(token);
	if (!state.valid || !state.target) {
		return { valid: false as const };
	}
	return {
		valid: true as const,
		recipientName: state.target.name
	};
};

export const actions: Actions = {
	default: async (event) => {
		const { request, params } = event;
		const token = params.token?.trim();
		if (!token) {
			return fail(400, { message: "Invalid link." });
		}

		// Throttle guesses/replays per IP and per token before hashing/DB work.
		const rate = await enforceRateLimits([
			{
				scope: "rollout-activate:ip",
				identifier: getClientIp(event),
				rule: TOKEN_ACTIVATION_IP_RULE
			},
			{
				scope: "rollout-activate:token",
				identifier: hashIdentifier(token),
				rule: TOKEN_ACTIVATION_TOKEN_RULE
			}
		]);
		if (rate.limited) {
			return fail(429, { message: RATE_LIMITED_MESSAGE });
		}

		const formData = await request.formData();
		const parsed = activateSchema.safeParse({
			password: formData.get("password"),
			confirmPassword: formData.get("confirmPassword")
		});
		if (!parsed.success) {
			const fe = parsed.error.flatten().fieldErrors;
			return fail(400, {
				message: fe.password?.[0] ?? fe.confirmPassword?.[0] ?? "Check the form and try again."
			});
		}

		const passwordHash = await hash(parsed.data.password);
		const result = await completeMemberRolloutActivation(token, passwordHash);

		if (!result.ok) {
			return fail(400, { message: result.message });
		}

		throw redirect(302, "/login?memberRolloutActivated=1");
	}
};
