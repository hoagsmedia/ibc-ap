<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ArrowLeft, Mail, Calendar, User, Hash, Heart } from '@lucide/svelte';
	import { generateUsername } from '$lib/utils';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Format date helper
	function formatDate(date: Date | string | null): string {
		if (!date) return 'Not set';
		const parsedDate = typeof date === 'string' ? new Date(date) : date;
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		}).format(parsedDate);
	}

	// Format role badge variant
	function getRoleBadgeVariant(role: string): 'default' | 'secondary' | 'destructive' | 'outline' {
		switch (role) {
			case 'admin':
				return 'destructive';
			case 'member':
				return 'default';
			case 'guest':
				return 'secondary';
			default:
				return 'outline';
		}
	}
</script>

<svelte:head>
	<title>{data.member.name} - Member Details | Island Beer Club</title>
	<meta name="description" content="Member details for {data.member.name}" />
</svelte:head>

<div class="container py-8 md:w-full">
	<!-- Header with back button -->
	<div class="mb-6 flex flex-col items-center gap-4 md:flex-row">
		<Button variant="outline" size="sm" onclick={() => history.back()}>
			<ArrowLeft class="size-4" />
			Back to Members
		</Button>
		<h1 class="text-3xl font-bold">Member Details</h1>
	</div>

	<div class="grid gap-2 md:gap-6 lg:grid-cols-3">
		<!-- Profile Card -->
		<Card.Root class="w-full max-w-sm lg:col-span-1">
			<Card.Header class="text-center">
				<div class="mx-auto mb-4">
					<Avatar.Root class="size-24">
						{#if data.member.img}
							<Avatar.Image src={data.member.img} alt={data.member.name} />
						{/if}
						<Avatar.Fallback class="text-2xl">
							{generateUsername(data.member.name)}
						</Avatar.Fallback>
					</Avatar.Root>
				</div>
				<Card.Title class="text-2xl">{data.member.name}</Card.Title>
				<Card.Description>
					<Badge variant={getRoleBadgeVariant(data.member.role)}>
						{data.member.role?.toUpperCase()}
					</Badge>
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="text-muted-foreground flex items-center gap-2 text-sm">
					<Mail class="size-4" />
					{data.member.email}
				</div>
				{#if data.member.mbr}
					<div class="text-muted-foreground flex items-center gap-2 text-sm">
						<Hash class="size-4" />
						Member #{data.member.mbr}
					</div>
				{/if}
				{#if data.member.msd}
					<div class="text-muted-foreground flex items-center gap-2 text-sm">
						<Calendar class="size-4" />
						Member since {formatDate(data.member.msd)}
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Details Section -->
		<div class="space-y-6 lg:col-span-2">
			<!-- Personal Information -->
			<Card.Root class="w-full max-w-sm md:max-w-full">
				<Card.Header>
					<Card.Title>Personal Information</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					{#if data.member.bio}
						<div>
							<h4 class="mb-2 font-medium">Bio</h4>
							<p class="text-muted-foreground text-sm">{data.member.bio}</p>
						</div>
					{/if}
					{#if data.member.hobbies}
						<div>
							<h4 class="mb-2 font-medium">Hobbies</h4>
							<p class="text-muted-foreground text-sm">{data.member.hobbies}</p>
						</div>
					{/if}
					{#if data.member.likes}
						<div>
							<h4 class="mb-2 flex items-center gap-2 font-medium">
								<Heart class="size-4" />
								Likes
							</h4>
							<p class="text-muted-foreground text-sm">{data.member.likes}</p>
						</div>
					{/if}
					{#if data.member.sponsor}
						<div>
							<h4 class="mb-2 font-medium">Sponsor</h4>
							<p class="text-muted-foreground text-sm">{data.member.sponsor}</p>
						</div>
					{/if}
				</Card.Content>
			</Card.Root>

			<!-- Club Information -->
			<Card.Root class="max-w-sm md:max-w-full">
				<Card.Header>
					<Card.Title>Club Information</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<h4 class="mb-2 font-medium">Member Number</h4>
							<p class="text-muted-foreground text-sm">
								{data.member.mbr || 'Not assigned'}
							</p>
						</div>
						<div>
							<h4 class="mb-2 font-medium">Role</h4>
							<Badge variant={getRoleBadgeVariant(data.member.role)}>
								{data.member.role?.toUpperCase()}
							</Badge>
						</div>
						<div>
							<h4 class="mb-2 font-medium">Test Passed</h4>
							<p class="text-muted-foreground text-sm">
								{data.member.test_passed ? formatDate(data.member.test_passed) : 'Not completed'}
							</p>
						</div>
						<div>
							<h4 class="mb-2 font-medium">Member Since</h4>
							<p class="text-muted-foreground text-sm">
								{data.member.msd ? formatDate(data.member.msd) : 'Not set'}
							</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Actions -->
			<Card.Root class="w-full max-w-sm md:max-w-full">
				<Card.Header>
					<Card.Title>Actions</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="flex flex-col gap-2 md:flex-row">
						<Button variant="outline" href={`/members/${data.member.id}/edit`}>Edit Member</Button>
						<!-- <Button disabled variant="outline">Send Message</Button> -->
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>
