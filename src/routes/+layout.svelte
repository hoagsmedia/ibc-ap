<script lang="ts">
	import '../app.css';
	import * as NavigationMenu from '$lib/components/ui/navigation-menu/index.js';

	let { children } = $props();

	const navLinks = [
		{ href: '/', label: 'Home', description: 'Return to the homepage.' },
		{ href: '/about', label: 'About', description: 'Learn about the Island Beer Club.' },
		{ href: '/members', label: 'Members', description: 'Meet our members.' },
		{ href: '/events', label: 'Events', description: 'Upcoming and past events.' },
		{ href: '/fun', label: 'Fun', description: 'Games, jokes, and more.' },
		{ href: '/contact', label: 'Contact', description: 'Get in touch with us.' },
		{ href: '/gallery', label: 'Gallery', description: 'Photo gallery of club events.' },
		{ href: '/history', label: 'History', description: 'Our club history.' },
		{ href: '/links', label: 'Links', description: 'Beer resources and friends.' },
		{ href: '/rules', label: 'Rules', description: 'Club rules and guidelines.' },
		{ href: '/movie', label: 'IBC Movie', description: 'Watch the IBC movie.' }
	];

	const dropdownLinks = [
		{ href: '/gallery', label: 'Gallery', description: 'Photo gallery of club events.' },
		{ href: '/history', label: 'History', description: 'Our club history.' },
		{ href: '/links', label: 'Links', description: 'Beer resources and friends.' },
		{ href: '/rules', label: 'Rules', description: 'Club rules and guidelines.' },
		{ href: '/movie', label: 'IBC Movie', description: 'Watch the IBC movie.' }
	];

	const mainLinks = navLinks.filter((l) => !dropdownLinks.some((d) => d.href === l.href));
</script>

<NavigationMenu.Root>
	<NavigationMenu.List>
		{#each mainLinks as link}
			<NavigationMenu.Item>
				<NavigationMenu.Link href={link.href}>{link.label}</NavigationMenu.Link>
			</NavigationMenu.Item>
		{/each}
		<NavigationMenu.Item>
			<NavigationMenu.Trigger>More</NavigationMenu.Trigger>
			<NavigationMenu.Content>
				<ul>
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

{@render children()}
