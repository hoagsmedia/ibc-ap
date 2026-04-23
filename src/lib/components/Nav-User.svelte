<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import Avatar from '$lib/components/Avatar.svelte';
	import Button from './ui/button/button.svelte';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import {
		LayoutDashboardIcon,
		ChevronsUpDownIcon,
		SettingsIcon,
		CalendarIcon,
		UsersIcon,
		LogOutIcon
	} from '@lucide/svelte/icons';
	import Beer from '@lucide/svelte/icons/beer';
	import Package from '@lucide/svelte/icons/package';
	import { enhance } from '$app/forms';

	let {
		user,
		isOpen = $bindable()
	}: {
		user: { name: string; email?: string | null; username?: string | null; img: string; role?: string };
		isOpen?: boolean;
	} = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline" class="w-full p-1">
				<Avatar class="size-8 rounded-lg" name={user.name} img={user.img} />
				<div class="grid flex-1 text-left text-sm leading-tight">
					<span class="truncate font-medium">{user.name}</span>
					<span class="truncate text-xs">{user.email ?? user.username ?? 'Member'}</span>
				</div>
				<ChevronsUpDownIcon class="ml-auto size-4" />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content
		class="min-w-56 rounded-lg"
		side={IsMobile ? 'bottom' : 'right'}
		align="end"
		sideOffset={4}
	>
		<DropdownMenu.Label class="p-0 font-normal">
			<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
				<Avatar class="size-8 rounded-lg" name={user.name} img={user.img} />
				<div class="grid flex-1 text-left text-sm leading-tight">
					<span class="truncate font-medium">{user.name}</span>
					<span class="truncate text-xs">{user.email ?? user.username ?? 'Member'}</span>
				</div>
			</div>
		</DropdownMenu.Label>
		<DropdownMenu.Separator />
		<DropdownMenu.Group>
			<DropdownMenu.Item>
				<a
					href="/dashboard"
					class="flex w-full items-center gap-2"
					onclick={() => (isOpen = false)}
				>
					<LayoutDashboardIcon class="size-4" />
					Dashboard
				</a>
			</DropdownMenu.Item>
			<DropdownMenu.Item>
				<a href="/settings" class="flex w-full items-center gap-2" onclick={() => (isOpen = false)}>
					<SettingsIcon class="size-4" />
					Settings
				</a>
			</DropdownMenu.Item>
		</DropdownMenu.Group>
		{#if user.role === 'admin'}
			<DropdownMenu.Separator />
			<DropdownMenu.Label>Admin</DropdownMenu.Label>
			<DropdownMenu.Group>
				<DropdownMenu.Item>
					<a
						href="/admin/events"
						class="flex w-full items-center gap-2"
						onclick={() => (isOpen = false)}
					>
						<CalendarIcon class="size-4" />
						Manage Events
					</a>
				</DropdownMenu.Item>
				<DropdownMenu.Item>
					<a
						href="/admin/stats/beer-consumed"
						class="flex w-full items-center gap-2"
						onclick={() => (isOpen = false)}
					>
						<Beer class="size-4" />
						Manage Beer Consumed
					</a>
				</DropdownMenu.Item>
				<DropdownMenu.Item>
					<a
						href="/admin/stats/keg-credits"
						class="flex w-full items-center gap-2"
						onclick={() => (isOpen = false)}
					>
						<Package class="size-4" />
						Manage Keg Credits
					</a>
				</DropdownMenu.Item>
				<DropdownMenu.Item>
					<a
						href="/dashboard/members"
						class="flex w-full items-center gap-2"
						onclick={() => (isOpen = false)}
					>
						<UsersIcon class="size-4" />
						Manage Members
					</a>
				</DropdownMenu.Item>
			</DropdownMenu.Group>
		{/if}
		<DropdownMenu.Separator />
		<DropdownMenu.Item>
			<form method="post" action="/logout" use:enhance class="flex w-full items-center gap-2">
				<LogOutIcon class="size-4" />
				<button type="submit" class="w-full text-left">Logout</button>
			</form>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
