<script lang="ts">
	import { enhance } from "$app/forms";
	import type { ActionData, PageData } from "./$types";
	import { Eye, EyeOff } from "@lucide/svelte";

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let showPassword = $state(false);
</script>

<svelte:head>
	<title>Login | Island Beer Club</title>
	<meta name="description" content="Sign in to your Island Beer Club account" />
</svelte:head>

<div class="bg-background flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-md">
		<h2 class="text-foreground mt-6 text-center text-3xl font-extrabold">Island Beer Club</h2>
		<p class="text-muted-foreground mt-2 text-center text-sm">Sign in to your account</p>

		{#if data.registered}
			<div class="mt-4 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4">
				<div class="text-center">
					<p class="text-sm font-medium text-emerald-700 dark:text-emerald-300">
						Account created. Please sign in to continue.
					</p>
					<p class="text-muted-foreground mt-1 text-xs">
						Use the email and password you just created.
					</p>
				</div>
			</div>
		{/if}

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
							value={data.email}
							required
							class="border-input bg-input text-foreground placeholder-muted-foreground focus:border-ring focus:ring-ring block w-full appearance-none rounded-md border px-3 py-2 focus:outline-none sm:text-sm"
						/>
					</div>
				</div>

				<div>
					<label for="password" class="text-card-foreground block text-sm font-medium">
						Password
					</label>
					<div class="relative mt-1">
						<input
							id="password"
							name="password"
							type={showPassword ? "text" : "password"}
							autocomplete="current-password"
							required
							class="border-input bg-input text-foreground placeholder-muted-foreground focus:border-ring focus:ring-ring block w-full appearance-none rounded-md border px-3 py-2 pr-10 focus:outline-none sm:text-sm"
						/>
						<button
							type="button"
							onclick={() => (showPassword = !showPassword)}
							class="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-3"
							aria-label={showPassword ? "Hide password" : "Show password"}
						>
							{#if showPassword}
								<EyeOff class="size-4" />
							{:else}
								<Eye class="size-4" />
							{/if}
						</button>
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
