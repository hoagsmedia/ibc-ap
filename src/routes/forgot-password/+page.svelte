<script lang="ts">
	import { enhance } from "$app/forms";
	import type { ActionData } from "./$types";
	import { Loader2 } from "@lucide/svelte";

	let { form }: { form: ActionData } = $props();

	let submitting = $state(false);
</script>

<svelte:head>
	<title>Forgot password — Island Beer Club</title>
	<meta name="description" content="Request a link to reset your Island Beer Club password." />
</svelte:head>

<div class="bg-background flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-md">
		<h2 class="text-foreground text-center text-2xl font-bold tracking-tight">Forgot password</h2>
		<p class="text-muted-foreground mt-2 text-center text-sm">
			Enter the email on your account. If we find a match, we will send a one-time reset link (valid
			for one hour).
		</p>
	</div>

	<div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
		<div class="bg-card px-4 py-8 shadow sm:rounded-lg sm:px-10">
			{#if form?.sent}
				<div
					class="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200"
				>
					{form.message}
				</div>
				<p class="text-muted-foreground mt-6 text-center text-sm">
					<a href="/login" class="text-primary font-medium hover:underline">Back to sign in</a>
				</p>
			{:else}
				<form
					method="post"
					use:enhance={() => {
						submitting = true;
						return async ({ update }) => {
							try {
								await update();
							} finally {
								submitting = false;
							}
						};
					}}
					class="space-y-6"
				>
					<div>
						<label for="email" class="text-card-foreground block text-sm font-medium">Email</label>
						<div class="mt-1">
							<input
								id="email"
								name="email"
								type="email"
								autocomplete="email"
								required
								class="border-input bg-input text-foreground placeholder-muted-foreground focus:border-ring focus:ring-ring block w-full rounded-md border px-3 py-2 focus:outline-none sm:text-sm"
							/>
						</div>
						{#if form?.emailError}
							<p class="text-destructive mt-1 text-sm">{form.emailError}</p>
						{/if}
					</div>

					<button
						type="submit"
						disabled={submitting}
						class="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-ring flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-70"
					>
						{#if submitting}
							<Loader2 class="size-4 animate-spin" aria-hidden="true" />
							Sending…
						{:else}
							Send reset link
						{/if}
					</button>
				</form>

				<p class="text-muted-foreground mt-6 text-center text-sm">
					<a href="/login" class="text-primary font-medium hover:underline">Back to sign in</a>
				</p>
			{/if}
		</div>
	</div>
</div>
