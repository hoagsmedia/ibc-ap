<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Login | Island Beer Club</title>
	<meta name="description" content="Sign in to your Island Beer Club account" />
</svelte:head>

<div class="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-md">
		<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Island Beer Club</h2>
		<p class="mt-2 text-center text-sm text-gray-600">
			Sign in to your account or create a new one
		</p>
	</div>

	<div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
		<div class="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
			<form method="post" action="?/login" use:enhance class="space-y-6">
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700"> Email address </label>
					<div class="mt-1">
						<input
							id="email"
							name="email"
							type="email"
							autocomplete="email"
							required
							class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-black placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
						/>
					</div>
				</div>

				<div>
					<label for="password" class="block text-sm font-medium text-gray-700"> Password </label>
					<div class="mt-1">
						<input
							id="password"
							name="password"
							type="password"
							autocomplete="current-password"
							required
							class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-black placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
						/>
					</div>
				</div>

				<div>
					<button
						type="submit"
						class="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
					>
						Sign in
					</button>
				</div>
			</form>

			<div class="mt-6">
				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-gray-300"></div>
					</div>
					<div class="relative flex justify-center text-sm">
						<span class="bg-white px-2 text-gray-500">Or</span>
					</div>
				</div>

				<div class="mt-6">
					<form method="post" action="?/register" use:enhance class="space-y-6">
						<div>
							<label for="register-name" class="block text-sm font-medium text-gray-700">
								Full Name
							</label>
							<div class="mt-1">
								<input
									id="register-name"
									name="name"
									type="text"
									autocomplete="name"
									required
									class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-black placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
								/>
							</div>
						</div>

						<div>
							<label for="register-email" class="block text-sm font-medium text-gray-700">
								Email address
							</label>
							<div class="mt-1">
								<input
									id="register-email"
									name="email"
									type="email"
									autocomplete="email"
									required
									class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-black placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
								/>
							</div>
						</div>

						<div>
							<label for="register-password" class="block text-sm font-medium text-gray-700">
								Password
							</label>
							<div class="mt-1">
								<input
									id="register-password"
									name="password"
									type="password"
									autocomplete="new-password"
									required
									class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-black placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
								/>
							</div>
						</div>

						<div>
							<button
								type="submit"
								class="flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
							>
								Create account
							</button>
						</div>
					</form>
				</div>
			</div>

			{#if form?.message}
				<div class="relative mt-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
					{form.message}
				</div>
			{/if}

			<div class="mt-6 text-center">
				<a href="/" class="text-blue-600 hover:text-blue-500"> ← Back to Home </a>
			</div>
		</div>
	</div>
</div>
