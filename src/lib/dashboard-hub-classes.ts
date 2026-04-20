/**
 * Shared Tailwind class strings for dashboard “lounge” hero cards (member hub).
 * Keeps long utilities in one place without changing rendered output.
 */

/** Primary action buttons on dark hero cards (Manage, New invite, etc.). */
export const hubHeroActionBtnClass =
	"gap-1.5 shadow-md transition-all duration-150 hover:shadow-lg hover:brightness-105 active:translate-y-px active:brightness-95 focus-visible:ring-2 focus-visible:ring-amber-200/90 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent min-h-9 px-2.5 sm:px-3";

/** Vertical rule between faux table columns. */
export const hubTableColSepClass =
	"!h-5 w-px shrink-0 bg-white/25 data-[orientation=vertical]:!h-5 dark:bg-border";

export const inviteRowIdleClass =
	"bg-transparent hover:bg-white/[0.04] dark:hover:bg-white/[0.05]";

export const inviteRowHighlightClass =
	"bg-emerald-500/[0.07] shadow-[inset_0_0_0_1px_rgba(52,211,153,0.22)] hover:bg-emerald-500/[0.1] dark:bg-emerald-500/[0.08] dark:shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)] dark:hover:bg-emerald-500/[0.11]";

export const inviteRowShellClass =
	"flex min-h-10 flex-nowrap items-center border-b border-white/10 transition-colors last:border-b-0 dark:border-border/35";

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
