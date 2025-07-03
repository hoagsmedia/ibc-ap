<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import * as Alert from '$lib/components/ui/alert';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { CheckIcon, ClockIcon, LinkIcon, Copy } from '@lucide/svelte/icons';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import { formatDate, formatDateTime } from '$lib/utils';

	let { data }: { data: PageData } = $props();

	let form = $derived(page.form as ActionData | null);
	let creating = $state(false);

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
	}

	function getRoleBadgeVariant(role: string) {
		switch (role) {
			case 'admin':
				return 'destructive';
			case 'moderator':
				return 'secondary';
			case 'member':
				return 'default';
			default:
				return 'outline';
		}
	}
</script>

<svelte:head>
	<title>Dashboard | Island Beer Club</title>
	<meta name="description" content="Island Beer Club member dashboard" />
</svelte:head>

<div class="px-4 py-6 sm:px-0">
	<div class="border-border rounded-lg border-4 border-dashed p-8">
		<div class="text-center">
			<h1 class="text-foreground mb-4 text-3xl font-bold">Welcome to Your Dashboard</h1>
			<p class="text-muted-foreground mb-8 text-lg">
				Hello, <span class="font-semibold">{data.user?.name}</span>! Welcome to the Island Beer Club
				member area.
			</p>

			{#if data.user}
				<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
					<!-- Member Info Card -->
					<Card.Root class="">
						<Card.Header>
							<Card.Title>Member Information</Card.Title>
						</Card.Header>
						<Card.Content class="space-y-2">
							<div>
								<dt class="text-muted-foreground text-sm font-medium">Name</dt>
								<dd class="text-card-foreground text-sm">{data.user.name}</dd>
							</div>
							<div>
								<dt class="text-muted-foreground text-sm font-medium">Email</dt>
								<dd class="text-card-foreground text-sm">{data.user.email}</dd>
							</div>
							<div>
								<dt class="text-muted-foreground text-sm font-medium">Role</dt>
								<!-- <dd class="text-card-foreground text-sm capitalize">{data.user.role}</dd> -->
								<Badge variant={getRoleBadgeVariant(data.user.role)}>
									{data.user.role.charAt(0).toUpperCase() + data.user.role.slice(1)}
								</Badge>
							</div>
							<div>
								<dt class="text-muted-foreground text-sm font-medium">Member Since</dt>
								<dd class="text-card-foreground text-sm">
									{data.user.msd ? formatDate(new Date(data.user.msd)) : 'Unknown'}
								</dd>
							</div>
						</Card.Content>
					</Card.Root>

					<!-- Quick Actions Card -->
					<Card.Root class="">
						<Card.Header>
							<Card.Title>Quick Actions</Card.Title>
						</Card.Header>
						<Card.Content class="space-y-3">
							<Button
								href="/settings"
								class="bg-accent text-foreground hover:bg-muted/80 block w-full rounded-md px-4 py-2 text-sm font-medium transition-colors"
							>
								Profile Settings
							</Button>
							<Button
								href="/gallery"
								class="bg-accent text-foreground hover:bg-accent/80 block w-full rounded-md px-4 py-2 text-sm font-medium transition-colors"
							>
								View Gallery
							</Button>
							{#if data.user.role === 'admin'}
								<Button
									href="/admin/members"
									class="bg-accent text-foreground hover:bg-secondary/80 block w-full rounded-md px-4 py-2 text-sm font-medium transition-colors"
								>
									Manage Members
								</Button>
							{/if}
							<Button
								href="/members"
								class="bg-accent text-foreground hover:bg-muted/80 block w-full rounded-md px-4 py-2 text-sm font-medium transition-colors"
							>
								Member Directory
							</Button>
						</Card.Content>
					</Card.Root>

					<!-- Club Stats Card -->
					<Card.Root class="">
						<Card.Header>
							<Card.Title>Club Stats</Card.Title>
						</Card.Header>
						<Card.Content class="space-y-3">
							<div class="flex justify-between">
								<span class="text-muted-foreground text-sm">Total Members</span>
								<span class="text-card-foreground text-sm font-medium">436</span>
							</div>
							<div class="flex justify-between">
								<span class="text-muted-foreground text-sm">Active Members</span>
								<span class="text-card-foreground text-sm font-medium">324</span>
							</div>
							<div class="flex justify-between">
								<span class="text-muted-foreground text-sm">Events This Year</span>
								<span class="text-card-foreground text-sm font-medium">12</span>
							</div>
							<div class="flex justify-between">
								<span class="text-muted-foreground text-sm">Kegs Consumed</span>
								<span class="text-card-foreground text-sm font-medium">147</span>
							</div>
						</Card.Content>
					</Card.Root>
				</div>
			{/if}

			<!-- Invitation Management Section -->
			<div class="mt-8">
				<Card.Root>
					<Card.Header>
						<Card.Title class="flex items-center gap-2">
							<LinkIcon class="size-5" />
							Invitation Links
						</Card.Title>
					</Card.Header>
					<Card.Content>
						<!-- Success/Error Messages -->
						{#if form?.success}
							<Alert.Root class="mb-4">
								<CheckIcon class="size-4" />
								<Alert.Title>Success!</Alert.Title>
								<Alert.Description>{form.message}</Alert.Description>
							</Alert.Root>
							{#if form.inviteUrl}
								<div class="bg-secondary mb-4 rounded-md p-4">
									<p class="text-secondary-foreground mb-2 text-sm font-medium">
										Your new invitation link:
									</p>
									<div class="flex items-center gap-2">
										<code
											class="bg-muted text-muted-foreground flex-1 truncate rounded px-2 py-1 text-xs"
										>
											{form.inviteUrl}
										</code>
										<Button
											size="sm"
											variant="outline"
											onclick={() => copyToClipboard(form.inviteUrl)}
										>
											<Copy class="size-3" />
										</Button>
									</div>
								</div>
							{/if}
						{:else if form?.message}
							<Alert.Root class="mb-4" variant="destructive">
								<Alert.Title>Error</Alert.Title>
								<Alert.Description>{form.message}</Alert.Description>
							</Alert.Root>
						{/if}

						<div class="space-y-4">
							{#if !data.user?.test_passed}
								<!-- User hasn't passed the test -->
								<Alert.Root class="mb-4" variant="destructive">
									<ClockIcon class="size-4" />
									<Alert.Title>Test Required</Alert.Title>
									<Alert.Description>
										You must pass the official IBC test before you can create invitation links.
									</Alert.Description>
								</Alert.Root>
								<div class="flex items-center justify-between">
									<p class="text-muted-foreground text-sm">
										Complete the IBC test to unlock the ability to invite new members.
									</p>
									<Button>
										<a href="/test">Take Test</a>
									</Button>
								</div>
							{:else}
								<!-- User has passed the test -->
								<div class="flex flex-col items-center justify-between gap-4 md:flex-row">
									<p class="text-muted-foreground text-sm">
										Create secure, one-time signup links to invite new members.
									</p>
									<form
										method="post"
										action="?/createInvitation"
										use:enhance={() => {
											creating = true;
											return async ({ update }) => {
												await update();
												creating = false;
											};
										}}
									>
										<Button type="submit" disabled={creating}>
											{creating ? 'Creating...' : 'Create Invite Link'}
										</Button>
									</form>
								</div>

								<!-- Existing Invitations -->
								{#if data.invitations && data.invitations.length > 0}
									<div class="space-y-2">
										<h4 class="text-sm font-medium">Recent Invitations</h4>
										<div class="space-y-2">
											{#each data.invitations.slice(0, 5) as invitation}
												<div class="flex items-center justify-between rounded-md border p-3">
													<div class="flex items-center gap-3">
														<div class="flex flex-col">
															<span class="text-muted-foreground font-mono text-xs">
																{invitation.token.slice(0, 8)}...
															</span>
															<span class="text-muted-foreground text-xs">
																Created {formatDateTime(invitation.created_at)}
															</span>
														</div>
													</div>
													<div class="flex items-center gap-2">
														{#if invitation.used_at}
															<Badge variant="secondary">
																<CheckIcon class="mr-1 size-3" />
																Used
															</Badge>
														{:else if Date.now() >= new Date(invitation.expires_at).getTime()}
															<Badge variant="destructive">
																<ClockIcon class="mr-1 size-3" />
																Expired
															</Badge>
														{:else}
															<Badge variant="default">
																<ClockIcon class="mr-1 size-3" />
																Active
															</Badge>
														{/if}
														{#if !invitation.used_at && Date.now() < new Date(invitation.expires_at).getTime()}
															<Button
																size="sm"
																variant="outline"
																onclick={() =>
																	copyToClipboard(`${data.baseUrl}/invite/${invitation.token}`)}
															>
																<Copy class="size-3" />
															</Button>
														{/if}
													</div>
												</div>
											{/each}
										</div>
									</div>
								{/if}
							{/if}
						</div>
					</Card.Content>
				</Card.Root>
			</div>

			<div class="mt-8">
				<Button
					href="/"
					class="bg-accent text-accent-foreground hover:bg-accent/80 focus:ring-ring inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:outline-none"
				>
					← Back to Main Site
				</Button>
			</div>
		</div>
	</div>
</div>
