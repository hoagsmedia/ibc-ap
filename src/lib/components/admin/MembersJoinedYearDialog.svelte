<script lang="ts">
	/**
	 * Lists every row counted in one "Member growth by year" bar. The rows come from the same
	 * cached snapshot as the bar, so the list always matches the bar's count.
	 */
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import type { MembersJoinedYear } from "$lib/admin-stats-members-joined";

	let {
		open = $bindable(false),
		year,
		entry,
		onCloseAutoFocus
	}: {
		open?: boolean;
		/** Year the admin selected; shown even if the snapshot has no bucket for it. */
		year: number | null;
		/** That year's bucket from the page data, or undefined if it is missing. */
		entry: MembersJoinedYear | undefined;
		/** Lets the parent return focus to the bar that opened the dialog. */
		onCloseAutoFocus?: (event: Event) => void;
	} = $props();

	const count = $derived(entry?.members.length ?? 0);
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class="flex max-h-[min(85vh,40rem)] flex-col gap-3 sm:max-w-md"
		{onCloseAutoFocus}
	>
		<Dialog.Header>
			<Dialog.Title>
				{year ?? ""} · {count.toLocaleString("en-US")}
				{count === 1 ? "member" : "members"}
			</Dialog.Title>
			<Dialog.Description>Joined in {year ?? ""}, by member-since date.</Dialog.Description>
		</Dialog.Header>
		{#if count === 0}
			<p class="text-muted-foreground text-sm">No members counted for this year.</p>
		{:else}
			<ol
				class="divide-border/60 -mx-2 min-h-0 flex-1 divide-y overflow-y-auto overscroll-contain px-2"
				aria-label="Members who joined in {year}"
				data-testid="members-joined-year-list"
			>
				{#each entry?.members ?? [] as member, i (i)}
					<li class="flex items-baseline justify-between gap-4 py-2 text-sm">
						<span class="text-foreground min-w-0 break-words">{member.name}</span>
						<span class="text-muted-foreground shrink-0 tabular-nums">
							{member.mbr != null ? `#${member.mbr}` : "No #"}
						</span>
					</li>
				{/each}
			</ol>
		{/if}
	</Dialog.Content>
</Dialog.Root>
