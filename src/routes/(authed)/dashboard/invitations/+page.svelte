<script lang="ts">
	import type { PageData } from "./$types";
	import * as Card from "$lib/components/ui/card";
	import HubBackLink from "$lib/components/HubBackLink.svelte";
	import { Badge } from "$lib/components/ui/badge";
	import { formatDateTime } from "$lib/utils";
	import { LinkIcon, ArrowLeftIcon, CheckIcon, ClockIcon } from "@lucide/svelte/icons";
	import { toast } from "svelte-sonner";

	let { data }: { data: PageData } = $props();

const inviteNameCellClass =
	"text-foreground min-w-0 max-w-[10rem] flex-1 truncate px-3 py-2 text-xs font-medium sm:max-w-[14rem]";
const inviteMetaCellClass =
	"text-muted-foreground flex min-w-0 flex-1 items-center gap-x-2 truncate px-2 py-2 text-xs sm:px-3";
const inviteBadgeClass = "shrink-0 rounded-sm px-2 py-0.5 text-[10px] whitespace-nowrap";

	async function copyInviteLink(url: string) {
		try {
			await navigator.clipboard.writeText(url);
			toast.success("Invite link copied");
		} catch {
			toast.error("Could not copy link");
		}
	}
</script>

<svelte:head>
	<title>Your invitations | Island Beer Club</title>
	<meta name="description" content="All invitation links you have created" />
</svelte:head>

<div class="w-full min-w-0">
	<Card.Root class="ibc-hub-surface bg-card/50 dark:bg-card/35">
		<Card.Header>
			<div class="flex flex-wrap items-center justify-between gap-3">
				<Card.Title class="flex min-w-0 items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
					<LinkIcon class="size-6 shrink-0 sm:size-7" />
					Your invitations
				</Card.Title>
				<HubBackLink href="/dashboard" size="sm" class="gap-2 shrink-0">
					<ArrowLeftIcon class="size-4" />
					Back to dashboard
				</HubBackLink>
			</div>
			<Card.Description>
				Every signup link you have created, newest first. Click an active row to copy its link.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if data.invitations.length === 0}
				<p class="text-muted-foreground py-8 text-center text-sm">
					You haven’t created any invitation links yet.
				</p>
			{:else}
				<ul class="flex flex-col overflow-hidden rounded-lg border" role="list">
					{#each data.invitations as invitation (invitation.token)}
						{@const inviteUrl = `${data.baseUrl}/invite/${invitation.token}`}
						{@const canCopy =
							!invitation.used_at &&
							Date.now() < new Date(invitation.expires_at).getTime()}
						<li class="border-b border-border/60 last:border-b-0 list-none p-0">
							{#if canCopy}
								<button
									type="button"
									class="hover:bg-muted/40 flex min-h-11 w-full flex-row flex-nowrap items-center gap-0 border-0 bg-transparent px-0 py-0 text-left font-inherit outline-none focus-visible:ring-2 focus-visible:ring-ring"
									aria-label="Copy invite link for {invitation.invite_name?.trim() ||
										'this invite'}"
									onclick={() => copyInviteLink(inviteUrl)}
								>
									<div class={inviteNameCellClass}>
										{invitation.invite_name?.trim() || "—"}
									</div>
									<div class={inviteMetaCellClass}>
										<span class="font-mono shrink-0 tabular-nums"
											>{invitation.token.slice(0, 8)}…</span
										>
										<span class="min-w-0 truncate"
											>Created {formatDateTime(invitation.created_at)}</span
										>
									</div>
									<div class="shrink-0 px-3 py-2">
										<Badge class={inviteBadgeClass}>
											<ClockIcon class="mr-1 size-3" />
											Active
										</Badge>
									</div>
								</button>
							{:else}
								<div
									class="flex min-h-11 flex-row flex-nowrap items-center gap-0 opacity-90"
								>
									<div class={inviteNameCellClass}>
										{invitation.invite_name?.trim() || "—"}
									</div>
									<div class={inviteMetaCellClass}>
										<span class="font-mono shrink-0 tabular-nums"
											>{invitation.token.slice(0, 8)}…</span
										>
										<span class="min-w-0 truncate"
											>Created {formatDateTime(invitation.created_at)}</span
										>
									</div>
									<div class="shrink-0 px-3 py-2">
										{#if invitation.used_at}
											<Badge
												variant="secondary"
												class={inviteBadgeClass}
											>
												<CheckIcon class="mr-1 size-3" />
												Used
											</Badge>
										{:else}
											<Badge
												variant="destructive"
												class={inviteBadgeClass}
											>
												<ClockIcon class="mr-1 size-3" />
												Expired
											</Badge>
										{/if}
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
