<script lang="ts">
	import { Badge } from "$lib/components/ui/badge";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";
	import { formatDate } from "$lib/utils";
	import CustomCopy from "$lib/components/Custom-Copy.svelte";
	import InvitationProgressBadge from "$lib/components/dashboard/InvitationProgressBadge.svelte";
	import {
		inviteDashboardRowGridClass,
		inviteDashboardTokenColClass
	} from "$lib/dashboard-hub-classes";
	import { CheckIcon, ClockIcon } from "@lucide/svelte/icons";

	type DashboardInvitation = {
		token: string;
		invite_name: string | null;
		created_at: Date;
		expires_at: Date;
		used_at: Date | null;
		used_by_id: string | null;
		prospectMeetingCount: number | null;
		redeemerMbr: number | null;
	};

	let {
		invitation,
		baseUrl,
		isHighlighted = false,
		inviteCopyBtnClass,
		inviteRowHighlightClass,
		inviteRowIdleClass,
		inviteRowShellClass
	}: {
		invitation: DashboardInvitation;
		baseUrl: string;
		isHighlighted?: boolean;
		inviteCopyBtnClass: string;
		inviteRowHighlightClass: string;
		inviteRowIdleClass: string;
		inviteRowShellClass: string;
	} = $props();

	const inviteUrl = $derived(`${baseUrl}/invite/${invitation.token}`);
	const canCopyInvite = $derived(
		!invitation.used_at && Date.now() < new Date(invitation.expires_at).getTime()
	);
	const rowChrome = $derived(isHighlighted ? inviteRowHighlightClass : inviteRowIdleClass);
</script>

<li class="{inviteRowShellClass} list-none p-0">
	<div class="{inviteDashboardRowGridClass} {rowChrome}">
		<div
			class="dark:text-foreground flex min-w-0 items-center px-2 py-2 text-xs font-medium text-white/92 sm:px-3"
		>
			<div class="flex min-w-0 flex-1 items-center gap-2">
				<span class="min-w-0 truncate">{invitation.invite_name?.trim() || "—"}</span>
				<div class="flex shrink-0 justify-center">
					<Tooltip.Root>
						<Tooltip.Trigger>
							{#snippet child({ props })}
								<span {...props}>
									<InvitationProgressBadge
										usedById={invitation.used_by_id}
										redeemerMbr={invitation.redeemerMbr}
										prospectMeetingCount={invitation.prospectMeetingCount}
									/>
								</span>
							{/snippet}
						</Tooltip.Trigger>
						<Tooltip.Content side="top" align="center" sideOffset={6}>
							<p>
								{invitation.redeemerMbr != null ? "Joined as member" : "Meetings logged"}
							</p>
						</Tooltip.Content>
					</Tooltip.Root>
				</div>
			</div>
		</div>
		<div class="{inviteDashboardTokenColClass} dark:text-muted-foreground">
			<span class="truncate font-mono text-xs text-white/88 tabular-nums">
				{invitation.token.slice(0, 8)}…
			</span>
		</div>
		<div
			class="dark:text-muted-foreground flex min-w-0 items-center px-2 py-2 text-xs text-white/78 sm:px-3"
		>
			<span class="min-w-0 truncate">Created {formatDate(invitation.created_at)}</span>
		</div>
		<div class="flex min-h-10 min-w-0 items-center justify-end gap-2 px-2 py-2 sm:px-3">
			<div class="flex min-w-0 shrink-0 items-center justify-end">
				{#if canCopyInvite}
					<Badge class="shrink-0 rounded-sm px-2 py-0.5 text-[10px] whitespace-nowrap">
						<ClockIcon class="mr-1 size-3" />
						Active
					</Badge>
				{:else}
					<Badge
						variant="secondary"
						class="shrink-0 rounded-sm px-2 py-0.5 text-[10px] whitespace-nowrap"
					>
						<CheckIcon class="mr-1 size-3" />
						Used
					</Badge>
				{/if}
			</div>
			<div class="flex size-8 shrink-0 items-center justify-center" aria-hidden={!canCopyInvite}>
				{#if canCopyInvite}
					<CustomCopy
						text={inviteUrl}
						ariaLabel="Copy invitation link for {invitation.invite_name?.trim() || 'this invite'}"
						class={inviteCopyBtnClass}
					/>
				{/if}
			</div>
		</div>
	</div>
</li>
