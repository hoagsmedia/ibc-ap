<script lang="ts">
	import { enhance } from '$app/forms';
	import type { LayoutData } from './$types';

	let { children, data }: { children: any; data: LayoutData } = $props();
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Navigation bar for authenticated users -->
	<nav class="border-b bg-white shadow-sm">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 items-center justify-between">
				<div class="flex items-center">
					<a href="/" class="flex items-center space-x-2">
						<img src="/IBCLogo.png" alt="Island Beer Club" class="h-8 w-auto" />
						<span class="text-xl font-bold text-gray-900">Island Beer Club</span>
					</a>

					<!-- Navigation Links -->
					<div class="ml-10 flex items-baseline space-x-4">
						<a
							href="/dashboard"
							class="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
						>
							Dashboard
						</a>
						<a
							href="/settings"
							class="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
						>
							Settings
						</a>
					</div>
				</div>

				<div class="flex items-center space-x-4">
					<div class="flex items-center space-x-2">
						{#if data.user.img}
							<img
								src={data.user.img.startsWith('/') ? data.user.img : `/resources/${data.user.img}`}
								alt={data.user.name}
								class="h-8 w-8 rounded-full border border-gray-300 object-cover"
							/>
						{:else}
							<div class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
								<span class="text-xs font-medium text-gray-600">
									{data.user.name.charAt(0).toUpperCase()}
								</span>
							</div>
						{/if}
						<span class="text-sm text-gray-700">Welcome, {data.user.name}!</span>
					</div>
					<form action="/logout" method="post" use:enhance>
						<button
							type="submit"
							class="inline-flex items-center rounded-md border border-transparent bg-red-600 px-3 py-2 text-sm leading-4 font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
						>
							Logout
						</button>
					</form>
				</div>
			</div>
		</div>
	</nav>

	<!-- Main content -->
	<main class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
		{@render children()}
	</main>
</div>
