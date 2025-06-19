<script lang="ts">
	import { page } from '$app/state';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as NavigationMenu from '$lib/components/ui/navigation-menu/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Sheet, SheetContent, SheetTrigger } from '$lib/components/ui/sheet/index.js';
	import { Menu } from '@lucide/svelte';
	import { enhance } from '$app/forms';

	// --- Reactive State ---
	const pageData = $state(page);
	const user = $derived(pageData.data.user);
	const isAuthenticated = $derived(!!user);
	const currentPath = $derived(pageData.url.pathname);

	// --- Navigation Links ---
	const navLinks = [
		{ href: '/', label: 'Home', description: 'Return to the homepage.' },
		{ href: '/history', label: 'History', description: 'Our club history.' },
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

	// --- Mobile State ---
	const isMobile = new IsMobile();
	let mobileMenuOpen = $state(false);

	$effect(() => {
		// Close mobile menu on route change
		if (currentPath) {
			mobileMenuOpen = false;
		}
	});

	// --- Helpers ---
	function generateUsername(name: string | null | undefined): string {
		if (!name) return '??';
		const parts = name.trim().split(' ');
		if (parts.length > 1) {
			return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
		}
		return name.substring(0, 2).toUpperCase();
	}

	function isActive(href: string): boolean {
		if (href === '/') {
			return currentPath === '/';
		}
		return currentPath.startsWith(href);
	}
</script>

<header
	class="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur"
>
	<div class="container flex h-16 items-center">
		<a href="/" class="mr-6 flex items-center space-x-2">
			<!-- TODO: Add Logo Component/Image -->
			<span class="hidden px-2 font-bold sm:inline-block">Island Beer Club</span>
		</a>

		{#if !isMobile.current}
			<!-- Desktop Navigation -->
			<NavigationMenu.Root class="hidden md:flex">
				<NavigationMenu.List>
					{#each navLinks as link}
						<NavigationMenu.Item>
							<NavigationMenu.Link href={link.href} active={isActive(link.href)}>
								{link.label}
							</NavigationMenu.Link>
						</NavigationMenu.Item>
					{/each}

					<NavigationMenu.Item>
						<NavigationMenu.Trigger>More</NavigationMenu.Trigger>
						<NavigationMenu.Content>
							<ul class="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
								{#each dropdownLinks as link}
									<li class="row-span-3">
										<NavigationMenu.Link>
											<a
												href={link.href}
												class="from-muted/50 to-muted flex size-full flex-col justify-end rounded-md bg-gradient-to-b p-6 no-underline outline-none select-none focus:shadow-md"
											>
												<div class="mt-4 mb-2 text-lg font-medium">{link.label}</div>
												<p class="text-muted-foreground text-sm leading-tight">
													{link.description}
												</p>
											</a>
										</NavigationMenu.Link>
									</li>
								{/each}
							</ul>
						</NavigationMenu.Content>
					</NavigationMenu.Item>
				</NavigationMenu.List>
			</NavigationMenu.Root>

			<div class="flex flex-1 items-center justify-end gap-4">
				{#if isAuthenticated && user}
					<span class="text-muted-foreground text-sm">Hello, {user.name}!</span>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							<Button variant="ghost" class="relative size-8 rounded-full">
								<Avatar.Root class="size-8">
									{#if user.img}
										<Avatar.Image src={user.img} alt={user.name ?? 'User Avatar'} />
									{/if}
									<Avatar.Fallback>{generateUsername(user.name)}</Avatar.Fallback>
								</Avatar.Root>
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="end" class="w-56">
							<DropdownMenu.Label>My Account</DropdownMenu.Label>
							<DropdownMenu.Separator />
							<DropdownMenu.Item>
								<a href="/dashboard" class="w-full">Dashboard</a>
							</DropdownMenu.Item>
							<DropdownMenu.Item>
								<a href="/settings" class="w-full">Settings</a>
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<DropdownMenu.Item>
								<form method="post" action="/logout" use:enhance class="w-full">
									<button type="submit" class="w-full text-left"> Logout </button>
								</form>
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				{:else}
					<Button variant="ghost">
						<a href="/login">Login</a>
					</Button>
				{/if}
			</div>
		{:else}
			<!-- Mobile Navigation -->
			<div class="ml-auto">
				<Sheet bind:open={mobileMenuOpen}>
					<SheetTrigger>
						<Button variant="ghost" size="icon">
							<Menu class="size-5" />
							<span class="sr-only">Toggle Menu</span>
						</Button>
					</SheetTrigger>
					<SheetContent class=" p-3">
						<a href="/" class="mb-8 flex items-center">
							<span class="font-bold">Island Beer Club</span>
						</a>
						<div class="flex flex-col space-y-2">
							{#each [...navLinks, ...dropdownLinks] as link}
								<a
									href={link.href}
									class="text-foreground hover:bg-muted -mx-3 block rounded-lg px-3 py-2 text-base leading-7 font-semibold"
								>
									{link.label}
								</a>
							{/each}
						</div>
						<div class="mt-6 border-t pt-6">
							{#if isAuthenticated && user}
								<div class="flex items-center gap-4">
									<Avatar.Root>
										{#if user.img}
											<Avatar.Image src={user.img} alt={user.name ?? 'User Avatar'} />
										{/if}
										<Avatar.Fallback>{generateUsername(user.name)}</Avatar.Fallback>
									</Avatar.Root>
									<div>
										<p class="font-semibold">{user.name}</p>
										<a href="/dashboard" class="text-muted-foreground text-sm hover:underline"
											>View Dashboard</a
										>
									</div>
								</div>
								<div class="mt-4 space-y-2">
									<a
										href="/settings"
										class="text-foreground hover:bg-muted -mx-3 block rounded-lg px-3 py-2 text-base leading-7 font-semibold"
									>
										Settings
									</a>
									<form method="post" action="/logout" use:enhance class="w-full">
										<button
											type="submit"
											class="text-foreground hover:bg-muted -mx-3 block w-full rounded-lg px-3 py-2 text-left text-base leading-7 font-semibold"
										>
											Logout
										</button>
									</form>
								</div>
							{:else}
								<a
									href="/login"
									class="text-foreground hover:bg-muted -mx-3 block rounded-lg px-3 py-2.5 text-base leading-7 font-semibold"
								>
									Log in
								</a>
							{/if}
						</div>
					</SheetContent>
				</Sheet>
			</div>
		{/if}
	</div>
</header>
