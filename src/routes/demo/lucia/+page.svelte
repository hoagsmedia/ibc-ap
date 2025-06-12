<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
</script>

<div class="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
	<div class="mx-auto max-w-md rounded-lg bg-white p-6 shadow-md">
		<div class="text-center">
			<h1 class="mb-2 text-2xl font-bold text-gray-900">Welcome, {data.user.name}!</h1>
			<p class="mb-4 text-gray-600">Your user ID is: {data.user.id}</p>
			<p class="mb-4 text-gray-600">Email: {data.user.email}</p>
			<p class="mb-6 text-gray-600">Role: <span class="capitalize">{data.user.role}</span></p>
		</div>

		<form method="post" action="?/logout" use:enhance>
			<button
				type="submit"
				class="flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
			>
				Sign out
			</button>
		</form>

		<div class="mt-6 text-center">
			<a href="/" class="text-blue-600 hover:text-blue-500"> ← Back to Home </a>
		</div>
	</div>
</div>
