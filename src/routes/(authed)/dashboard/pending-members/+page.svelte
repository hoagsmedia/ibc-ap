<script lang="ts">
	import type { PageData } from "./$types";
	import { enhance } from "$app/forms";
	import { goto, invalidateAll } from "$app/navigation";
	import * as Card from "$lib/components/ui/card";
	import HubBackLink from "$lib/components/HubBackLink.svelte";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { UserPlusIcon, UserCogIcon, CheckIcon, ArrowLeftIcon } from "@lucide/svelte/icons";
	import { toastAdminActionFailure } from "$lib/admin-action-toast";
	import { formatDate } from "$lib/utils";
	import { toast } from "svelte-sonner";

	let { data, form }: { data: PageData; form: import("./$types").ActionData } = $props();
</script>

<svelte:head>
	<title>Prospects | Island Beer Club</title>
	<meta name="description" content="Manage Prospects who passed the test" />
</svelte:head>

<div class="w-full min-w-0">
	<Card.Root class="ibc-hub-surface bg-card/50 dark:bg-card/35">
		<Card.Header>
			<div class="flex flex-wrap items-center justify-between gap-3">
				<Card.Title class="flex min-w-0 items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
					<UserPlusIcon class="size-6 shrink-0 sm:size-7" />
					Prospects
				</Card.Title>
				<HubBackLink href="/dashboard" size="sm" class="gap-2 shrink-0">
					<ArrowLeftIcon class="size-4" />
					Back to dashboard
				</HubBackLink>
			</div>
			<Card.Description>
				Prospects who passed the test and don’t have a member number yet. Open a profile to accept them
				and assign a member number (MBR).
			</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if data.pendingMembers.length === 0}
				<p class="text-muted-foreground py-8 text-center text-sm">
					No Prospects waiting. When someone signs up and passes the test, they’ll appear here.
				</p>
			{:else}
				{#if form?.success}
					<p
						class="bg-muted text-muted-foreground mb-4 flex items-center gap-2 rounded-md px-3 py-2 text-sm"
					>
						<CheckIcon class="size-4" />
						{form.message}
					</p>
				{:else if form?.message}
					<p class="bg-destructive/10 text-destructive mb-4 rounded-md px-3 py-2 text-sm">
						{form.message}
					</p>
				{/if}
				<ul class="space-y-2">
					{#each data.pendingMembers as pending (pending.id)}
						<li
							id="prospect-{pending.id}"
							class="flex flex-col gap-3 scroll-mt-24 rounded-lg border p-4 sm:flex-row sm:flex-nowrap sm:items-center sm:justify-between sm:gap-4"
						>
							<a
								href="/members/{pending.id}/edit"
								class="text-primary hover:bg-muted/50 flex min-w-0 flex-1 items-start gap-3 rounded transition-colors sm:items-center"
							>
								<div
									class="bg-muted flex size-10 shrink-0 items-center justify-center rounded-full"
								>
									<UserCogIcon class="text-muted-foreground size-5" />
								</div>
								<div
									class="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:flex-nowrap sm:items-center sm:gap-x-3 sm:gap-y-0"
								>
									<span class="font-medium shrink-0">{pending.name}</span>
									{#if pending.email}
										<span class="text-muted-foreground min-w-0 truncate text-sm">{pending.email}</span>
									{/if}
									<span class="text-muted-foreground shrink-0 text-sm">
										Passed {formatDate(pending.test_passed)}
									</span>
								</div>
							</a>
							<form
								method="post"
								action="?/assignMember"
								use:enhance={() => {
									return async ({ result, update }) => {
										await update();
										if (
											result.type === "success" &&
											result.data &&
											"success" in result.data &&
											result.data.success
										) {
											const data = result.data as {
												message?: string;
												memberId?: string;
											};
											const msg = data.message ?? "Member assigned";
											const memberId = data.memberId;
											toast.success(msg, {
												duration: 12_000,
												action: memberId
													? {
															label: "View profile",
															onClick: () => {
																void goto(`/members/${memberId}`);
															}
														}
													: undefined
											});
											await invalidateAll();
										} else if (result.type === "failure") {
											toastAdminActionFailure(
												result.data,
												"Could not assign member number."
											);
										}
									};
								}}
								class="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-nowrap"
							>
								<input type="hidden" name="userId" value={pending.id} />
								<label for="mbr-{pending.id}" class="sr-only">Member number</label>
								<Input
									id="mbr-{pending.id}"
									name="mbr"
									type="number"
									min="1"
									step="0.1"
									placeholder="MBR"
									class="h-9 w-24"
									required
								/>
								<Button type="submit" size="sm">Assign</Button>
							</form>
						</li>
					{/each}
				</ul>
				<p class="text-muted-foreground mt-4 text-sm">
					Enter a member number and click Assign to accept them (role is set to Member
					automatically). You can still open their profile to edit other details.
				</p>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
