<script lang="ts">
	import { enhance } from "$app/forms";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from "$lib/components/ui/card";
	import { Eye, EyeOff, Users } from "@lucide/svelte";

	let { data, form } = $props();

	let loading = $state(false);
	let showPassword = $state(false);
	let showConfirmPassword = $state(false);
</script>

<svelte:head>
	<title>Activate member website access | Island Beer Club</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center p-4">
	<div class="w-full max-w-md">
		{#if !data.valid}
			<Card class="border-border shadow-lg">
				<CardHeader>
					<CardTitle class="text-xl">Link not valid</CardTitle>
					<CardDescription>
						This member rollout link is invalid or expired. Ask an admin or another member to send a
						new activation email.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button variant="outline" href="/login" class="w-full">Back to sign in</Button>
				</CardContent>
			</Card>
		{:else}
			<Card class="border-border shadow-lg">
				<CardHeader class="space-y-2 text-center">
					<div
						class="bg-primary mx-auto mb-4 flex size-12 items-center justify-center rounded-full"
					>
						<Users class="text-primary-foreground size-6" />
					</div>
					<CardTitle class="text-foreground text-2xl font-bold">Member website access</CardTitle>
					<CardDescription class="text-muted-foreground">
						Hi {data.recipientName}, set a password to activate your existing member account on the
						new site. This is not a new membership application.
					</CardDescription>
				</CardHeader>

				<CardContent>
					{#if form?.message}
						<div class="border-destructive bg-destructive/10 mb-6 rounded-md border p-4">
							<p class="text-destructive text-sm">{form.message}</p>
						</div>
					{/if}

					<form
						method="POST"
						use:enhance={() => {
							loading = true;
							return async ({ update }) => {
								loading = false;
								await update();
							};
						}}
						class="space-y-4"
					>
						<div class="space-y-2">
							<Label for="password">Password</Label>
							<div class="relative">
								<Input
									id="password"
									name="password"
									type={showPassword ? "text" : "password"}
									autocomplete="new-password"
									required
									minlength={8}
									maxlength={24}
									disabled={loading}
									class="pr-10"
								/>
								<button
									type="button"
									class="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-3"
									onclick={() => (showPassword = !showPassword)}
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

						<div class="space-y-2">
							<Label for="confirmPassword">Confirm password</Label>
							<div class="relative">
								<Input
									id="confirmPassword"
									name="confirmPassword"
									type={showConfirmPassword ? "text" : "password"}
									autocomplete="new-password"
									required
									minlength={8}
									maxlength={24}
									disabled={loading}
									class="pr-10"
								/>
								<button
									type="button"
									class="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-3"
									onclick={() => (showConfirmPassword = !showConfirmPassword)}
									aria-label={showConfirmPassword ? "Hide password" : "Show password"}
								>
									{#if showConfirmPassword}
										<EyeOff class="size-4" />
									{:else}
										<Eye class="size-4" />
									{/if}
								</button>
							</div>
						</div>

						<Button type="submit" class="w-full" disabled={loading}>
							{#if loading}
								Activating…
							{:else}
								Activate account
							{/if}
						</Button>
					</form>
				</CardContent>
			</Card>
		{/if}
	</div>
</div>
