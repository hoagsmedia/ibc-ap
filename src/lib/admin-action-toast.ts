import { toast, type ExternalToast } from "svelte-sonner";

/** Default Sonner options for admin form / action error feedback. */
export const adminActionToastDefaults: ExternalToast = {
	duration: 10_000,
	position: "bottom-right"
};

export function toastAdminActionError(message: string, options?: ExternalToast): void {
	toast.error(message, { ...adminActionToastDefaults, ...options });
}

/**
 * Shows `result.data.message` from a SvelteKit `fail(..., { message })`, or `fallbackMessage`.
 */
export function toastAdminActionFailure(
	resultData: unknown,
	fallbackMessage: string,
	options?: ExternalToast
): void {
	const opts = { ...adminActionToastDefaults, ...options };
	if (resultData && typeof resultData === "object" && "message" in resultData) {
		const m = (resultData as { message?: unknown }).message;
		if (typeof m === "string" && m.trim()) {
			toast.error(m.trim(), opts);
			return;
		}
	}
	toast.error(fallbackMessage, opts);
}
