<script lang="ts">
	import { page } from "$app/state";
	import { enhance } from "$app/forms";
	import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as Sheet from "$lib/components/ui/sheet/index.js";
	import Avatar from "$lib/components/Avatar.svelte";
	import SunIcon from "@lucide/svelte/icons/sun";
	import MoonIcon from "@lucide/svelte/icons/moon";
	import NavUser from "./Nav-User.svelte";
	import ScrollArea from "./ui/scroll-area/scroll-area.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import { toggleMode } from "mode-watcher";
	import { Menu } from "@lucide/svelte";
	import logo from "$lib/assets/ibc-logo.svg";
	import { navLinks, dropdownLinks } from "$lib/config/navigation";
	import { IsMobile } from "$lib/hooks/is-mobile.svelte";

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

	function isActive(href: string): boolean {
		if (href === "/") {
			return currentPath === "/";
		}
		return currentPath.startsWith(href);
	}
</script>

<header
	class="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur"
>
	<div class="container flex h-24 items-center">
		{#if !isMobile.current}
			<!-- Desktop: equal side columns so the nav column is viewport-centered -->
			<div class="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4">
				<div class="flex min-w-0 items-center justify-start">
					<a href="/" class="flex items-center">
						<img src={logo} alt="Island Beer Club Logo" class="w-[90px] object-contain px-2" />
					</a>
				</div>

				<div class="flex min-w-0 justify-center">
					<NavigationMenu.Root viewport={false} class="hidden md:flex">
						<NavigationMenu.List class="flex-wrap justify-center">
							{#each navLinks as link (link.href)}
								<NavigationMenu.Item>
									<NavigationMenu.Link href={link.href} active={isActive(link.href)}>
										{link.label}
									</NavigationMenu.Link>
								</NavigationMenu.Item>
							{/each}

							<NavigationMenu.Item>
								<NavigationMenu.Trigger>More</NavigationMenu.Trigger>
								<NavigationMenu.Content>
									<ul class="grid w-[300px] gap-3 p-2">
										{#each dropdownLinks as link (link.href)}
											<li>
												<NavigationMenu.Link href={link.href} active={isActive(link.href)}>
													<div class="font-medium">{link.label}</div>
													<p class="text-muted-foreground">{link.description}</p>
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
				</div>

				<div class="flex min-w-0 flex-col items-end justify-center gap-1.5">
					{#if isAuthenticated && user}
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								<Avatar class="size-8" name={user.name} img={user.img} />
								<span class="sr-only">Open user menu</span>
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
								{#if user.role === "admin"}
									<DropdownMenu.Separator />
									<DropdownMenu.Label>Admin</DropdownMenu.Label>
									<DropdownMenu.Item>
										<a href="/admin/events" class="w-full">Manage Events</a>
									</DropdownMenu.Item>
									<DropdownMenu.Item>
										<a href="/admin/stats" class="w-full">Club stats data</a>
									</DropdownMenu.Item>
									<DropdownMenu.Item>
										<a href="/members" class="w-full">Manage Members</a>
									</DropdownMenu.Item>
								{/if}
								<DropdownMenu.Separator />
								<DropdownMenu.Item>
									<form method="post" action="/logout" use:enhance class="w-full">
										<button type="submit" class="w-full text-left"> Logout </button>
									</form>
								</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
						<span class="text-muted-foreground max-w-[10rem] truncate text-right text-sm"
							>{user.name}</span
						>
					{:else}
						<Button variant="ghost">
							<a href="/login">Login</a>
						</Button>
					{/if}
				</div>
			</div>
		{:else}
			<!-- Mobile Navigation -->
			<a href="/" class="flex items-center">
				<img src={logo} alt="Island Beer Club Logo" class="w-[90px] object-contain px-2" />
			</a>
			<div class="ml-auto">
				<Sheet.Root bind:open={isOpen}>
					<Sheet.Trigger>
						<Button class="mr-7" variant="ghost" size="icon">
							<Menu class=" size-7 " />
							<span class="sr-only">Toggle Menu</span>
						</Button>
					</Sheet.Trigger>
					<Sheet.Content preventScroll={false} side="right" class="flex w-[230px] sm:w-[220px]">
						<Sheet.Header>
							<div class="flex flex-col gap-2">
								<Button onclick={toggleMode} variant="outline" class="-mt-2" size="icon">
									<SunIcon
										class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
									/>
									<MoonIcon
										class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
									/>
									<span class="sr-only">Toggle theme</span>
								</Button>
								{#if isAuthenticated && user}
									<NavUser {user} bind:isOpen />
								{:else}
									<a
										href="/login"
										class="text-foreground hover:bg-muted -mx-3 block rounded-lg px-3 py-2.5 text-base"
									>
										Log in
									</a>
								{/if}
							</div>
							<Separator class="my-2" />
						</Sheet.Header>
						<nav class="flex-grow pl-6">
							<ScrollArea class=" h-2/3">
								<div class="flex flex-col space-y-2">
									{#each [...navLinks, ...dropdownLinks] as link (link.href)}
										<a
											href={link.href}
											class="text-foreground hover:bg-muted -mx-3 block rounded-lg px-3 py-2 text-base"
										>
											{link.label}
										</a>
									{/each}
								</div>
							</ScrollArea>
						</nav>
					</Sheet.Content>
				</Sheet.Root>
			</div>
		{/if}
	</div>
</header>
