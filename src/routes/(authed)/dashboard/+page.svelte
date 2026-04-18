<script lang="ts">
	import type { PageData, ActionData } from "./$types";
	import { enhance } from "$app/forms";
	import { page } from "$app/state";
	import * as Alert from "$lib/components/ui/alert";
	import * as Card from "$lib/components/ui/card";
	import { Badge } from "$lib/components/ui/badge";
	import { Button } from "$lib/components/ui/button";
	import {
		BarChart3,
		Beer,
		BookUser,
		CalendarDays,
		CalendarRange,
		CheckIcon,
		ClockIcon,
		Home,
		IdCard,
		Images,
		LayoutGrid,
		LinkIcon,
		Settings,
		UserPlusIcon,
		UserCheck,
		Users
	} from "@lucide/svelte/icons";
	import { formatDate, formatDateTime } from "$lib/utils";
	import CustomCopy from "$lib/components/Custom-Copy.svelte";

	let { data }: { data: PageData } = $props();

	let form = $derived(page.form as ActionData | null);
	let creating = $state(false);

	function getRoleBadgeVariant(role: string) {
		switch (role) {
			case "admin":
				return "destructive";
			case "moderator":
				return "secondary";
			case "member":
				return "default";
			default:
				return "outline";
		}
	}
</script>

<svelte:head>
	<title>Dashboard | Island Beer Club</title>
	<meta name="description" content="Island Beer Club member dashboard" />
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="space-y-10">
		<div
			class="border-border/60 bg-card/80 text-card-foreground relative overflow-hidden rounded-2xl border p-8 shadow-sm backdrop-blur-sm sm:p-10"
		>
			<div
				class="from-primary/8 pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-gradient-to-br to-transparent blur-3xl"
				aria-hidden="true"
			></div>
			<div class="relative text-center">
				<p class="text-muted-foreground mb-2 text-sm font-medium tracking-wide uppercase">
					Member area
				</p>
				<h1 class="text-foreground mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
					Welcome back
				</h1>
				<p class="text-muted-foreground mx-auto max-w-xl text-lg leading-relaxed">
					Hello, <span class="text-foreground font-semibold">{data.user?.name}</span> — here is your
					Island Beer Club home base.
				</p>
			</div>
		</div>

		{#if data.user}
			<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<!-- Member Info Card -->
				<Card.Root class="border-border/60 shadow-sm transition-shadow hover:shadow-md">
					<Card.Header class="pb-4">
						<Card.Title class="flex items-center gap-2 text-lg">
							<span class="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
								<IdCard class="size-4" />
							</span>
							Member information
						</Card.Title>
					</Card.Header>
						<Card.Content class="space-y-2">
							<div class="border-border bg-muted/30 rounded-md border p-3">
								<dt class="text-muted-foreground text-xs font-medium tracking-wide uppercase">
									Member number
								</dt>
								<dd class="text-card-foreground mt-0.5 text-2xl font-bold tabular-nums">
									{#if data.user.mbr != null}
										{data.user.mbr}
									{:else if data.user.test_passed}
										<span class="text-amber-600 dark:text-amber-400">Pending</span>
									{:else}
										—
									{/if}
								</dd>
							</div>
							<div>
								<dt class="text-muted-foreground text-sm font-medium">Name</dt>
								<dd class="text-card-foreground text-sm">{data.user.name}</dd>
							</div>
							<div>
								<dt class="text-muted-foreground text-sm font-medium">Email or username</dt>
								<dd class="text-card-foreground text-sm">
									{data.user.email ?? data.user.username ?? "—"}
								</dd>
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
									{data.user.msd ? formatDate(new Date(data.user.msd)) : "Unknown"}
								</dd>
							</div>
						</Card.Content>
					</Card.Root>

					<!-- Quick Actions Card -->
					<Card.Root class="border-border/60 shadow-sm transition-shadow hover:shadow-md">
						<Card.Header class="pb-4">
							<Card.Title class="flex items-center gap-2 text-lg">
								<span class="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
									<LayoutGrid class="size-4" />
								</span>
								Quick actions
							</Card.Title>
							<Card.Description>Shortcuts to common member tools</Card.Description>
						</Card.Header>
						<Card.Content class="flex flex-col gap-2">
							<Button
								href="/settings"
								variant="outline"
								class="h-11 w-full justify-start gap-3 px-4 font-medium"
							>
								<Settings class="text-muted-foreground size-4 shrink-0" />
								Profile settings
							</Button>
							<Button
								href="/gallery"
								variant="outline"
								class="h-11 w-full justify-start gap-3 px-4 font-medium"
							>
								<Images class="text-muted-foreground size-4 shrink-0" />
								View gallery
							</Button>
							{#if data.user.role === "admin"}
								<Button
									href="/dashboard/pending-members"
									variant="outline"
									class="h-11 w-full justify-start gap-3 px-4 font-medium"
								>
									<UserPlusIcon class="text-muted-foreground size-4 shrink-0" />
									New members
								</Button>
								<Button
									href="/members"
									variant="outline"
									class="h-11 w-full justify-start gap-3 px-4 font-medium"
								>
									<Users class="text-muted-foreground size-4 shrink-0" />
									Manage members
								</Button>
								<Button
									href="/admin/events"
									variant="outline"
									class="h-11 w-full justify-start gap-3 px-4 font-medium"
								>
									<CalendarDays class="text-muted-foreground size-4 shrink-0" />
									Manage events
								</Button>
								<Button
									href="/admin/stats"
									variant="outline"
									class="h-11 w-full justify-start gap-3 px-4 font-medium"
								>
									<BarChart3 class="text-muted-foreground size-4 shrink-0" />
									Club stats data
								</Button>
							{:else}
								<Button
									href="/members"
									variant="outline"
									class="h-11 w-full justify-start gap-3 px-4 font-medium"
								>
									<BookUser class="text-muted-foreground size-4 shrink-0" />
									Member directory
								</Button>
								<Button
									href="/events"
									variant="outline"
									class="h-11 w-full justify-start gap-3 px-4 font-medium"
								>
									<CalendarRange class="text-muted-foreground size-4 shrink-0" />
									View events
								</Button>
							{/if}
						</Card.Content>
					</Card.Root>

					<!-- Club Stats Card -->
					<Card.Root class="border-border/60 shadow-sm transition-shadow hover:shadow-md">
						<Card.Header class="pb-4">
							<Card.Title class="flex items-center gap-2 text-lg">
								<span class="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
									<BarChart3 class="size-4" />
								</span>
								Club stats
							</Card.Title>
							<Card.Description>At-a-glance numbers (illustrative)</Card.Description>
						</Card.Header>
						<Card.Content class="space-y-3">
							<div
								class="border-border/60 bg-muted/20 flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
							>
								<span class="text-muted-foreground flex items-center gap-2 text-sm">
									<Users class="size-4 opacity-70" />
									Total members
								</span>
								<span class="text-card-foreground text-sm font-semibold tabular-nums">436</span>
							</div>
							<div
								class="border-border/60 bg-muted/20 flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
							>
								<span class="text-muted-foreground flex items-center gap-2 text-sm">
									<UserCheck class="size-4 opacity-70" />
									Active members
								</span>
								<span class="text-card-foreground text-sm font-semibold tabular-nums">324</span>
							</div>
							<div
								class="border-border/60 bg-muted/20 flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
							>
								<span class="text-muted-foreground flex items-center gap-2 text-sm">
									<CalendarDays class="size-4 opacity-70" />
									Events this year
								</span>
								<span class="text-card-foreground text-sm font-semibold tabular-nums">12</span>
							</div>
							<div
								class="border-border/60 bg-muted/20 flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
							>
								<span class="text-muted-foreground flex items-center gap-2 text-sm">
									<Beer class="size-4 opacity-70" />
									Kegs consumed
								</span>
								<span class="text-card-foreground text-sm font-semibold tabular-nums">147</span>
							</div>
						</Card.Content>
					</Card.Root>
				</div>
			{/if}

			<!-- IBC-20: Link to dedicated new-members page for admins -->
			{#if data.user?.role === "admin"}
				<div>
					<Card.Root class="border-border/60 shadow-sm">
						<Card.Header>
							<Card.Title class="flex items-center gap-2">
								<UserPlusIcon class="size-5" />
								New potential members
							</Card.Title>
							<Card.Description>
								People who passed the test but don’t have a member number yet. Manage them and
								assign member numbers.
							</Card.Description>
						</Card.Header>
						<Card.Content>
							{#if data.pendingMembers && data.pendingMembers.length > 0}
								<p class="text-muted-foreground mb-3 text-sm">
									{data.pendingMembers.length} waiting for acceptance.
								</p>
							{/if}
							<Button href="/dashboard/pending-members" class="gap-2">
								<UserPlusIcon class="size-4" />
								{data.pendingMembers?.length ? "View and manage" : "Manage new members"}
							</Button>
						</Card.Content>
					</Card.Root>
				</div>
			{/if}

			<!-- Invitation Management Section -->
			<div>
				<Card.Root class="border-border/60 shadow-sm">
					<Card.Header>
						<Card.Title class="flex items-center gap-2">
							<LinkIcon class="size-5" />
							Invitation Links
						</Card.Title>
					</Card.Header>
					<Card.Content class="p-2 md:p-6">
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
										<CustomCopy text={form.inviteUrl} ariaLabel="Copy invitation link" />
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
							{:else if data.user?.role !== "admin" && (data.user?.role !== "member" || data.user?.mbr == null)}
								<!-- Passed test but not yet accepted as member (no MBR) -->
								<Alert.Root class="mb-4" variant="default">
									<ClockIcon class="size-4" />
									<Alert.Title>Member acceptance required</Alert.Title>
									<Alert.Description>
										You must be accepted as a member and assigned a member number before you can
										create invitation links. An admin will review your profile after you pass the
										test.
									</Alert.Description>
								</Alert.Root>
								<p class="text-muted-foreground text-sm">
									Once an admin assigns you a member number, you’ll be able to create invite links
									here.
								</p>
							{:else}
								<!-- User can create invites (admin, or member with test_passed + MBR) -->
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
											{creating ? "Creating..." : "Create Invite Link"}
										</Button>
									</form>
								</div>

								<!-- Existing Invitations -->
								{#if data.invitations && data.invitations.length > 0}
									<div class="space-y-2">
										<h4 class="text-sm font-medium">Recent Invitations</h4>
										<div class="space-y-2">
											{#each data.invitations.slice(0, 5) as invitation (invitation.token)}
												<div class="flex items-center justify-between rounded-md border p-3">
													<div class="flex items-center gap-3">
														<div class="flex flex-col">
															<span class="text-muted-foreground font-mono text-xs">
																{invitation.token.slice(0, 8)}...
															</span>
															<div class="text-muted-foreground flex flex-col text-xs md:flex-row">
																<span> Created: </span>
																<span>
																	{formatDateTime(invitation.created_at)}
																</span>
															</div>
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
															<CustomCopy
																text={`${data.baseUrl}/invite/${invitation.token}`}
																ariaLabel="Copy invitation link"
															/>
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

			<div class="flex flex-wrap gap-3 pt-2">
				<Button href="/" variant="outline" class="gap-2">
					<Home class="size-4" />
					Back to main site
				</Button>
			</div>
		</div>
</div>
