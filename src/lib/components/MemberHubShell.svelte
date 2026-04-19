<script lang="ts">
	import type { Snippet } from "svelte";
	import { page } from "$app/state";
	import { cn } from "$lib/utils.js";
	import * as Sidebar from "$lib/components/ui/sidebar";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Separator } from "$lib/components/ui/separator";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import Avatar from "$lib/components/Avatar.svelte";
	import { toggleMode } from "mode-watcher";
	import { enhance } from "$app/forms";
	import IbcLogo from "$lib/components/IbcLogo.svelte";
	import Search from "@lucide/svelte/icons/search";
	import Sun from "@lucide/svelte/icons/sun";
	import Moon from "@lucide/svelte/icons/moon";
	import Bell from "@lucide/svelte/icons/bell";
	import LayoutDashboard from "@lucide/svelte/icons/layout-dashboard";
	import Users from "@lucide/svelte/icons/users";
	import Calendar from "@lucide/svelte/icons/calendar";
	import Settings from "@lucide/svelte/icons/settings";
	import UserPlus from "@lucide/svelte/icons/user-plus";
	import Beer from "@lucide/svelte/icons/beer";
	import Package from "@lucide/svelte/icons/package";
	import ChevronsUpDown from "@lucide/svelte/icons/chevrons-up-down";
	import LogOut from "@lucide/svelte/icons/log-out";
	import Home from "@lucide/svelte/icons/home";

	let { children }: { children: Snippet } = $props();

	const path = $derived(page.url.pathname);
	const user = $derived(page.data.user);

	function navActive(href: string, exact?: boolean) {
		if (exact) return path === href;
		return path === href || path.startsWith(href + "/");
	}

	function memberHubTitle(pathname: string): string {
		if (pathname.startsWith("/dashboard/pending-members")) return "Prospects";
		if (pathname.startsWith("/dashboard")) return "Dashboard";
		if (pathname.startsWith("/members")) return "Members";
		if (pathname.startsWith("/settings")) return "Settings";
		if (pathname.startsWith("/admin/stats/beer-consumed")) return "Manage Beer Consumed";
		if (pathname.startsWith("/admin/stats/keg-credits")) return "Manage Keg Credits";
		if (pathname.startsWith("/admin/events")) return "Events";
		if (pathname.startsWith("/admin")) return "Club admin";
		if (pathname.startsWith("/test")) return "IBC test";
		if (pathname === "/events" || pathname.startsWith("/events/")) return "Events";
		return "Member hub";
	}

	const headerTitle = $derived(memberHubTitle(path));

	const eventsNavHref = $derived(user?.role === "admin" ? "/admin/events" : "/events");
	const eventsNavActive = $derived(
		user?.role === "admin" ? navActive("/admin/events") : navActive("/events")
	);
</script>

<Sidebar.Provider>
	<Sidebar.Root collapsible="icon" class="border-sidebar-border border-r">
		<Sidebar.Header
			class={cn(
				"shrink-0 overflow-hidden px-3 pb-4 pt-5 transition-[max-height,padding,gap,margin] duration-200 ease-out",
				"max-h-[min(320px,42vh)]",
				"group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:max-h-0 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:!p-0",
				/* Layout: keep header block height until rail is 100% icon width — nav stays put */
				"group-data-[state=collapsed]:[transition-delay:380ms]",
				"group-data-[state=expanded]:delay-0"
			)}
		>
			<div
				class={cn(
					"transition-opacity duration-180 ease-out",
					"group-data-[collapsible=icon]:opacity-0",
					/* Visual: logo fades at ~50% rail progress; does not remove layout space */
					"group-data-[state=collapsed]:[transition-delay:190ms]",
					"group-data-[state=expanded]:duration-300 group-data-[state=expanded]:ease-out",
					"group-data-[state=expanded]:[transition-delay:380ms]"
				)}
			>
				<a href="/" class="flex w-full flex-col items-center gap-2 overflow-hidden py-1 text-center">
					<IbcLogo
						class="h-auto w-[min(90%,15rem)] max-w-full shrink-0 [&>svg]:h-auto [&>svg]:w-full"
						decorative
					/>
					<div class="flex w-full min-w-0 flex-col leading-tight">
						<span class="w-full truncate text-sm font-semibold tracking-tight text-foreground"
							>Island Beer Club</span
						>
						<span class="text-muted-foreground w-full truncate text-xs">Member hub</span>
					</div>
				</a>
			</div>
		</Sidebar.Header>
		<Sidebar.Content>
			<Sidebar.Group>
				<Sidebar.GroupLabel>Navigate</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						<Sidebar.MenuItem>
							<Sidebar.MenuButton
								isActive={navActive("/dashboard", true)}
								tooltipContent="Dashboard"
							>
								{#snippet child({ props })}
									<a href="/dashboard" {...props}>
										<LayoutDashboard />
										<span>Dashboard</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
						<Sidebar.MenuItem>
							<Sidebar.MenuButton isActive={navActive("/members")} tooltipContent="Members">
								{#snippet child({ props })}
									<a href="/members" {...props}>
										<Users />
										<span>Members</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
						<Sidebar.MenuItem>
							<Sidebar.MenuButton
								isActive={eventsNavActive}
								tooltipContent={user?.role === "admin" ? "Manage Events" : "Events"}
							>
								{#snippet child({ props })}
									<a href={eventsNavHref} {...props}>
										<Calendar />
										<span>{user?.role === "admin" ? "Manage Events" : "Events"}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
						<Sidebar.MenuItem>
							<Sidebar.MenuButton isActive={navActive("/settings")} tooltipContent="Settings">
								{#snippet child({ props })}
									<a href="/settings" {...props}>
										<Settings />
										<span>Settings</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
			{#if user?.role === "admin"}
				<Sidebar.Group>
					<Sidebar.GroupLabel>Admin</Sidebar.GroupLabel>
					<Sidebar.GroupContent>
						<Sidebar.Menu>
							<Sidebar.MenuItem>
								<Sidebar.MenuButton
									isActive={navActive("/dashboard/pending-members")}
									tooltipContent="Prospects"
								>
									{#snippet child({ props })}
										<a href="/dashboard/pending-members" {...props}>
											<UserPlus />
											<span>Prospects</span>
										</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
							<Sidebar.MenuItem>
								<Sidebar.MenuButton
									isActive={navActive("/admin/stats/beer-consumed")}
									tooltipContent="Manage Beer Consumed"
								>
									{#snippet child({ props })}
										<a href="/admin/stats/beer-consumed" {...props}>
											<Beer />
											<span>Manage Beer Consumed</span>
										</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
							<Sidebar.MenuItem>
								<Sidebar.MenuButton
									isActive={navActive("/admin/stats/keg-credits")}
									tooltipContent="Manage Keg Credits"
								>
									{#snippet child({ props })}
										<a href="/admin/stats/keg-credits" {...props}>
											<Package />
											<span>Manage Keg Credits</span>
										</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						</Sidebar.Menu>
					</Sidebar.GroupContent>
				</Sidebar.Group>
			{/if}
		</Sidebar.Content>
		<Sidebar.Footer class="p-2">
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<Sidebar.MenuButton tooltipContent="Main site">
						{#snippet child({ props })}
							<a href="/" {...props}>
								<Home />
								<span>Main site</span>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Footer>
		<Sidebar.Rail />
	</Sidebar.Root>
	<Sidebar.Inset class="bg-background min-w-0">
		<header
			class="border-border/60 bg-card/40 supports-[backdrop-filter]:bg-card/30 sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b px-3 backdrop-blur-md md:px-4"
		>
			<Sidebar.Trigger class="-ml-1" />
			<Separator orientation="vertical" class="mr-1 h-6" />
			<div class="flex min-w-0 flex-1 items-center gap-3">
				<h1 class="text-foreground truncate text-sm font-semibold md:text-base">{headerTitle}</h1>
				<div class="ml-auto flex items-center gap-1.5 md:gap-2">
					<div class="relative hidden w-full max-w-[min(100%,18rem)] md:block">
						<Search
							class="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
							aria-hidden="true"
						/>
						<Input
							type="search"
							placeholder="Search members, events…"
							class="border-border/60 bg-muted/30 focus-visible:ring-primary/40 h-9 pl-9 text-sm shadow-none"
							aria-label="Search"
							disabled
							title="Search coming soon"
						/>
					</div>
					<Button
						variant="ghost"
						size="icon"
						class="text-muted-foreground hover:text-foreground hover:bg-muted/50 relative size-9"
						onclick={() => toggleMode()}
						aria-label="Toggle theme"
					>
						<Sun
							class="size-[1.1rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
						/>
						<Moon
							class="absolute size-[1.1rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
						/>
					</Button>
					<Button
						variant="ghost"
						size="icon"
						class="text-muted-foreground hover:text-foreground hover:bg-muted/50 size-9"
						aria-label="Notifications"
					>
						<Bell class="size-[1.1rem]" />
					</Button>
					{#if user}
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								{#snippet child({ props })}
									<Button
										{...props}
										variant="outline"
										size="sm"
										class="border-border/60 bg-card/50 hover:bg-muted/40 h-9 gap-2 px-2 shadow-sm"
									>
										<Avatar class="size-7 rounded-md" name={user.name} img={user.img} />
										<span
											class="text-foreground hidden max-w-[8rem] truncate text-xs font-medium sm:inline"
											>{user.name}</span
										>
										<ChevronsUpDown class="text-muted-foreground size-4 opacity-70" />
									</Button>
								{/snippet}
							</DropdownMenu.Trigger>
							<DropdownMenu.Content
								class="min-w-56"
								align="end"
								sideOffset={6}
								preventScroll={false}
							>
								<DropdownMenu.Label class="p-0 font-normal">
									<div class="flex items-center gap-2 px-1 py-1.5">
										<Avatar class="size-8 rounded-lg" name={user.name} img={user.img} />
										<div class="grid min-w-0 flex-1 text-left text-sm leading-tight">
											<span class="truncate font-medium">{user.name}</span>
											<span class="text-muted-foreground truncate text-xs"
												>{user.email ?? user.username ?? "Member"}</span
											>
										</div>
									</div>
								</DropdownMenu.Label>
								<DropdownMenu.Separator />
								<DropdownMenu.Item>
									<a href="/settings" class="flex w-full items-center gap-2">
										<Settings class="size-4" />
										Settings
									</a>
								</DropdownMenu.Item>
								<DropdownMenu.Separator />
								<DropdownMenu.Item>
									<form method="post" action="/logout" use:enhance class="w-full">
										<button type="submit" class="flex w-full items-center gap-2 text-left">
											<LogOut class="size-4" />
											Log out
										</button>
									</form>
								</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					{/if}
				</div>
			</div>
		</header>
		<div class="flex flex-1 flex-col gap-6 p-4 md:p-6">
			{@render children()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
