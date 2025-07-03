<script lang="ts">
	import { CheckIcon, Copy } from '@lucide/svelte/icons';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';

	interface Props {
		text: string;
		ariaLabel?: string;
		variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
		size?: 'default' | 'sm' | 'lg' | 'icon';
		class?: string;
	}

	const {
		text,
		ariaLabel = 'Copy to clipboard',
		variant = 'outline',
		size = 'icon',
		class: className = ''
	}: Props = $props();

	let copied = $state(false);

	async function handleClick() {
		try {
			// Primary method using modern Clipboard API
			await navigator.clipboard.writeText(text);
			copied = true;
			toast.success('Copied to clipboard!', {
				duration: 2000
			});
		} catch (error) {
			// Fallback method for iOS and older browsers
			try {
				const textArea = document.createElement('textarea');
				textArea.value = text;
				textArea.style.position = 'fixed';
				textArea.style.left = '-999999px';
				textArea.style.top = '-999999px';
				textArea.setAttribute('readonly', '');
				document.body.appendChild(textArea);
				textArea.focus();
				textArea.select();
				textArea.setSelectionRange(0, 99999); // For mobile devices

				const successful = document.execCommand('copy');
				document.body.removeChild(textArea);

				if (successful) {
					copied = true;
					toast.success('Copied to clipboard!', {
						duration: 2000
					});
				} else {
					throw new Error('execCommand failed');
				}
			} catch (fallbackError) {
				toast.error('Failed to copy to clipboard', {
					duration: 3000
				});
				return;
			}
		}

		// Reset copied state after 2 seconds
		setTimeout(() => {
			copied = false;
		}, 2000);
	}
</script>

<Button
	{variant}
	{size}
	class="min-h-[44px] min-w-[44px] touch-manipulation {className}"
	aria-label={copied ? 'Copied!' : ariaLabel}
	onclick={handleClick}
>
	{#if copied}
		<CheckIcon class="size-3 text-green-600" />
	{:else}
		<Copy class="size-3" />
	{/if}
</Button>
