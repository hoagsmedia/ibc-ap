<script lang="ts">
	import { enhance } from "$app/forms";
	import { Badge } from "$lib/components/ui/badge";
	import { Button } from "$lib/components/ui/button";
	import * as Dialog from "$lib/components/ui/dialog";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";
	import {
		inviteDashboardRowGridClass,
		inviteDashboardTokenColClass
	} from "$lib/dashboard-hub-classes";
	import { formatDate } from "$lib/utils";
	import CustomCopy from "$lib/components/Custom-Copy.svelte";
	import InvitationProgressBadge from "$lib/components/dashboard/InvitationProgressBadge.svelte";
	import { CheckIcon, ClockIcon, Mail } from "@lucide/svelte/icons";
	import { toast } from "svelte-sonner";

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
		resendInviteConfigured = false,
		inviteCopyBtnClass,
		inviteRowHighlightClass,
		inviteRowIdleClass,
		inviteRowShellClass
	}: {
		invitation: DashboardInvitation;
		baseUrl: string;
		isHighlighted?: boolean;
		resendInviteConfigured?: boolean;
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
	const prospectTrimmed = $derived(invitation.invite_name?.trim() ?? "");
	const prospectTableCell = $derived(prospectTrimmed || "—");
	const prospectPhrase = $derived(prospectTrimmed || "this invite");

	let emailDialogOpen = $state(false);
	let emailing = $state(false);
	const emailFieldId = $derived(`invite-email-${invitation.token.slice(0, 12)}`);
</script>

<li class="{inviteRowShellClass} list-none p-0">
	<div class="{inviteDashboardRowGridClass} {rowChrome}">
		<div
			class="dark:text-foreground flex min-w-0 items-center px-2 py-2 text-xs font-medium text-white/92 sm:px-3"
		>
			<div class="flex min-w-0 flex-1 items-center gap-2">
				<span class="min-w-0 truncate">{prospectTableCell}</span>
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
		<div class="flex min-h-10 min-w-0 items-center justify-end gap-1 px-2 py-2 sm:gap-2 sm:px-3">
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
			{#if canCopyInvite && resendInviteConfigured}
				<Tooltip.Root>
					<Tooltip.Trigger>
						{#snippet child({ props })}
							<Button
								{...props}
								type="button"
								variant="ghost"
								size="icon"
								class="size-8 shrink-0 text-white/88 hover:bg-white/10 hover:text-white"
								aria-label="Email invitation link for {prospectPhrase}"
								onclick={() => {
									emailDialogOpen = true;
								}}
							>
								<Mail class="size-4" />
							</Button>
						{/snippet}
					</Tooltip.Trigger>
					<Tooltip.Content side="top">Email link</Tooltip.Content>
				</Tooltip.Root>
				<Dialog.Root bind:open={emailDialogOpen}>
					<Dialog.Content class="sm:max-w-md">
						<Dialog.Header>
							<Dialog.Title>Email invitation</Dialog.Title>
							<Dialog.Description>
								Email the signup link for {prospectPhrase}.
							</Dialog.Description>
						</Dialog.Header>
						<form
							method="post"
							action="?/emailInvitation"
							class="flex flex-col gap-4"
							use:enhance={() => {
								emailing = true;
								return async ({ result, update }) => {
									await update({ reset: true });
									emailing = false;
									if (result.type === "success") {
										emailDialogOpen = false;
										toast.success("Invitation emailed.");
									} else if (result.type === "failure") {
										const msg = result.data?.message;
										toast.error(typeof msg === "string" ? msg : "Could not send email.");
									}
								};
							}}
						>
							<input type="hidden" name="token" value={invitation.token} />
							<div class="flex flex-col gap-2">
								<Label for={emailFieldId}>Recipient email</Label>
								<Input
									id={emailFieldId}
									name="recipientEmail"
									type="email"
									required
									autocomplete="email"
									placeholder="prospect@example.com"
									disabled={emailing}
								/>
							</div>
							<Dialog.Footer>
								<Button
									type="button"
									variant="outline"
									disabled={emailing}
									onclick={() => {
										emailDialogOpen = false;
									}}
								>
									Cancel
								</Button>
								<Button type="submit" disabled={emailing} class="gap-1.5">
									{#if emailing}
										<span>Sending…</span>
									{:else}
										<span>Send email</span>
									{/if}
								</Button>
							</Dialog.Footer>
						</form>
					</Dialog.Content>
				</Dialog.Root>
			{/if}
			<div class="flex size-8 shrink-0 items-center justify-center">
				{#if canCopyInvite}
					<CustomCopy
						text={inviteUrl}
						ariaLabel="Copy invitation link for {prospectPhrase}"
						class={inviteCopyBtnClass}
					/>
				{/if}
			</div>
		</div>
	</div>
</li>
