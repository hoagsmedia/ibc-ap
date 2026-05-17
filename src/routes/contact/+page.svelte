<script lang="ts">
	import type { PageData } from "./$types";
	import { Field, Control, Label, FieldErrors } from "formsnap";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Textarea } from "$lib/components/ui/textarea";
	import { toast } from "svelte-sonner";
	import { zodClient } from "sveltekit-superforms/adapters";
	import { superForm } from "sveltekit-superforms";
	import { CONTACT_HONEYPOT_FIELD } from "$lib/contact-honeypot";
	import { contactSchema } from "./contact-schema";
	import IbcLogo from "$lib/components/IbcLogo.svelte";
	import { cn } from "$lib/utils.js";
	import MapPin from "@lucide/svelte/icons/map-pin";
	import Mail from "@lucide/svelte/icons/mail";
	import Clock from "@lucide/svelte/icons/clock";
	import Shield from "@lucide/svelte/icons/shield";
	import Send from "@lucide/svelte/icons/send";
	import User from "@lucide/svelte/icons/user";
	import MessageSquare from "@lucide/svelte/icons/message-square";
	import Beer from "@lucide/svelte/icons/beer";
	import Users from "@lucide/svelte/icons/users";
	import TreePalm from "@lucide/svelte/icons/tree-palm";
	import Sparkles from "@lucide/svelte/icons/sparkles";

	let { data }: { data: PageData } = $props();

	const year = new Date().getFullYear();

	const form = superForm(data.form, {
		validators: zodClient(contactSchema),
		resetForm: true,
		onUpdated: ({ form: f }) => {
			if (!f.message) return;
			if (f.message.startsWith("Thank you")) {
				toast.success(f.message);
			} else {
				toast.error(f.message);
			}
		},
		onError: ({ result }) => {
			toast.error(result.error?.message ?? "Something went wrong. Please try again.");
		}
	});

	const { form: formData, enhance } = form;

	const contactInfo = {
		address: "Coronado, California",
		email: "info@islandbeerclub.com",
		hours: "We typically reply within 24–48 hours."
	};

	const iconBox =
		"border-primary/45 bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-full border shadow-sm";
</script>

<svelte:head>
	<title>Contact — Island Beer Club</title>
	<meta
		name="description"
		content="Get in touch with Island Beer Club — questions, ideas, or just say cheers."
	/>
</svelte:head>

<div class="ibc-contact-shell bg-background text-foreground antialiased">
	<!-- Soft atmosphere (dashboard-adjacent) -->
	<div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
		<div class="from-muted/40 via-background to-background absolute inset-0 bg-gradient-to-b"></div>
		<!-- Screen blend drops solid black from the asset on light backgrounds; normal blend in dark -->
		<div
			class="absolute top-0 right-[-8%] h-[min(50vh,480px)] w-[min(88vw,560px)] opacity-[0.2] mix-blend-screen dark:opacity-[0.14] dark:mix-blend-normal"
			style="background-image: url('/images/invitation-barrels-bg.png'); background-size: cover; background-position: center;"
		></div>
	</div>

	<div class="relative z-10 mx-auto max-w-5xl px-4 py-10 pb-16 md:px-8 md:py-14">
		<!-- Header -->
		<header class="text-center">
			<a
				href="/"
				aria-label="Island Beer Club home"
				class="ring-offset-background focus-visible:ring-ring/50 inline-flex flex-col items-center gap-3 outline-none focus-visible:ring-2"
			>
				<IbcLogo
					class="h-[4.5rem] w-auto md:h-[5.25rem] [&>svg]:h-full [&>svg]:w-auto"
					decorative
				/>
			</a>
			<p
				class="text-muted-foreground mt-6 text-[0.7rem] font-semibold tracking-[0.22em] uppercase sm:text-xs sm:tracking-[0.18em]"
			>
				Good people. Great beer. Stronger island.
			</p>
			<h1
				class="mt-5 flex flex-wrap items-center justify-center gap-2 text-3xl font-bold tracking-tight sm:gap-3 sm:text-4xl"
			>
				<span class="text-foreground">Get in</span>
				<span class="text-primary">Touch</span>
			</h1>
			<p class="text-muted-foreground mx-auto mt-4 max-w-lg text-base leading-relaxed md:text-lg">
				Have a question, a suggestion, or just want to say cheers? We’d love to hear from you.
			</p>
		</header>

		<!-- Main card — matches dashboard card treatment -->
		<div
			class="border-border/50 from-sidebar/25 to-card mt-10 overflow-hidden rounded-2xl border bg-gradient-to-br shadow-sm md:rounded-2xl"
		>
			<div class="divide-border/50 grid divide-y lg:grid-cols-2 lg:divide-x lg:divide-y-0">
				<!-- Left: Let's connect -->
				<div class="relative flex flex-col">
					<div
						class="absolute inset-0 bg-[url('/images/welcome-island-sunset-bg.jpg')] bg-cover bg-bottom opacity-[0.2] dark:opacity-[0.28]"
						aria-hidden="true"
					></div>
					<div
						class="from-card/95 via-card/90 to-card/98 dark:from-card/90 absolute inset-0 bg-gradient-to-b"
						aria-hidden="true"
					></div>
					<div class="relative flex flex-1 flex-col p-8 md:p-10">
						<h2 class="text-foreground text-2xl font-semibold tracking-tight md:text-[1.35rem]">
							Let's connect
						</h2>
						<Sparkles
							class="text-primary mt-2 size-5 opacity-80"
							strokeWidth={1.5}
							aria-hidden="true"
						/>
						<p class="text-muted-foreground mt-5 text-sm leading-relaxed">
							Whether it’s membership, events, or something you’d love to see on the site — reach
							out. We read every message.
						</p>

						<ul class="mt-8 space-y-5">
							<li class="flex gap-4">
								<span class={iconBox}>
									<MapPin class="size-5" strokeWidth={1.75} />
								</span>
								<div>
									<p
										class="text-muted-foreground text-[0.65rem] font-semibold tracking-[0.18em] uppercase"
									>
										Location
									</p>
									<p class="text-foreground mt-0.5 text-sm font-medium">{contactInfo.address}</p>
								</div>
							</li>
							<li class="flex gap-4">
								<span class={iconBox}>
									<Clock class="size-5" strokeWidth={1.75} />
								</span>
								<div>
									<p
										class="text-muted-foreground text-[0.65rem] font-semibold tracking-[0.18em] uppercase"
									>
										Response time
									</p>
									<p class="text-foreground mt-0.5 text-sm font-medium">{contactInfo.hours}</p>
								</div>
							</li>
						</ul>
					</div>
				</div>

				<!-- Right: Form -->
				<div class="bg-card/80 dark:bg-card/60 p-8 backdrop-blur-[2px] md:p-10">
					<h2 class="text-foreground text-2xl font-semibold tracking-tight md:text-[1.35rem]">
						Send us a message
					</h2>
					<form method="POST" use:enhance class="mt-8 space-y-6">
						<!-- Honeypot: leave empty (bots often fill hidden fields). -->
						<div class="sr-only" aria-hidden="true">
							<label for={CONTACT_HONEYPOT_FIELD}>Company website</label>
							<input
								id={CONTACT_HONEYPOT_FIELD}
								type="text"
								name={CONTACT_HONEYPOT_FIELD}
								value=""
								tabindex={-1}
								autocomplete="off"
							/>
						</div>
						<Field {form} name="name">
							<Control>
								{#snippet children({ props })}
									<Label
										class="text-muted-foreground mb-2 block text-xs font-semibold tracking-wide uppercase"
										>Name</Label
									>
									<div class="relative">
										<User
											class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
											strokeWidth={1.75}
										/>
										<Input
											{...props}
											bind:value={$formData.name}
											placeholder="Enter your name"
											class="h-11 pl-10"
										/>
									</div>
								{/snippet}
							</Control>
							<FieldErrors class="text-destructive mt-1.5 text-sm" />
						</Field>

						<Field {form} name="email">
							<Control>
								{#snippet children({ props })}
									<Label
										class="text-muted-foreground mb-2 block text-xs font-semibold tracking-wide uppercase"
										>Email address</Label
									>
									<div class="relative">
										<Mail
											class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
											strokeWidth={1.75}
										/>
										<Input
											{...props}
											type="email"
											bind:value={$formData.email}
											placeholder="Enter your email"
											autocomplete="email"
											class="h-11 pl-10"
										/>
									</div>
								{/snippet}
							</Control>
							<FieldErrors class="text-destructive mt-1.5 text-sm" />
						</Field>

						<Field {form} name="message">
							<Control>
								{#snippet children({ props })}
									<Label
										class="text-muted-foreground mb-2 block text-xs font-semibold tracking-wide uppercase"
										>Message</Label
									>
									<div class="relative">
										<MessageSquare
											class="text-muted-foreground pointer-events-none absolute top-3 left-3 size-4"
											strokeWidth={1.75}
										/>
										<Textarea
											{...props}
											bind:value={$formData.message}
											placeholder="How can we help?"
											rows={5}
											class="min-h-[140px] resize-none py-3 pl-10"
										/>
									</div>
								{/snippet}
							</Control>
							<FieldErrors class="text-destructive mt-1.5 text-sm" />
						</Field>

						<Button type="submit" size="lg" class="h-11 w-full gap-2 font-semibold">
							<Send class="size-4" strokeWidth={2} />
							Send message
						</Button>

						<p
							class="text-muted-foreground flex items-center justify-center gap-2 text-center text-xs"
						>
							<Shield class="size-3.5 shrink-0 opacity-80" strokeWidth={2} aria-hidden="true" />
							We respect your privacy. Your information stays with the club.
						</p>
					</form>
				</div>
			</div>
		</div>

		<!-- Values -->
		<div
			class="border-border/50 bg-card/60 divide-border/50 mt-10 grid divide-y rounded-2xl border md:grid-cols-3 md:divide-x md:divide-y-0"
		>
			<div class="flex flex-col items-center gap-3 px-6 py-8 text-center md:py-10">
				<span class={cn(iconBox, "size-12 rounded-xl")}>
					<Beer class="size-6" strokeWidth={1.5} />
				</span>
				<h3 class="text-foreground text-lg font-semibold tracking-tight">Great beer</h3>
				<p class="text-muted-foreground max-w-xs text-sm leading-relaxed">
					Craft brews, good pours, and room to explore what’s in your glass.
				</p>
			</div>
			<div class="flex flex-col items-center gap-3 px-6 py-8 text-center md:py-10">
				<span class={cn(iconBox, "size-12 rounded-xl")}>
					<Users class="size-6" strokeWidth={1.5} />
				</span>
				<h3 class="text-foreground text-lg font-semibold tracking-tight">Great people</h3>
				<p class="text-muted-foreground max-w-xs text-sm leading-relaxed">
					Friends who showed up as kids and kept showing up as members.
				</p>
			</div>
			<div class="flex flex-col items-center gap-3 px-6 py-8 text-center md:py-10">
				<span class={cn(iconBox, "size-12 rounded-xl")}>
					<TreePalm class="size-6" strokeWidth={1.5} />
				</span>
				<h3 class="text-foreground text-lg font-semibold tracking-tight">Stronger island</h3>
				<p class="text-muted-foreground max-w-xs text-sm leading-relaxed">
					Rooted in Coronado — open to members wherever they roam.
				</p>
			</div>
		</div>

		<!-- Local footer -->
		<footer
			class="border-border/50 text-muted-foreground mt-14 flex flex-col items-center justify-between gap-6 border-t pt-10 md:flex-row"
		>
			<div class="flex items-center gap-3">
				<a
					href={`mailto:${contactInfo.email}`}
					class="border-border hover:bg-muted/60 flex size-10 items-center justify-center rounded-full border transition-colors"
					aria-label="Email"
				>
					<Mail class="size-[1.1rem]" strokeWidth={1.75} />
				</a>
				<a
					href="https://www.facebook.com/"
					target="_blank"
					rel="noopener noreferrer"
					class="border-border hover:bg-muted/60 flex size-10 items-center justify-center rounded-full border transition-colors"
					aria-label="Facebook"
				>
					<svg class="size-[1.05rem]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path
							d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
						/>
					</svg>
				</a>
				<a
					href="https://www.instagram.com/"
					target="_blank"
					rel="noopener noreferrer"
					class="border-border hover:bg-muted/60 flex size-10 items-center justify-center rounded-full border transition-colors"
					aria-label="Instagram"
				>
					<svg class="size-[1.05rem]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path
							d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
						/>
					</svg>
				</a>
			</div>
			<p class="text-center text-sm md:text-right">
				© {year} Island Beer Club. All rights reserved.
			</p>
		</footer>
	</div>
</div>

<style>
	.ibc-contact-shell {
		width: 100vw;
		margin-left: calc(50% - 50vw);
		position: relative;
		min-height: min(100%, 100dvh);
	}
</style>
