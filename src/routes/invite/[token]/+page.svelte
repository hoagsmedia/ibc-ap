<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { UserPlus, Eye, EyeOff } from '@lucide/svelte';

	let { data, form } = $props();

	let loading = $state(false);
	let showPassword = $state(false);
	let showConfirmPassword = $state(false);
</script>

<svelte:head>
	<title>Join IBC - Sign Up</title>
</svelte:head>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
>
	<div class="w-full max-w-2xl">
		<Card class="shadow-lg">
			<CardHeader class="space-y-2 text-center">
				<div
					class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600"
				>
					<UserPlus class="h-6 w-6 text-white" />
				</div>
				<CardTitle class="text-2xl font-bold">Join IBC</CardTitle>
				<CardDescription>
					You've been invited to join our community! Create your account below.
				</CardDescription>
			</CardHeader>

			<CardContent>
				{#if form?.message}
					<div class="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
						<p class="text-sm text-red-800">{form.message}</p>
					</div>
				{/if}

				<form
					method="POST"
					action="?/register"
					use:enhance={() => {
						loading = true;
						return async ({ result, update }) => {
							loading = false;
							await update();
						};
					}}
					class="space-y-4"
				>
					<div class="space-y-2">
						<Label for="name">Full Name</Label>
						<Input
							id="name"
							name="name"
							type="text"
							placeholder="Enter your full name"
							required
							disabled={loading}
							class="transition-colors"
						/>
					</div>

					<div class="space-y-2">
						<Label for="email">Email Address</Label>
						<Input
							id="email"
							name="email"
							type="email"
							placeholder="Enter your email address"
							required
							disabled={loading}
							class="transition-colors"
						/>
					</div>

					<div class="space-y-2">
						<Label for="password">Password</Label>
						<div class="relative">
							<Input
								id="password"
								name="password"
								type={showPassword ? 'text' : 'password'}
								placeholder="Enter your password"
								required
								disabled={loading}
								class="pr-10 transition-colors"
							/>
							<button
								type="button"
								onclick={() => (showPassword = !showPassword)}
								class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
								disabled={loading}
							>
								{#if showPassword}
									<EyeOff class="h-4 w-4" />
								{:else}
									<Eye class="h-4 w-4" />
								{/if}
							</button>
						</div>
						<p class="text-xs text-gray-500">Must be at least 8 characters long</p>
					</div>

					<div class="space-y-2">
						<Label for="confirmPassword">Confirm Password</Label>
						<div class="relative">
							<Input
								id="confirmPassword"
								name="confirmPassword"
								type={showConfirmPassword ? 'text' : 'password'}
								placeholder="Confirm your password"
								required
								disabled={loading}
								class="pr-10 transition-colors"
							/>
							<button
								type="button"
								onclick={() => (showConfirmPassword = !showConfirmPassword)}
								class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
								disabled={loading}
							>
								{#if showConfirmPassword}
									<EyeOff class="h-4 w-4" />
								{:else}
									<Eye class="h-4 w-4" />
								{/if}
							</button>
						</div>
					</div>

					<div class="space-y-2">
						<Label for="bio">Bio</Label>
						<Textarea
							id="bio"
							name="bio"
							placeholder="Tell us about yourself..."
							rows={3}
							disabled={loading}
							class="transition-colors"
						/>
						<p class="text-xs text-gray-500">Optional</p>
					</div>

					<div class="space-y-2">
						<Label for="hobbies">Hobbies</Label>
						<Input
							id="hobbies"
							name="hobbies"
							type="text"
							placeholder="Your hobbies and interests"
							disabled={loading}
							class="transition-colors"
						/>
						<p class="text-xs text-gray-500">Optional</p>
					</div>

					<div class="space-y-2">
						<Label for="likes">Likes</Label>
						<Input
							id="likes"
							name="likes"
							type="text"
							placeholder="Things you enjoy"
							disabled={loading}
							class="transition-colors"
						/>
						<p class="text-xs text-gray-500">Optional</p>
					</div>

					<div class="space-y-2">
						<Label for="sponsor" class="text-muted-foreground">Sponsor</Label>
						<Input
							id="sponsor"
							name="sponsor"
							type="text"
							value={data.sponsorName}
							readonly
							class="bg-muted text-muted-foreground cursor-not-allowed"
						/>
						<p class="text-muted-foreground text-xs">Invited by {data.sponsorName}</p>
					</div>

					<Button type="submit" disabled={loading} class="mt-6 w-full">
						{#if loading}
							<div
								class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
							></div>
						{/if}
						Create Account
					</Button>
				</form>

				<div class="mt-6 text-center">
					<p class="text-sm text-gray-500">
						Already have an account?
						<a href="/login" class="font-medium text-blue-600 hover:text-blue-800">
							Sign in here
						</a>
					</p>
				</div>
			</CardContent>
		</Card>
	</div>
</div>
