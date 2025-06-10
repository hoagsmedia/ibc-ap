<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Dashboard | Island Beer Club</title>
	<meta name="description" content="Island Beer Club member dashboard" />
</svelte:head>

<div class="px-4 py-6 sm:px-0">
	<div class="rounded-lg border-4 border-dashed border-gray-200 p-8">
		<div class="text-center">
			<h1 class="mb-4 text-3xl font-bold text-gray-900">Welcome to Your Dashboard</h1>
			<p class="mb-8 text-lg text-gray-600">
				Hello, <span class="font-semibold">{data.user.name}</span>! Welcome to the Island Beer Club
				member area.
			</p>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
				<!-- Member Info Card -->
				<div class="rounded-lg bg-white p-6 shadow">
					<h3 class="mb-4 text-lg font-medium text-gray-900">Member Information</h3>
					<dl class="space-y-2">
						<div>
							<dt class="text-sm font-medium text-gray-500">Name</dt>
							<dd class="text-sm text-gray-900">{data.user.name}</dd>
						</div>
						<div>
							<dt class="text-sm font-medium text-gray-500">Email</dt>
							<dd class="text-sm text-gray-900">{data.user.email}</dd>
						</div>
						<div>
							<dt class="text-sm font-medium text-gray-500">Role</dt>
							<dd class="text-sm text-gray-900 capitalize">{data.user.role}</dd>
						</div>
						<div>
							<dt class="text-sm font-medium text-gray-500">Member Since</dt>
							<dd class="text-sm text-gray-900">Recently</dd>
						</div>
					</dl>
				</div>

				<!-- Quick Actions Card -->
				<div class="rounded-lg bg-white p-6 shadow">
					<h3 class="mb-4 text-lg font-medium text-gray-900">Quick Actions</h3>
					<div class="space-y-3">
						<a
							href="/settings"
							class="block w-full rounded-md bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
						>
							Profile Settings
						</a>
						<a
							href="/gallery"
							class="block w-full rounded-md bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
						>
							View Gallery
						</a>
						<a
							href="/events"
							class="block w-full rounded-md bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-100"
						>
							Upcoming Events
						</a>
						<a
							href="/members"
							class="block w-full rounded-md bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100"
						>
							Member Directory
						</a>
					</div>
				</div>

				<!-- Club Stats Card -->
				<div class="rounded-lg bg-white p-6 shadow">
					<h3 class="mb-4 text-lg font-medium text-gray-900">Club Stats</h3>
					<div class="space-y-3">
						<div class="flex justify-between">
							<span class="text-sm text-gray-500">Total Members</span>
							<span class="text-sm font-medium text-gray-900">436</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-gray-500">Active Members</span>
							<span class="text-sm font-medium text-gray-900">324</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-gray-500">Events This Year</span>
							<span class="text-sm font-medium text-gray-900">12</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-gray-500">Kegs Consumed</span>
							<span class="text-sm font-medium text-gray-900">147</span>
						</div>
					</div>
				</div>
			</div>

			<div class="mt-8">
				<a
					href="/"
					class="inline-flex items-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
				>
					← Back to Main Site
				</a>
			</div>
		</div>
	</div>
</div>
