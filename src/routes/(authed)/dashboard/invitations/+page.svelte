<script lang="ts">
	import type { PageData } from "./$types";
	import * as Card from "$lib/components/ui/card";
	import HubBackLink from "$lib/components/HubBackLink.svelte";
	import { Badge } from "$lib/components/ui/badge";
	import CustomCopy from "$lib/components/Custom-Copy.svelte";
	import { formatDateTime } from "$lib/utils";
	import { LinkIcon, ArrowLeftIcon, CheckIcon, ClockIcon } from "@lucide/svelte/icons";

	let { data }: { data: PageData } = $props();
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
				Every signup link you have created, newest first. Copy an active link to share it.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if data.invitations.length === 0}
				<p class="text-muted-foreground py-8 text-center text-sm">
					You haven’t created any invitation links yet.
				</p>
			{:else}
				<ul class="space-y-2">
					{#each data.invitations as invitation (invitation.token)}
						<li
							class="flex min-h-10 flex-row flex-nowrap items-center gap-2 rounded-xl border px-3 py-2"
						>
							<div class="flex min-w-0 flex-1 flex-nowrap items-center gap-x-2 overflow-hidden">
								<span class="font-mono text-xs shrink-0 tabular-nums text-foreground">
									{invitation.token.slice(0, 8)}…
								</span>
								<span class="text-muted-foreground shrink-0 text-xs" aria-hidden="true">·</span>
								<span class="text-muted-foreground min-w-0 truncate text-xs">
									Created {formatDateTime(invitation.created_at)}
								</span>
							</div>
							<div class="flex shrink-0 flex-nowrap items-center gap-2">
								{#if invitation.used_at}
									<Badge variant="secondary" class="shrink-0 whitespace-nowrap">
										<CheckIcon class="mr-1 size-3" />
										Used
									</Badge>
								{:else if Date.now() >= new Date(invitation.expires_at).getTime()}
									<Badge variant="destructive" class="shrink-0 whitespace-nowrap">
										<ClockIcon class="mr-1 size-3" />
										Expired
									</Badge>
								{:else}
									<Badge class="shrink-0 whitespace-nowrap">
										<ClockIcon class="mr-1 size-3" />
										Active
									</Badge>
									<CustomCopy
										text={`${data.baseUrl}/invite/${invitation.token}`}
										ariaLabel="Copy invitation link"
									/>
								{/if}
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
