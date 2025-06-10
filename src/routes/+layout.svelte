<script lang="ts">
	import '../app.css';
	import * as NavigationMenu from '$lib/components/ui/navigation-menu/index.js';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import { enhance } from '$app/forms';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { toggleMode, ModeWatcher } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { LayoutServerData } from './$types';

	let { children, data }: { children: any; data: LayoutServerData } = $props();

	const navLinks = [
		{ href: '/', label: 'Home', description: 'Return to the homepage.' },
		{ href: '/history', label: 'History', description: 'Our club history.' },
		{ href: '/members', label: 'Members', description: 'Meet our members.' },
		{ href: '/events', label: 'Events', description: 'Upcoming and past events.' },
		{ href: '/fun', label: 'Fun', description: 'Games, jokes, and more.' },
		{ href: '/contact', label: 'Contact', description: 'Get in touch with us.' },
		{ href: '/gallery', label: 'Gallery', description: 'Photo gallery of club events.' }
	];

	const dropdownLinks = [
		{ href: '/links', label: 'Links', description: 'Beer resources and friends.' },
		{ href: '/rules', label: 'Rules', description: 'Club rules and guidelines.' },
		{ href: '/movie', label: 'IBC Movie', description: 'Watch the IBC movie.' },
		{ href: '/foodog', label: 'Foo Dogs', description: 'Learn about Foo Dogs.' },
		{
			href: '/science',
			label: 'Science Corner',
			description: 'Explore beer science and fun facts.'
		},
		{ href: '/styles', label: 'Beer Styles', description: 'Learn about different beer styles.' },
		{ href: '/stats', label: 'IBC Stats', description: 'View club statistics and records.' }
	];

	const mainLinks = navLinks.filter((l) => !dropdownLinks.some((d) => d.href === l.href));
</script>

<div class="shadow-background flex h-20 items-center justify-around">
	<div class="flex items-center gap-4">
		<img src="/IBCLogo.png" alt="Island Beer Club Logo" class="h-10 w-auto" />
		<NavigationMenu.Root>
			<NavigationMenu.List>
				{#each mainLinks as link}
					<NavigationMenu.Item>
						<NavigationMenu.Link href={link.href}>{link.label}</NavigationMenu.Link>
					</NavigationMenu.Item>
				{/each}
			</NavigationMenu.List>
		</NavigationMenu.Root>
	</div>

	<NavigationMenu.Root>
		<NavigationMenu.List>
			<NavigationMenu.Item>
				<NavigationMenu.Trigger>More</NavigationMenu.Trigger>
				<NavigationMenu.Content>
					<ul class="min-w-[150px] p-2">
						{#each dropdownLinks as link}
							<li>
								<NavigationMenu.Link href={link.href}>{link.label}</NavigationMenu.Link>
							</li>
						{/each}
					</ul>
				</NavigationMenu.Content>
			</NavigationMenu.Item>
		</NavigationMenu.List>
	</NavigationMenu.Root>

	<!-- User Authentication Section -->
	<div class="flex items-center gap-2">
		{#if data.user}
			<!-- User is logged in -->
			<span class="text-muted-foreground text-sm">Hello, {data.user.name}!</span>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger
					><Avatar>
						<AvatarImage
							src={data.user.img
								? data.user.img.startsWith('/')
									? data.user.img
									: `/${data.user.img}`
								: ''}
							alt={data.user.name}
							class="border-border size-8 rounded-full border object-cover"
						/>
						<AvatarFallback>IBC</AvatarFallback>
					</Avatar></DropdownMenu.Trigger
				>
				<DropdownMenu.Content>
					<DropdownMenu.Group>
						<DropdownMenu.Label>My Account</DropdownMenu.Label>
						<DropdownMenu.Separator />
						<DropdownMenu.Item><a href="/dashboard">Profile</a></DropdownMenu.Item>
						<DropdownMenu.Item><a href="/settings">Settings</a></DropdownMenu.Item>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>

			<form method="post" action="/logout" use:enhance>
				<Button type="submit" variant="outline" size="sm">Logout</Button>
			</form>
		{:else}
			<!-- User is not logged in -->
			<Button variant="outline" size="sm">
				<a href="/login">Login</a>
			</Button>
		{/if}

		<Button onclick={toggleMode} variant="outline" size="icon">
			<SunIcon
				class="size-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
			/>
			<MoonIcon
				class="absolute size-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
			/>
			<span class="sr-only">Toggle theme</span>
		</Button>
	</div>
</div>

<div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
	<ModeWatcher />
	{@render children()}
</div>
