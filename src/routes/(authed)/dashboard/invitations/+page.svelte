<script lang="ts">
	import type { PageData } from "./$types";
	import { enhance } from "$app/forms";
	import * as Card from "$lib/components/ui/card";
	import MemberHubPageHeader from "$lib/components/MemberHubPageHeader.svelte";
	import { Badge } from "$lib/components/ui/badge";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import ProspectMeetingBadge from "$lib/components/dashboard/ProspectMeetingBadge.svelte";
	import { formatDateTime } from "$lib/utils";
	import { CheckIcon, ClockIcon, Trash2Icon } from "@lucide/svelte/icons";
	import { toast } from "svelte-sonner";

	let { data }: { data: PageData } = $props();

	const inviteNameCellClass =
		"text-foreground min-w-0 max-w-[10rem] flex-1 truncate px-3 py-2 text-xs font-medium sm:max-w-[14rem]";
	const inviteProgressCellClass = "w-[6rem] shrink-0 px-2 py-2 text-xs";
	const inviteMetaCellClass =
		"text-muted-foreground flex min-w-0 flex-1 items-center gap-x-2 truncate px-2 py-2 text-xs sm:px-3";
	const inviteBadgeClass = "shrink-0 rounded-sm px-2 py-0.5 text-[10px] whitespace-nowrap";
	const inviteTableDesktopGrid =
		"sm:grid sm:grid-cols-[minmax(0,12rem)_6rem_minmax(0,1fr)_7.75rem]";

	async function copyInviteLink(url: string) {
		try {
			await navigator.clipboard.writeText(url);
			toast.success("Invite link copied");
		} catch {
			toast.error("Could not copy link");
		}
	}

	function submitExpiredDelete(token: string) {
		if (typeof document === "undefined") return;
		const form = document.getElementById(`delete-expired-${token}`) as HTMLFormElement | null;
		form?.requestSubmit();
	}
</script>

<svelte:head>
	<title>Your invitations | Island Beer Club</title>
	<meta name="description" content="All invitation links you have created" />
</svelte:head>

<div class="mx-auto w-full max-w-5xl min-w-0">
	<MemberHubPageHeader
		title="Your invitations"
		description="Every signup link you have created, newest first. Click an active row to copy its link."
	/>

	<Card.Root class="ibc-hub-surface bg-card/50 dark:bg-card/35">
		<Card.Content class="pt-6">
			{#if data.invitations.length === 0}
				<p class="text-muted-foreground py-8 text-center text-sm">
					You haven’t created any invitation links yet.
				</p>
			{:else}
				<div
					class={`text-muted-foreground hidden items-center gap-0 rounded-t-lg border border-b-0 px-0 text-xs font-semibold tracking-wide uppercase sm:grid ${inviteTableDesktopGrid}`}
					aria-hidden="true"
				>
					<div class="px-3 py-2">Invite name</div>
					<div class="px-2 py-2 text-center">Progress</div>
					<div class="px-2 py-2 sm:px-3">Token / created</div>
					<div class="px-3 py-2">Status</div>
				</div>
				<ul class="flex flex-col overflow-hidden rounded-b-lg border border-t-0" role="list">
					{#each data.invitations as invitation (invitation.token)}
						{@const inviteUrl = `${data.baseUrl}/invite/${invitation.token}`}
						{@const canCopy =
							!invitation.used_at && Date.now() < new Date(invitation.expires_at).getTime()}
						<li class="border-border/60 list-none border-b p-0 last:border-b-0">
							{#if canCopy}
								<button
									type="button"
									class={`hover:bg-muted/40 font-inherit focus-visible:ring-ring flex min-h-11 w-full flex-row flex-nowrap items-center gap-0 border-0 bg-transparent px-0 py-0 text-left outline-none focus-visible:ring-2 ${inviteTableDesktopGrid}`}
									aria-label="Copy invite link for {invitation.invite_name?.trim() ||
										'this invite'}"
									onclick={() => copyInviteLink(inviteUrl)}
								>
									<div class={inviteNameCellClass}>
										<span class="truncate">{invitation.invite_name?.trim() || "—"}</span>
									</div>
									<div class={`${inviteProgressCellClass} flex items-center justify-center`}>
										<ProspectMeetingBadge count={invitation.prospectMeetingCount} />
									</div>
									<div class={inviteMetaCellClass}>
										<span class="shrink-0 font-mono tabular-nums"
											>{invitation.token.slice(0, 8)}…</span
										>
										<span class="min-w-0 truncate"
											>Created {formatDateTime(invitation.created_at)}</span
										>
									</div>
									<div class="w-[7.75rem] shrink-0 px-3 py-2">
										<Badge class={inviteBadgeClass}>
											<ClockIcon class="mr-1 size-3" />
											Active
										</Badge>
									</div>
								</button>
							{:else if invitation.used_at && invitation.used_by_id}
								<a
									href={`/members/${invitation.used_by_id}?back=invitations`}
									class={`hover:bg-muted/40 focus-visible:ring-ring flex min-h-11 w-full flex-row flex-nowrap items-center gap-0 text-left opacity-90 outline-none focus-visible:ring-2 ${inviteTableDesktopGrid}`}
									aria-label="View profile for {invitation.invite_name?.trim() || 'used invite'}"
								>
									<div class={inviteNameCellClass}>
										<span class="truncate">{invitation.invite_name?.trim() || "—"}</span>
									</div>
									<div class={`${inviteProgressCellClass} flex items-center justify-center`}>
										<ProspectMeetingBadge count={invitation.prospectMeetingCount} />
									</div>
									<div class={inviteMetaCellClass}>
										<span class="shrink-0 font-mono tabular-nums"
											>{invitation.token.slice(0, 8)}…</span
										>
										<span class="min-w-0 truncate"
											>Created {formatDateTime(invitation.created_at)}</span
										>
									</div>
									<div class="w-[7.75rem] shrink-0 px-3 py-2">
										<Badge variant="secondary" class={inviteBadgeClass}>
											<CheckIcon class="mr-1 size-3" />
											Used
										</Badge>
									</div>
								</a>
							{:else}
								<div
									class={`flex min-h-11 flex-row flex-nowrap items-center gap-0 opacity-90 ${inviteTableDesktopGrid}`}
								>
									<div class={inviteNameCellClass}>
										<span class="truncate">{invitation.invite_name?.trim() || "—"}</span>
									</div>
									<div class={`${inviteProgressCellClass} flex items-center justify-center`}>
										<ProspectMeetingBadge count={invitation.prospectMeetingCount} />
									</div>
									<div class={inviteMetaCellClass}>
										<span class="shrink-0 font-mono tabular-nums"
											>{invitation.token.slice(0, 8)}…</span
										>
										<span class="min-w-0 truncate"
											>Created {formatDateTime(invitation.created_at)}</span
										>
									</div>
									<div class="w-[7.75rem] shrink-0 px-3 py-2">
										<DropdownMenu.Root>
											<DropdownMenu.Trigger class="inline-flex">
												<Badge variant="destructive" class={`${inviteBadgeClass} cursor-pointer`}>
													<ClockIcon class="mr-1 size-3" />
													Expired
												</Badge>
											</DropdownMenu.Trigger>
											<DropdownMenu.Content align="start" side="bottom">
												<DropdownMenu.Item
													variant="destructive"
													onclick={() => submitExpiredDelete(invitation.token)}
												>
													<Trash2Icon class="size-3.5" />
													Delete invite
												</DropdownMenu.Item>
											</DropdownMenu.Content>
										</DropdownMenu.Root>
										<form
											id={`delete-expired-${invitation.token}`}
											method="POST"
											action="?/deleteExpired"
											use:enhance={() => {
												return async ({ result, update }) => {
													await update();
													if (result.type === "success") {
														toast.success("Expired invite deleted");
													} else if (result.type === "failure") {
														toast.error(
															typeof result.data?.message === "string"
																? result.data.message
																: "Could not delete expired invite"
														);
													} else if (result.type === "error") {
														toast.error("Could not delete expired invite");
													}
												};
											}}
											class="hidden"
										>
											<input type="hidden" name="token" value={invitation.token} />
										</form>
									</div>
								</div>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
