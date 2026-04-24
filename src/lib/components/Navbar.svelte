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
	import { Button } from "$lib/components/ui/button/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import { toggleMode } from "mode-watcher";
	import { Menu } from "@lucide/svelte";
	import ChevronDown from "@lucide/svelte/icons/chevron-down";
	import Home from "@lucide/svelte/icons/home";
	import History from "@lucide/svelte/icons/history";
	import Users from "@lucide/svelte/icons/users";
	import Calendar from "@lucide/svelte/icons/calendar";
	import BarChart2 from "@lucide/svelte/icons/bar-chart-2";
	import Sparkles from "@lucide/svelte/icons/sparkles";
	import Mail from "@lucide/svelte/icons/mail";
	import Images from "@lucide/svelte/icons/images";
	import Award from "@lucide/svelte/icons/award";
	import Link2 from "@lucide/svelte/icons/link-2";
	import Film from "@lucide/svelte/icons/film";
	import Dog from "@lucide/svelte/icons/dog";
	import FlaskConical from "@lucide/svelte/icons/flask-conical";
	import Beer from "@lucide/svelte/icons/beer";
	import IbcLogo from "$lib/components/IbcLogo.svelte";
	import { navLinks, dropdownLinks } from "$lib/config/navigation";
	import { IsMobile } from "$lib/hooks/is-mobile.svelte";

	// --- Reactive State ---
	const pageData = $state(page);
	let isOpen = $state(false);
	const user = $derived(pageData.data.user);
	const isAuthenticated = $derived(!!user);
	const currentPath = $derived(pageData.url.pathname);
	const isMobile = new IsMobile();

	/** Public nav only: signed-in members use hub/dashboard for stats, not the marketing nav. */
	const mainNavLinks = $derived(
		isAuthenticated ? navLinks.filter((link) => link.href !== "/stats") : navLinks
	);

	/** Mobile sheet: secondary links (matches desktop “More”) — collapsed by default so the control is obvious. */
	let mobileMoreOpen = $state(false);

	//Close mobile menu on route change
	$effect(() => {
		if (currentPath) {
			isOpen = false;
		}
	});

	$effect(() => {
		void currentPath;
		mobileMoreOpen = dropdownLinks.some((l) => isActive(l.href));
	});

	// --- Helpers ---

	function isActive(href: string): boolean {
		if (href === "/") {
			return currentPath === "/";
		}
		return currentPath.startsWith(href);
	}

	/** Lucide components for mobile sheet links (primary + “More...”). */
	const mobileSheetIcons: Record<string, typeof Home> = {
		"/": Home,
		"/history": History,
		"/members": Users,
		"/events": Calendar,
		"/stats": BarChart2,
		"/fun": Sparkles,
		"/contact": Mail,
		"/gallery": Images,
		"/founders-day": Award,
		"/links": Link2,
		"/movie": Film,
		"/foodog": Dog,
		"/science": FlaskConical,
		"/styles": Beer
	};
</script>

<header
	class="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur"
>
	<div
		class="mx-auto flex h-24 w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8"
	>
		{#if !isMobile.current}
			<!--
				Desktop: three equal columns — nav stays visually centered with even side margins.
				(Matches main content width; avoids justify-between where a wide user block skews the nav.)
			-->
			<!--
				Center column is `auto` so it keeps the nav's intrinsic width (equal `1fr` columns use minmax(0,1fr) and clip).
			-->
			<div class="grid h-full w-full grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
				<div class="flex min-w-0 items-center justify-self-start">
					<a href="/" class="flex shrink-0 items-center" aria-label="Island Beer Club home">
						<IbcLogo class="w-[90px] px-2 [&>svg]:h-auto [&>svg]:w-full" decorative />
					</a>
				</div>

				<div class="flex justify-center">
					<NavigationMenu.Root
						viewport={false}
						class="relative flex w-max max-w-none shrink-0 !flex-none"
					>
						<NavigationMenu.List class="!flex-nowrap flex-none justify-center gap-0.5 sm:gap-1">
							{#each mainNavLinks as link (link.href)}
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

				<div class="flex min-w-0 flex-col items-center justify-self-end justify-center gap-1">
					{#if isAuthenticated && user}
						<div class="flex flex-col items-center gap-1">
							<DropdownMenu.Root>
								<DropdownMenu.Trigger class="rounded-full outline-offset-2">
									<Avatar class="size-8" name={user.name} img={user.img} />
									<span class="sr-only">Open user menu</span>
								</DropdownMenu.Trigger>
							<DropdownMenu.Content align="center" class="w-56" preventScroll={false}>
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
										<a href="/admin/stats/beer-consumed" class="w-full">Manage Beer Consumed</a>
									</DropdownMenu.Item>
									<DropdownMenu.Item>
										<a href="/admin/stats/keg-credits" class="w-full">Manage Keg Credits</a>
									</DropdownMenu.Item>
									<DropdownMenu.Item>
										<a href="/dashboard/members" class="w-full">Manage Members</a>
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
							<span class="text-muted-foreground max-w-[10rem] truncate text-center text-xs leading-tight"
								>{user.name}</span
							>
						</div>
					{:else}
						<Button variant="ghost">
							<a href="/login">Login</a>
						</Button>
					{/if}
				</div>
			</div>
		{:else}
			<!-- Mobile Navigation -->
			<a href="/" class="flex items-center" aria-label="Island Beer Club home">
				<IbcLogo class="w-[90px] px-2 [&>svg]:h-auto [&>svg]:w-full" decorative />
			</a>
			<div class="ml-auto">
				<Sheet.Root bind:open={isOpen}>
					<Sheet.Trigger>
						<Button class="mr-7" variant="ghost" size="icon">
							<Menu class=" size-7 " />
							<span class="sr-only">Toggle Menu</span>
						</Button>
					</Sheet.Trigger>
					<Sheet.Content
						preventScroll={false}
						side="right"
						class="flex h-full min-h-0 w-[min(100vw-2rem,20rem)] max-w-full flex-col gap-0 overflow-x-hidden px-5 pb-5 pt-10 sm:max-w-sm"
					>
						<Sheet.Header class="shrink-0 space-y-0 p-0">
							<div class="flex items-stretch gap-2">
								<Button onclick={toggleMode} variant="outline" class="shrink-0" size="icon">
									<SunIcon
										class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
									/>
									<MoonIcon
										class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
									/>
									<span class="sr-only">Toggle theme</span>
								</Button>
								{#if isAuthenticated && user}
									<div class="min-w-0 flex-1">
										<NavUser {user} bind:isOpen />
									</div>
								{:else}
									<a
										href="/login"
										class="text-foreground hover:bg-muted flex min-w-0 flex-1 items-center justify-center rounded-lg px-3 py-2 text-base font-medium"
									>
										Log in
									</a>
								{/if}
							</div>
							<Separator class="my-3" />
						</Sheet.Header>
						<nav class="text-foreground flex min-h-0 min-w-0 flex-1 flex-col pb-6" aria-label="Site pages">
							<div
								class="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain"
							>
								<div class="flex min-w-0 flex-col gap-0.5">
									{#each mainNavLinks as link (link.href)}
										{@const NavIcon = mobileSheetIcons[link.href]}
										<a
											href={link.href}
											class="hover:bg-muted flex w-full min-w-0 items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium"
										>
											{#if NavIcon}
												<NavIcon class="text-muted-foreground size-5 shrink-0" aria-hidden="true" />
											{/if}
											<span class="min-w-0 truncate">{link.label}</span>
										</a>
									{/each}

									<div class="mt-3 border-t border-border/60 pt-3">
										<button
											type="button"
											class="hover:bg-muted text-foreground flex w-full min-w-0 items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-base font-medium transition-colors"
											aria-expanded={mobileMoreOpen}
											aria-controls="mobile-nav-more-links"
											id="mobile-nav-more-trigger"
											onclick={() => (mobileMoreOpen = !mobileMoreOpen)}
										>
											<span class="min-w-0 truncate">More...</span>
											<ChevronDown
												class="text-muted-foreground size-5 shrink-0 transition-transform duration-200 {mobileMoreOpen
													? 'rotate-180'
													: ''}"
												aria-hidden="true"
											/>
										</button>

										{#if mobileMoreOpen}
											<div
												id="mobile-nav-more-links"
												class="mt-1 flex min-w-0 flex-col gap-0.5"
												role="region"
												aria-labelledby="mobile-nav-more-trigger"
											>
												{#each dropdownLinks as link (link.href)}
													{@const MoreIcon = mobileSheetIcons[link.href]}
													<a
														href={link.href}
														class="hover:bg-muted flex w-full min-w-0 items-center gap-3 rounded-lg px-3 py-2 text-[0.95rem] font-medium {isActive(link.href)
															? 'bg-primary/10 text-primary'
															: ''}"
													>
														{#if MoreIcon}
															<MoreIcon
																class="size-5 shrink-0 {isActive(link.href)
																	? 'text-primary'
																	: 'text-muted-foreground'}"
																aria-hidden="true"
															/>
														{/if}
														<span class="min-w-0 truncate">{link.label}</span>
													</a>
												{/each}
											</div>
										{/if}
									</div>
								</div>
							</div>
						</nav>
					</Sheet.Content>
				</Sheet.Root>
			</div>
		{/if}
	</div>
</header>
