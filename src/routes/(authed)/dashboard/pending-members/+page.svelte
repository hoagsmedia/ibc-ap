<script lang="ts">
	import type { PageData } from "./$types";
	import { enhance } from "$app/forms";
	import { invalidateAll } from "$app/navigation";
	import * as Card from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { UserPlusIcon, ArrowLeftIcon, UserCogIcon, CheckIcon } from "@lucide/svelte/icons";
	import { formatDate } from "$lib/utils";
	import { toast } from "svelte-sonner";

	let { data, form }: { data: PageData; form: import("./$types").ActionData } = $props();
</script>

<svelte:head>
	<title>New members | Island Beer Club</title>
	<meta name="description" content="Manage new members who passed the test" />
</svelte:head>

<div class="px-4 py-6 sm:px-0">
	<div class="mb-6 flex items-center justify-between gap-4">
		<Button href="/dashboard" variant="ghost" size="sm" class="gap-2">
			<ArrowLeftIcon class="size-4" />
			Back to dashboard
		</Button>
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<UserPlusIcon class="size-5" />
				New potential members
			</Card.Title>
			<Card.Description>
				People who passed the test and don’t have a member number yet. Open a profile to accept them and assign a member number (MBR).
			</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if data.pendingMembers.length === 0}
				<p class="text-muted-foreground py-8 text-center text-sm">
					No new members waiting. When someone signs up and passes the test, they’ll appear here.
				</p>
			{:else}
				{#if form?.success}
					<p class="bg-muted text-muted-foreground mb-4 flex items-center gap-2 rounded-md px-3 py-2 text-sm">
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
							class="flex flex-wrap items-center gap-3 rounded-lg border p-4 sm:flex-nowrap"
						>
							<a
								href="/members/{pending.id}/edit"
								class="text-primary hover:bg-muted/50 flex min-w-0 flex-1 items-center gap-3 rounded transition-colors"
							>
								<div class="bg-muted flex size-10 shrink-0 items-center justify-center rounded-full">
									<UserCogIcon class="text-muted-foreground size-5" />
								</div>
								<div class="min-w-0 flex-1">
									<span class="font-medium">{pending.name}</span>
									{#if pending.email}
										<span class="text-muted-foreground block truncate text-sm">{pending.email}</span>
									{/if}
								</div>
								<span class="text-muted-foreground shrink-0 text-sm">
									Passed {formatDate(pending.test_passed)}
								</span>
							</a>
							<form
								method="post"
								action="?/assignMember"
								use:enhance={() => {
									return async ({ result, update }) => {
										await update();
										if (result.type === "success" && result.data && "success" in result.data && result.data.success) {
											toast.success((result.data as { message?: string }).message ?? "Member assigned");
											await invalidateAll();
										} else if (result.type === "failure" && result.data && "message" in result.data) {
											toast.error((result.data as { message: string }).message);
										}
									};
								}}
								class="flex shrink-0 items-center gap-2"
							>
								<input type="hidden" name="userId" value={pending.id} />
								<label for="mbr-{pending.id}" class="sr-only">Member number</label>
								<Input
									id="mbr-{pending.id}"
									name="mbr"
									type="number"
									min="1"
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
					Enter a member number and click Assign to accept them (role is set to Member automatically). You can still open their profile to edit other details.
				</p>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
