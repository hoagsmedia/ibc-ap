<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
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
				Hello, <span class="font-semibold">{data.user.name}</span>! Welcome to the Island Beer Club
				member area.
			</p>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
				<!-- Member Info Card -->
				<div class="bg-card rounded-lg p-6 shadow">
					<h3 class="text-card-foreground mb-4 text-lg font-medium">Member Information</h3>
					<dl class="space-y-2">
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
							<dd class="text-card-foreground text-sm capitalize">{data.user.role}</dd>
						</div>
						<div>
							<dt class="text-muted-foreground text-sm font-medium">Member Since</dt>
							<dd class="text-card-foreground text-sm">Recently</dd>
						</div>
					</dl>
				</div>

				<!-- Quick Actions Card -->
				<div class="bg-card rounded-lg p-6 shadow">
					<h3 class="text-card-foreground mb-4 text-lg font-medium">Quick Actions</h3>
					<div class="space-y-3">
						<a
							href="/settings"
							class="bg-muted text-muted-foreground hover:bg-muted/80 block w-full rounded-md px-4 py-2 text-sm font-medium transition-colors"
						>
							Profile Settings
						</a>
						<a
							href="/gallery"
							class="bg-accent text-accent-foreground hover:bg-accent/80 block w-full rounded-md px-4 py-2 text-sm font-medium transition-colors"
						>
							View Gallery
						</a>
						<a
							href="/events"
							class="bg-secondary text-secondary-foreground hover:bg-secondary/80 block w-full rounded-md px-4 py-2 text-sm font-medium transition-colors"
						>
							Upcoming Events
						</a>
						<a
							href="/members"
							class="bg-muted text-muted-foreground hover:bg-muted/80 block w-full rounded-md px-4 py-2 text-sm font-medium transition-colors"
						>
							Member Directory
						</a>
					</div>
				</div>

				<!-- Club Stats Card -->
				<div class="bg-card rounded-lg p-6 shadow">
					<h3 class="text-card-foreground mb-4 text-lg font-medium">Club Stats</h3>
					<div class="space-y-3">
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
					</div>
				</div>
			</div>

			<div class="mt-8">
				<a
					href="/"
					class="bg-accent text-accent-foreground hover:bg-accent/80 focus:ring-ring inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:outline-none"
				>
					← Back to Main Site
				</a>
			</div>
		</div>
	</div>
</div>
