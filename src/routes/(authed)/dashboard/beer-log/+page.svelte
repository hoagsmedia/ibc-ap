<script lang="ts">
	import type { ActionData, PageData } from "./$types";
	import type { SubmitFunction } from "@sveltejs/kit";
	import { enhance } from "$app/forms";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { Textarea } from "$lib/components/ui/textarea";
	import Avatar from "$lib/components/Avatar.svelte";
	import MemberHubPageHeader from "$lib/components/MemberHubPageHeader.svelte";
	import { toast } from "svelte-sonner";
	import { cn } from "$lib/utils.js";
	import Beer from "@lucide/svelte/icons/beer";
	import Star from "@lucide/svelte/icons/star";
	import Trash2 from "@lucide/svelte/icons/trash-2";
	import Trophy from "@lucide/svelte/icons/trophy";

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let rating = $state(0);
	let posting = $state(false);

	const RATING_LABELS = ["", "Meh", "Okay", "Good", "Great", "Outstanding"];

	function timeAgo(date: Date | string): string {
		const seconds = Math.max(0, (Date.now() - new Date(date).getTime()) / 1000);
		if (seconds < 60) return "just now";
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		if (days < 7) return `${days}d ago`;
		return new Date(date).toLocaleDateString();
	}

	const toastErrors: SubmitFunction = () => {
		return async ({ result, update }) => {
			if (result.type === "failure" && typeof result.data?.error === "string") {
				toast.error(result.data.error);
			}
			await update({ reset: false });
		};
	};

	const submitCheckin: SubmitFunction = () => {
		posting = true;
		return async ({ result, update }) => {
			posting = false;
			if (result.type === "success") {
				rating = 0;
				toast.success("Cheers! Your check-in is on the board.");
				await update();
			} else {
				if (result.type === "failure" && typeof result.data?.error === "string") {
					toast.error(result.data.error);
				}
				await update({ reset: false });
			}
		};
	};
</script>

<svelte:head>
	<title>Beer Log | Island Beer Club</title>
</svelte:head>

<div class="mx-auto w-full max-w-5xl space-y-8 py-6 md:py-10">
	<MemberHubPageHeader
		title="Beer Log"
		description="Check in what you're drinking and raise a 🍻 to what other members are pouring."
	/>

	<div class="grid gap-6 lg:grid-cols-[1fr_18rem]">
		<div class="min-w-0 space-y-6">
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2 text-base">
						<Beer class="size-4" />
						What are you drinking?
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<form
						method="POST"
						action="?/checkin"
						use:enhance={submitCheckin}
						class="space-y-4"
						autocomplete="off"
					>
						<div class="grid gap-4 sm:grid-cols-2">
							<div class="space-y-1.5">
								<Label for="beer_name">Beer</Label>
								<Input
									id="beer_name"
									name="beer_name"
									required
									maxlength={80}
									placeholder="e.g. Big Wave Golden Ale"
									value={form?.values?.beer_name ?? ""}
								/>
							</div>
							<div class="space-y-1.5">
								<Label for="brewery"
									>Brewery <span class="text-muted-foreground">(optional)</span></Label
								>
								<Input
									id="brewery"
									name="brewery"
									maxlength={80}
									placeholder="e.g. Kona Brewing"
									value={form?.values?.brewery ?? ""}
								/>
							</div>
						</div>

						<fieldset class="space-y-1.5">
							<legend class="text-sm font-medium">Rating</legend>
							<div class="flex items-center gap-1">
								{#each [1, 2, 3, 4, 5] as value (value)}
									<label
										class="focus-within:ring-ring cursor-pointer rounded p-0.5 focus-within:ring-2"
									>
										<input
											type="radio"
											name="rating"
											{value}
											class="sr-only"
											required
											checked={rating === value}
											onchange={() => (rating = value)}
										/>
										<Star
											class={cn(
												"size-7 transition-colors",
												value <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
											)}
										/>
										<span class="sr-only">{value} star{value === 1 ? "" : "s"}</span>
									</label>
								{/each}
								<span class="text-muted-foreground ml-2 text-sm">{RATING_LABELS[rating]}</span>
							</div>
						</fieldset>

						<div class="space-y-1.5">
							<Label for="note">Note <span class="text-muted-foreground">(optional)</span></Label>
							<Textarea
								id="note"
								name="note"
								maxlength={200}
								rows={2}
								class="resize-none"
								placeholder="Where are you, what's it like?"
								value={form?.values?.note ?? ""}
							/>
						</div>

						<Button type="submit" class="gap-2" disabled={posting}>
							<Beer class="size-4" />
							{posting ? "Checking in…" : "Check in"}
						</Button>
					</form>
				</Card.Content>
			</Card.Root>

			<section class="space-y-3" aria-label="Club feed">
				<h2 class="text-lg font-semibold">Club feed</h2>
				{#if data.feed.length === 0}
					<Card.Root>
						<Card.Content class="text-muted-foreground py-10 text-center text-sm">
							No check-ins yet. Be the first to pour one!
						</Card.Content>
					</Card.Root>
				{/if}
				{#each data.feed as item (item.id)}
					<Card.Root>
						<Card.Content class="flex gap-3 pt-6">
							<a href="/members/{item.user_id}" class="shrink-0">
								<Avatar name={item.name} img={item.img ?? undefined} class="size-10" />
							</a>
							<div class="min-w-0 flex-1 space-y-1">
								<p class="text-sm">
									<a href="/members/{item.user_id}" class="font-semibold hover:underline"
										>{item.name}</a
									>
									{#if item.mbr != null}<span class="text-muted-foreground">#{item.mbr}</span>{/if}
									<span class="text-muted-foreground">is drinking</span>
								</p>
								<p class="font-medium break-words">
									{item.beer_name}
									{#if item.brewery}<span class="text-muted-foreground font-normal"
											>· {item.brewery}</span
										>{/if}
								</p>
								<div class="flex items-center gap-0.5" aria-label="{item.rating} out of 5 stars">
									{#each [1, 2, 3, 4, 5] as value (value)}
										<Star
											class={cn(
												"size-4",
												value <= item.rating
													? "fill-amber-400 text-amber-400"
													: "text-muted-foreground/40"
											)}
										/>
									{/each}
								</div>
								{#if item.note}
									<p class="text-muted-foreground text-sm break-words whitespace-pre-line">
										{item.note}
									</p>
								{/if}
								<div class="flex items-center gap-2 pt-1">
									<form method="POST" action="?/cheer" use:enhance={toastErrors}>
										<input type="hidden" name="id" value={item.id} />
										<Button
											type="submit"
											variant={item.cheered ? "secondary" : "ghost"}
											size="sm"
											class="h-8 gap-1.5 px-2"
											disabled={item.user_id === data.user.id}
											aria-pressed={item.cheered}
											title={item.user_id === data.user.id
												? "Cheers from other members show here"
												: "Cheers!"}
										>
											<span aria-hidden="true">🍻</span>
											<span>{item.cheers > 0 ? item.cheers : ""} Cheers</span>
										</Button>
									</form>
									<span class="text-muted-foreground text-xs">{timeAgo(item.created_at)}</span>
									{#if item.canDelete}
										<form method="POST" action="?/delete" use:enhance={toastErrors} class="ml-auto">
											<input type="hidden" name="id" value={item.id} />
											<Button
												type="submit"
												variant="ghost"
												size="sm"
												class="text-muted-foreground h-8 px-2"
												aria-label="Delete check-in"
											>
												<Trash2 class="size-4" />
											</Button>
										</form>
									{/if}
								</div>
							</div>
						</Card.Content>
					</Card.Root>
				{/each}
			</section>
		</div>

		<aside class="space-y-6">
			<Card.Root>
				<Card.Header>
					<Card.Title class="text-base">Your check-ins</Card.Title>
				</Card.Header>
				<Card.Content>
					<p class="text-3xl font-bold">{data.myTotal}</p>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2 text-base">
						<Trophy class="size-4" />
						Top drinkers this month
					</Card.Title>
				</Card.Header>
				<Card.Content>
					{#if data.leaders.length === 0}
						<p class="text-muted-foreground text-sm">Nobody yet this month.</p>
					{:else}
						<ol class="space-y-3">
							{#each data.leaders as leader, i (leader.user_id)}
								<li class="flex items-center gap-3">
									<span class="text-muted-foreground w-4 text-sm">{i + 1}</span>
									<Avatar name={leader.name} img={leader.img ?? undefined} class="size-8" />
									<a
										href="/members/{leader.user_id}"
										class="min-w-0 flex-1 truncate text-sm hover:underline">{leader.name}</a
									>
									<span class="text-sm font-semibold">{leader.checkins}</span>
								</li>
							{/each}
						</ol>
					{/if}
				</Card.Content>
			</Card.Root>
		</aside>
	</div>
</div>
