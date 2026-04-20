<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Login | Island Beer Club</title>
	<meta name="description" content="Sign in to your Island Beer Club account" />
</svelte:head>

<div class="bg-background flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-md">
		<h2 class="text-foreground mt-6 text-center text-3xl font-extrabold">Island Beer Club</h2>
		<p class="text-muted-foreground mt-2 text-center text-sm">Sign in to your account</p>

		<!-- Login instructions -->
		<div class="bg-accent mt-4 rounded-md p-4">
			<div class="text-center">
				<p class="text-accent-foreground text-sm">
					<strong>Members:</strong> Sign in with your email or username and password.
				</p>
				<p class="text-muted-foreground mt-1 text-xs">
					You can change your password after logging in via Settings.
				</p>
			</div>
		</div>
	</div>

	<div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
		<div class="bg-card px-4 py-8 shadow sm:rounded-lg sm:px-10">
			<form method="post" action="?/login" use:enhance class="space-y-6">
				<div>
					<label for="email" class="text-card-foreground block text-sm font-medium">
						Email or username
					</label>
					<div class="mt-1">
						<input
							id="email"
							name="email"
							type="text"
							autocomplete="username"
							required
							class="border-input bg-input text-foreground placeholder-muted-foreground focus:border-ring focus:ring-ring block w-full appearance-none rounded-md border px-3 py-2 focus:outline-none sm:text-sm"
						/>
					</div>
				</div>

				<div>
					<label for="password" class="text-card-foreground block text-sm font-medium">
						Password
					</label>
					<div class="mt-1">
						<input
							id="password"
							name="password"
							type="password"
							autocomplete="current-password"
							required
							class="border-input bg-input text-foreground placeholder-muted-foreground focus:border-ring focus:ring-ring block w-full appearance-none rounded-md border px-3 py-2 focus:outline-none sm:text-sm"
						/>
					</div>
				</div>

				<div>
					<button
						type="submit"
						class="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-ring flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
					>
						Sign in
					</button>
				</div>
			</form>

			{#if form?.message}
				<div
					class="border-destructive/20 bg-destructive/10 text-destructive relative mt-4 rounded border px-4 py-3"
				>
					{form.message}
				</div>
			{/if}

			<div class="mt-6 text-center">
				<a href="/" class="text-primary hover:text-primary/80"> ← Back to Home </a>
			</div>
		</div>
	</div>
</div>
