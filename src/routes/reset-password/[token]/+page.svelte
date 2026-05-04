<script lang="ts">
	import { enhance } from "$app/forms";
	import type { PageData, ActionData } from "./$types";
	import { Eye, EyeOff, Loader2 } from "@lucide/svelte";

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showPassword = $state(false);
	let submitting = $state(false);
</script>

<svelte:head>
	<title>Set new password — Island Beer Club</title>
	<meta name="robots" content="noindex" />
</svelte:head>

{#if !data.valid}
	<div class="bg-background flex min-h-screen flex-col items-center justify-center px-4 py-16">
		<div class="bg-card max-w-md rounded-lg border p-8 shadow-sm">
			<h1 class="text-foreground text-xl font-semibold">Link invalid or expired</h1>
			<p class="text-muted-foreground mt-2 text-sm leading-relaxed">
				This password reset link cannot be used. It may have expired or already been used.
			</p>
			<p class="mt-6">
				<a href="/forgot-password" class="text-primary text-sm font-medium hover:underline"
					>Request a new link</a
				>
				<span class="text-muted-foreground text-sm"> · </span>
				<a href="/login" class="text-primary text-sm font-medium hover:underline">Sign in</a>
			</p>
		</div>
	</div>
{:else}
	<div class="bg-background flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
		<div class="sm:mx-auto sm:w-full sm:max-w-md">
			<h2 class="text-foreground text-center text-2xl font-bold tracking-tight">
				Choose a new password
			</h2>
			<p class="text-muted-foreground mt-2 text-center text-sm">
				Enter a new password for your account. You will sign in again after saving.
			</p>
		</div>

		<div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
			<div class="bg-card px-4 py-8 shadow sm:rounded-lg sm:px-10">
				<form
					method="post"
					use:enhance={() => {
						submitting = true;
						return async ({ update }) => {
							try {
								await update({ reset: false });
							} finally {
								submitting = false;
							}
						};
					}}
					class="space-y-5"
				>
					<div>
						<label for="password" class="text-card-foreground block text-sm font-medium"
							>New password</label
						>
						<div class="relative mt-1">
							<input
								id="password"
								name="password"
								type={showPassword ? "text" : "password"}
								autocomplete="new-password"
								required
								minlength="6"
								maxlength="24"
								class="border-input bg-input text-foreground focus:border-ring focus:ring-ring block w-full rounded-md border px-3 py-2 pr-10 focus:outline-none sm:text-sm"
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
						<label for="confirmPassword" class="text-card-foreground block text-sm font-medium"
							>Confirm new password</label
						>
						<div class="mt-1">
							<input
								id="confirmPassword"
								name="confirmPassword"
								type={showPassword ? "text" : "password"}
								autocomplete="new-password"
								required
								minlength="6"
								maxlength="24"
								class="border-input bg-input text-foreground focus:border-ring focus:ring-ring block w-full rounded-md border px-3 py-2 focus:outline-none sm:text-sm"
							/>
						</div>
					</div>

					{#if form?.message}
						<div
							class="border-destructive/20 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
						>
							{form.message}
						</div>
					{/if}

					<button
						type="submit"
						disabled={submitting}
						class="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-ring flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-70"
					>
						{#if submitting}
							<Loader2 class="size-4 animate-spin" aria-hidden="true" />
							Saving…
						{:else}
							Update password
						{/if}
					</button>
				</form>

				<p class="text-muted-foreground mt-6 text-center text-sm">
					<a href="/login" class="text-primary font-medium hover:underline">Back to sign in</a>
				</p>
			</div>
		</div>
	</div>
{/if}
