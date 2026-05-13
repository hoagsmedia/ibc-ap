/**
 * Shared Tailwind class strings for dashboard “lounge” hero cards (member hub).
 * Keeps long utilities in one place without changing rendered output.
 */

/** Primary action buttons on dark hero cards (Manage, New invite, etc.). */
export const hubHeroActionBtnClass =
	"gap-1.5 shadow-md transition-all duration-150 hover:shadow-lg hover:brightness-105 active:translate-y-px active:brightness-95 focus-visible:ring-2 focus-visible:ring-amber-200/90 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent min-h-9 px-2.5 sm:px-3";

export const inviteRowIdleClass = "bg-transparent hover:bg-white/[0.04] dark:hover:bg-white/[0.05]";

export const inviteRowHighlightClass =
	"bg-emerald-500/[0.07] shadow-[inset_0_0_0_1px_rgba(52,211,153,0.22)] hover:bg-emerald-500/[0.1] dark:bg-emerald-500/[0.08] dark:shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)] dark:hover:bg-emerald-500/[0.11]";

export const inviteRowShellClass =
	"flex min-h-10 flex-nowrap items-center border-b border-white/10 transition-colors last:border-b-0 dark:border-border/35";

/**
 * Upcoming events table row: fixed columns so cells align (title flexes most; status fixed for “Public” / “Members”).
 * Date track ~`DD-MMM-YY` (narrow); below `sm`, description column is omitted (hidden).
 */
export const upcomingEventsRowGridClass =
	"grid w-full min-w-0 min-h-10 max-sm:grid-cols-[minmax(0,1fr)_6.75rem_5.5rem] sm:grid-cols-[minmax(0,1fr)_6.75rem_minmax(11rem,15rem)_5.5rem] items-center divide-x divide-white/15 dark:divide-border/40";

/**
 * Dashboard “Invites this year” rows: name flexes (`1fr`); token fixed; created + status/copy ~130px each.
 * Requires `@container/invite-widget` on the wrapping `<ul>`. Below ~500px container width the token column hides.
 */
export const inviteDashboardRowGridClass =
	"grid w-full min-w-0 min-h-10 grid-cols-[minmax(0,1fr)_7.25rem_130px_minmax(9.25rem,1fr)] @max-[500px]/invite-widget:grid-cols-[minmax(0,1fr)_130px_minmax(9.25rem,1fr)] items-center divide-x divide-white/15 dark:divide-border/40";

/** Token preview column — hidden when invite-widget container is narrow */
export const inviteDashboardTokenColClass =
	"flex min-w-0 items-center justify-center px-2 py-2 sm:px-3 @max-[500px]/invite-widget:hidden";

export const inviteCopyBtnClass =
	"min-h-8 min-w-8 shrink-0 border-white/35 bg-black/35 text-white shadow-sm hover:bg-black/50 hover:text-white";

/** Left-to-right dark scrim (shared across welcome, prospects, invites, events). */
export const hubHeroScrimLrClass =
	"pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-black/78 via-black/45 to-black/10";

/** Top/bottom vignette scrim. */
export const hubHeroScrimTbClass =
	"pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/55 via-transparent to-black/25";

/** Optional mid wash (invitation + events cards). */
export const hubCardMidWashClass =
	"ibc-invites-card-bg pointer-events-none absolute inset-0 z-[1] opacity-[0.12] dark:opacity-[0.35]";
