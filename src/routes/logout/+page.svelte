<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';

	let form: HTMLFormElement;

	// Auto-submit the logout form when the page loads
	onMount(() => {
		if (form) {
			form.submit();
		}
	});
</script>

<svelte:head>
	<title>Logging out... | Island Beer Club</title>
</svelte:head>

<div class="bg-background flex min-h-screen items-center justify-center">
	<div class="text-center">
		<h1 class="text-foreground text-2xl font-bold">Logging out...</h1>
		<p class="text-muted-foreground mt-2">Please wait while we log you out.</p>

		<form bind:this={form} method="post" use:enhance class="mt-4">
			<button
				type="submit"
				class="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-4 py-2"
			>
				Complete Logout
			</button>
		</form>
	</div>
</div>
