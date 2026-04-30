<script lang="ts">
	import { Badge } from "$lib/components/ui/badge";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";
	import { Separator } from "$lib/components/ui/separator";
	import { formatDateTime } from "$lib/utils";
	import CustomCopy from "$lib/components/Custom-Copy.svelte";
	import ProspectMeetingBadge from "$lib/components/dashboard/ProspectMeetingBadge.svelte";
	import { CheckIcon, ClockIcon } from "@lucide/svelte/icons";

	type DashboardInvitation = {
		token: string;
		invite_name: string | null;
		created_at: Date;
		expires_at: Date;
		used_at: Date | null;
		prospectMeetingCount: number | null;
	};

	let {
		invitation,
		baseUrl,
		isHighlighted = false,
		hubTableColSepClass,
		inviteCopyBtnClass,
		inviteRowHighlightClass,
		inviteRowIdleClass,
		inviteRowShellClass
	}: {
		invitation: DashboardInvitation;
		baseUrl: string;
		isHighlighted?: boolean;
		hubTableColSepClass: string;
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
	<div class="flex min-h-10 w-full min-w-0 flex-nowrap items-center {rowChrome}">
		<div
			class="dark:text-foreground flex w-max max-w-[9rem] shrink-0 items-center px-2 py-2 text-xs font-medium text-white/92 sm:max-w-[11rem] sm:px-3"
		>
			<div class="flex items-center gap-2 truncate">
				<span class="truncate">{invitation.invite_name?.trim() || "—"}</span>
				<div class="flex w-6 shrink-0 justify-center">
					<Tooltip.Root>
						<Tooltip.Trigger>
							{#snippet child({ props })}
								<span {...props}>
									<ProspectMeetingBadge count={invitation.prospectMeetingCount} />
								</span>
							{/snippet}
						</Tooltip.Trigger>
						<Tooltip.Content side="top" align="center" sideOffset={6}>
							<p>Meetings logged</p>
						</Tooltip.Content>
					</Tooltip.Root>
				</div>
			</div>
		</div>
		<div class="flex shrink-0 items-center">
			<Separator orientation="vertical" class={hubTableColSepClass} />
			<div class="flex items-center px-2 py-2 sm:px-3">
				<span class="dark:text-muted-foreground font-mono text-xs text-white/88 tabular-nums">
					{invitation.token.slice(0, 8)}…
				</span>
			</div>
		</div>
		<div class="flex min-w-0 flex-1 items-center">
			<Separator orientation="vertical" class={hubTableColSepClass} />
			<div
				class="dark:text-muted-foreground flex min-w-0 flex-1 items-center px-2 py-2 text-xs text-white/78 sm:px-3"
			>
				<span class="truncate">Created {formatDateTime(invitation.created_at)}</span>
			</div>
		</div>
		<div class="flex shrink-0 items-center">
			<Separator orientation="vertical" class={hubTableColSepClass} />
			<div class="flex min-h-10 shrink-0 items-center gap-2 px-2 py-2 sm:px-3">
				<div class="flex w-[6.5rem] shrink-0 items-center justify-start sm:w-[7rem]">
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
	</div>
</li>
