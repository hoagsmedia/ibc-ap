<script lang="ts">
	/**
	 * Invite progress column (dashboard): decide badge in this order only:
	 * 1. Unused invite → em dash.
	 * 2. Redeemer has a member number (`mbr`) → Member (covers legacy members who joined before meeting-* columns existed).
	 * 3. Otherwise → count of logged prospect meetings (0–3).
	 */
	import { Badge } from "$lib/components/ui/badge";
	import ProspectMeetingBadge from "$lib/components/dashboard/ProspectMeetingBadge.svelte";

	let {
		usedById,
		redeemerMbr,
		prospectMeetingCount,
		class: className = ""
	}: {
		/** Redeemed invite — `used_by_id` on the invitation row */
		usedById: string | null;
		/** Club member number (`users.mbr`) — when set, show Member instead of meeting count */
		redeemerMbr: number | null;
		prospectMeetingCount: number | null;
		class?: string;
	} = $props();

	const inviteUsed = $derived(Boolean(usedById));
	const hasMemberNumber = $derived(redeemerMbr != null);
	const prospectMeetingsLogged = $derived(prospectMeetingCount ?? 0);
</script>

{#if !inviteUsed}
	<ProspectMeetingBadge count={null} class={className} />
{:else if hasMemberNumber}
	<Badge
		variant="secondary"
		class={`flex min-w-[1.5rem] shrink-0 justify-center rounded-sm bg-emerald-100 px-1.5 py-0 text-[10px] text-emerald-700 tabular-nums dark:bg-emerald-950/40 dark:text-emerald-300 ${className}`}
	>
		Member
	</Badge>
{:else}
	<ProspectMeetingBadge count={prospectMeetingsLogged} class={className} />
{/if}
