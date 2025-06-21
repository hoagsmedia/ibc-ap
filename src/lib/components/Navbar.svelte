<script lang="ts">
	import { page } from '$app/state';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as NavigationMenu from '$lib/components/ui/navigation-menu/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import ScrollArea from './ui/scroll-area/scroll-area.svelte';
	import { toggleMode } from 'mode-watcher';
	import { Menu } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import logo from '$lib/assets/ibc-logo.svg';
	import { navLinks, dropdownLinks } from '$lib/config/navigation';

	// --- Reactive State ---
	const pageData = $state(page);
	let isOpen = $state(true);
	const user = $derived(pageData.data.user);
	const isAuthenticated = $derived(!!user);
	const currentPath = $derived(pageData.url.pathname);
	const isMobile = new IsMobile();

	//Close mobile menu on route change
	$effect(() => {
		if (currentPath) {
			isOpen = false;
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
	<div class="container flex h-24 items-center">
		<a href="/" class="flex items-center">
			<img src={logo} alt="Island Beer Club Logo" class="w-[90px] object-contain px-2" />
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
					<NavigationMenu.Item>
						<Button onclick={toggleMode} variant="outline" size="icon">
							<SunIcon
								class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
							/>
							<MoonIcon
								class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
							/>
							<span class="sr-only">Toggle theme</span>
						</Button>
					</NavigationMenu.Item>
				</NavigationMenu.List>
			</NavigationMenu.Root>

			<div class="flex flex-1 flex-col-reverse items-center justify-end">
				{#if isAuthenticated && user}
					<span class="text-muted-foreground text-sm">{user.name}!</span>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							<Button variant="ghost" class="relative size-8 rounded-full">
								<Avatar.Root class="size-8 outline-2 outline-offset-2 outline-solid">
									<Avatar.Image src={user.img} alt={user.name ?? 'User Avatar'} />
									<Avatar.Fallback>{generateUsername(user.name)}</Avatar.Fallback>
								</Avatar.Root>
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="center" class="w-56">
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
				<Sheet.Root>
					<Sheet.Trigger>
						<Button class="mr-7" variant="ghost" size="icon">
							<Menu class=" size-7 " />
							<span class="sr-only">Toggle Menu</span>
						</Button>
					</Sheet.Trigger>
					<Sheet.Content preventScroll={false} side="right" class="flex w-[230px] sm:w-[220px]">
						<Sheet.Header>
							<a href="/dashboard">
								<Avatar.Root class="mx-auto mt-4 mb-2 size-12">
									<Avatar.Image src={user.img} alt={user.name ?? 'User Avatar'} />
									<Avatar.Fallback>{generateUsername(user.name)}</Avatar.Fallback>
								</Avatar.Root>
							</a>
							<span class="text-center text-[11px]">{user.name}</span>
						</Sheet.Header>
						<nav class="flex-grow pl-6">
							<ScrollArea class="h-92 ">
								<div class="flex flex-col space-y-2">
									{#each [...navLinks, ...dropdownLinks] as link}
										<a
											href={link.href}
											class="text-foreground hover:bg-muted -mx-3 block rounded-lg px-3 py-2 text-base"
										>
											{link.label}
										</a>
									{/each}
								</div>
							</ScrollArea>
							<div class="mt-6 border-t pt-6">
								{#if isAuthenticated && user}
									<div class="flex items-center gap-4">
										<div>
											<a href="/dashboard" class="text-foreground">View Dashboard</a>
										</div>
									</div>
									<div class="mt-4 space-y-2">
										<a
											href="/settings"
											class="text-foreground hover:bg-muted -mx-3 block rounded-lg px-3 py-2 text-base"
										>
											Settings
										</a>
										<form method="post" action="/logout" use:enhance class="w-full">
											<button
												type="submit"
												class="text-foreground hover:bg-muted -mx-3 block w-full rounded-lg px-3 py-2 text-left text-base"
											>
												Logout
											</button>
										</form>
									</div>
								{:else}
									<a
										href="/login"
										class="text-foreground hover:bg-muted -mx-3 block rounded-lg px-3 py-2.5 text-base"
									>
										Log in
									</a>
								{/if}
							</div>
						</nav>
					</Sheet.Content>
				</Sheet.Root>
			</div>
		{/if}
	</div>
</header>
