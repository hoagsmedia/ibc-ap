/**
 * Set `IBC_DEBUG=1` (or `true` / `yes`) to enable `[IBC-LOG]` server logs in development.
 * Keeps default local dev quiet; per-request session logging was a major console + CPU cost.
 */
export function ibcDebugEnabled(): boolean {
	const v = process.env.IBC_DEBUG;
	return v === "1" || v === "true" || v === "yes";
}
