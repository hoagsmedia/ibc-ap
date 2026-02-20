<script lang="ts">
	import type { PageData } from "./$types";
	import * as Card from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { UserPlusIcon, ArrowLeftIcon, UserCogIcon } from "@lucide/svelte/icons";
	import { formatDate } from "$lib/utils";

	let { data }: { data: PageData } = $props();
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
				<ul class="space-y-2">
					{#each data.pendingMembers as pending (pending.id)}
						<li>
							<a
								href="/members/{pending.id}/edit"
								class="text-primary hover:bg-muted/50 flex items-center gap-3 rounded-lg border p-4 transition-colors"
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
						</li>
					{/each}
				</ul>
				<p class="text-muted-foreground mt-4 text-sm">
					Click a row to open their profile. Set role to Member and assign an MBR number to accept them.
				</p>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
