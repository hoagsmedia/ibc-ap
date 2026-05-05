<script lang="ts">
	import type { PageData } from "./$types";
	import { enhance } from "$app/forms";
	import { navigating } from "$app/state";
	import { AlertDialog } from "bits-ui";
	import * as Alert from "$lib/components/ui/alert";
	import * as Card from "$lib/components/ui/card";
	import * as Dialog from "$lib/components/ui/dialog";
	import { Badge } from "$lib/components/ui/badge";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { Skeleton } from "$lib/components/ui/skeleton/index.js";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";
	import DatePickerField from "$lib/components/DatePickerField.svelte";
	import InvitationRow from "$lib/components/dashboard/InvitationRow.svelte";
	import QuickActionLink from "$lib/components/dashboard/QuickActionLink.svelte";
	import {
		BarChart3,
		Beer,
		BookUser,
		Calendar,
		CalendarDays,
		CalendarRange,
		CheckIcon,
		ClipboardList,
		ClockIcon,
		LayoutGrid,
		LinkIcon,
		Loader2,
		Mail,
		Package,
		Plus,
		Sparkles,
		TrendingUp,
		User,
		UserPlusIcon,
		Users
	} from "@lucide/svelte/icons";
	import { requiresIbcTest } from "$lib/ibc-test";
	import {
		hubCardMidWashClass,
		hubHeroActionBtnClass,
		hubHeroScrimLrClass,
		hubHeroScrimTbClass,
		upcomingEventsRowGridClass,
		inviteCopyBtnClass,
		inviteRowHighlightClass,
		inviteRowIdleClass,
		inviteRowShellClass
	} from "$lib/dashboard-hub-classes";
	import { formatDate } from "$lib/utils";
	import type { DateValue } from "@internationalized/date";
	import { toast } from "svelte-sonner";

	let { data }: { data: PageData } = $props();

	let creating = $state(false);
	let memberRolloutQuery = $state("");
	let memberRolloutResults = $state<
		Array<{ id: string; name: string; email: string; mbr: number }>
	>([]);
	let memberRolloutSearchLoading = $state(false);
	let memberRolloutConfirmOpen = $state(false);
	let memberRolloutTarget = $state<{
		id: string;
		name: string;
		email: string;
		mbr: number;
	} | null>(null);
	let memberRolloutSending = $state(false);
	let memberRolloutSearchTimer: ReturnType<typeof setTimeout> | undefined;
	let highlightInviteToken = $state<string | null>(null);
	let inviteErrorOpen = $state(false);
	let inviteErrorMessage = $state("");
	let inviteCreateDialogOpen = $state(false);
	let prospectProgressDialogOpen = $state(Boolean(data.prospectGate?.active));
	let meeting1Date = $state(data.prospectGate?.meetingDates?.[0] ?? "");
	let meeting2Date = $state(data.prospectGate?.meetingDates?.[1] ?? "");
	let meeting3Date = $state(data.prospectGate?.meetingDates?.[2] ?? "");
	const persistedMeetingDates = $derived(data.prospectGate?.meetingDates ?? ["", "", ""]);
	let activeMeetingSlot = $state(
		data.prospectGate
			? Math.min(data.prospectGate.meetingCount + 1, data.prospectGate.meetingsRequired)
			: 1
	);

	function jumpToMeetingSlot(slot: number) {
		prospectProgressDialogOpen = false;
		activeMeetingSlot = slot;

		if (typeof window === "undefined") return;

		const fieldId = `meeting-${slot}-date`;
		window.location.hash = fieldId;
		window.requestAnimationFrame(() => {
			const field = document.getElementById(fieldId);
			field?.scrollIntoView({ behavior: "smooth", block: "center" });
			(field as HTMLElement | null)?.focus?.();
		});
	}

	/** Bits UI Calendar already applies min/max as disabled days; use this only for “not a Wednesday”. */
	function disableIfNotWednesdayUtc(date: DateValue) {
		return new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay() !== 3;
	}

	function scheduleMemberRolloutSearch(q: string) {
		clearTimeout(memberRolloutSearchTimer);
		if (q.trim().length < 2) {
			memberRolloutResults = [];
			return;
		}
		memberRolloutSearchTimer = setTimeout(async () => {
			memberRolloutSearchLoading = true;
			try {
				const res = await fetch(`/api/member-rollout-search?q=${encodeURIComponent(q.trim())}`);
				const json = (await res.json()) as {
					results?: Array<{ id: string; name: string; email: string; mbr: number }>;
				};
				memberRolloutResults = json.results ?? [];
			} finally {
				memberRolloutSearchLoading = false;
			}
		}, 280);
	}

	function offsetDateString(value: string, days: number) {
		if (!value) return undefined;
		const date = new Date(`${value}T00:00:00.000Z`);
		if (Number.isNaN(date.getTime())) return undefined;
		date.setUTCDate(date.getUTCDate() + days);
		const year = date.getUTCFullYear();
		const month = String(date.getUTCMonth() + 1).padStart(2, "0");
		const day = String(date.getUTCDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	}

	function isMeetingSaved(slot: number) {
		return Boolean(persistedMeetingDates[slot - 1]);
	}

	$effect(() => {
		if (!data.prospectGate) {
			prospectProgressDialogOpen = false;
			return;
		}
		meeting1Date = persistedMeetingDates[0] ?? "";
		meeting2Date = persistedMeetingDates[1] ?? "";
		meeting3Date = persistedMeetingDates[2] ?? "";
	});

	function enhanceProspectMeetingAction() {
		return async ({
			result,
			update
		}: {
			result: { type: string; data?: Record<string, unknown> };
			update: () => Promise<void>;
		}) => {
			await update();
			if (result.type === "failure") {
				const msg = result.data?.message;
				toast.error(typeof msg === "string" ? msg : "Could not save meeting date.");
			}
		};
	}

	const engagementPct = $derived(
		data.user && data.clubStats.totalMembers > 0
			? Math.round((data.clubStats.activeMembers / data.clubStats.totalMembers) * 100)
			: 0
	);

	/** Shown while client-navigating to this page so the card doesn’t jump empty. */
	const pendingMembersCardLoading = $derived(navigating?.to?.url.pathname === "/dashboard");

	/** Unused expired links are hidden from the list. */
	const visibleInvitations = $derived(
		(data.invitations ?? []).filter(
			(inv) => Boolean(inv.used_at) || Date.now() < new Date(inv.expires_at).getTime()
		)
	);

	const canCreateInvites = $derived(
		Boolean(
			data.user &&
				data.resendInviteConfigured &&
				!requiresIbcTest(data.user) &&
				(data.user.role === "admin" || (data.user.role === "member" && data.user.mbr != null))
		)
	);
	/** Hide for prospects who must pass the test first; admins always see it (may not have test_passed). */
	const showInvitationLinksCard = $derived(
		Boolean(data.user && (!requiresIbcTest(data.user) || data.user.role === "admin"))
	);
	const isProspectOnboarding = $derived(Boolean(data.prospectGate?.active));
	const canAccessExclusiveFeatures = $derived(Boolean(data.canAccessExclusiveFeatures));
	const meetingsRemaining = $derived(
		data.prospectGate ? data.prospectGate.meetingsRequired - data.prospectGate.meetingCount : 0
	);
	const meetingSlots = $derived([
		{
			slot: 1,
			label: "Meeting 1",
			value: meeting1Date,
			saved: isMeetingSaved(1),
			dirty: meeting1Date !== (persistedMeetingDates[0] ?? "")
		},
		{
			slot: 2,
			label: "Meeting 2",
			value: meeting2Date,
			saved: isMeetingSaved(2),
			dirty: meeting2Date !== (persistedMeetingDates[1] ?? "")
		},
		{
			slot: 3,
			label: "Meeting 3",
			value: meeting3Date,
			saved: isMeetingSaved(3),
			dirty: meeting3Date !== (persistedMeetingDates[2] ?? "")
		}
	]);
	const activeMeeting = $derived(
		meetingSlots.find((meeting) => meeting.slot === activeMeetingSlot) ?? meetingSlots[0]
	);
</script>

<svelte:head>
	<title>Dashboard | Island Beer Club</title>
	<meta name="description" content="Island Beer Club member dashboard" />
</svelte:head>

<div class="mx-auto flex w-full max-w-[1600px] min-w-0 flex-col gap-8">
	{#if data.user && canAccessExclusiveFeatures}
		<section
			class="grid grid-cols-3 gap-2 sm:gap-4 md:gap-5"
			aria-labelledby="club-overview-heading"
		>
			<h2 id="club-overview-heading" class="sr-only">Club snapshot</h2>
			<a
				href="/dashboard/members"
				class="text-foreground from-sidebar/25 to-card hover:border-primary/40 focus-visible:ring-ring relative block min-w-0 overflow-hidden rounded-xl border bg-gradient-to-br p-3 no-underline shadow-sm outline-offset-2 transition-[border-color,box-shadow] hover:shadow-md focus-visible:ring-2 sm:rounded-2xl sm:p-5"
			>
				<div class="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 sm:gap-4">
					<div class="min-w-0">
						<p
							class="text-muted-foreground text-[0.6rem] font-medium tracking-wide uppercase sm:text-xs"
						>
							Total members
						</p>
						<p
							class="text-foreground mt-1 text-xl font-bold tracking-tight tabular-nums sm:mt-2 sm:text-3xl"
						>
							{data.clubStats.totalMembers.toLocaleString()}
						</p>
						{#if data.clubStats.membersJoinedThisMonth > 0}
							<p
								class="mt-1 line-clamp-2 text-[0.65rem] leading-snug text-emerald-600 sm:mt-2 sm:text-sm sm:leading-normal dark:text-emerald-400/90"
							>
								+{data.clubStats.membersJoinedThisMonth} this month
							</p>
						{:else}
							<p
								class="text-muted-foreground mt-1 line-clamp-2 text-[0.65rem] leading-snug sm:mt-2 sm:text-sm sm:leading-normal"
							>
								None this month
							</p>
						{/if}
					</div>
					<div
						class="border-primary/45 bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg border shadow-sm sm:size-11 sm:rounded-xl"
						aria-hidden="true"
					>
						<Users class="size-4 sm:size-5" />
					</div>
				</div>
			</a>
			<a
				href={data.user.role === "admin" ? "/admin/stats/beer-consumed" : "/dashboard/stats"}
				class="text-foreground from-sidebar/25 to-card hover:border-primary/40 focus-visible:ring-ring relative block min-w-0 overflow-hidden rounded-xl border bg-gradient-to-br p-3 no-underline shadow-sm outline-offset-2 transition-[border-color,box-shadow] hover:shadow-md focus-visible:ring-2 sm:rounded-2xl sm:p-5"
			>
				<div class="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 sm:gap-4">
					<div class="min-w-0">
						<p
							class="text-muted-foreground text-[0.6rem] font-medium tracking-wide uppercase sm:text-xs"
						>
							Kegs consumed
						</p>
						<p
							class="text-foreground mt-1 text-xl font-bold tracking-tight tabular-nums sm:mt-2 sm:text-3xl"
						>
							{data.clubStats.kegsConsumed.toLocaleString()}
						</p>
						{#if data.clubStats.kegsAddedThisMonth > 0}
							<p
								class="mt-1 line-clamp-2 text-[0.65rem] leading-snug text-emerald-600 sm:mt-2 sm:text-sm sm:leading-normal dark:text-emerald-400/90"
							>
								+{data.clubStats.kegsAddedThisMonth} this month
							</p>
						{:else}
							<p
								class="text-muted-foreground mt-1 line-clamp-2 text-[0.65rem] leading-snug sm:mt-2 sm:text-sm sm:leading-normal"
							>
								None this month
							</p>
						{/if}
					</div>
					<div
						class="border-primary/45 bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg border shadow-sm sm:size-11 sm:rounded-xl"
						aria-hidden="true"
					>
						<Beer class="size-4 sm:size-5" />
					</div>
				</div>
			</a>
			<a
				href="/dashboard/events"
				class="text-foreground from-sidebar/25 to-card hover:border-primary/40 focus-visible:ring-ring relative block min-w-0 overflow-hidden rounded-xl border bg-gradient-to-br p-3 no-underline shadow-sm outline-offset-2 transition-[border-color,box-shadow] hover:shadow-md focus-visible:ring-2 sm:rounded-2xl sm:p-5"
			>
				<div class="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 sm:gap-4">
					<div class="min-w-0">
						<p
							class="text-muted-foreground text-[0.6rem] font-medium tracking-wide uppercase sm:text-xs"
						>
							Events this year
						</p>
						<p
							class="text-foreground mt-1 text-xl font-bold tracking-tight tabular-nums sm:mt-2 sm:text-3xl"
						>
							{data.clubStats.eventsThisYear.toLocaleString()}
						</p>
						{#if data.clubStats.eventsThisYear === 0}
							<p
								class="text-muted-foreground mt-1 line-clamp-2 text-[0.65rem] leading-snug sm:mt-2 sm:text-sm sm:leading-normal"
							>
								No events yet
							</p>
						{:else if data.clubStats.eventsThisMonth > 0}
							<p
								class="mt-1 line-clamp-2 text-[0.65rem] leading-snug text-emerald-600 sm:mt-2 sm:text-sm sm:leading-normal dark:text-emerald-400/90"
							>
								+{data.clubStats.eventsThisMonth} this month
							</p>
						{:else}
							<p
								class="text-muted-foreground mt-1 line-clamp-2 text-[0.65rem] leading-snug sm:mt-2 sm:text-sm sm:leading-normal"
							>
								None scheduled this month
							</p>
						{/if}
					</div>
					<div
						class="border-primary/45 bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg border shadow-sm sm:size-11 sm:rounded-xl"
						aria-hidden="true"
					>
						<Calendar class="size-4 sm:size-5" />
					</div>
				</div>
			</a>
		</section>
	{/if}

	<!-- Hero + insights -->
	{#if data.user}
		<section
			class="grid w-full min-w-0 grid-cols-1 gap-8 lg:grid-cols-3"
			aria-labelledby="welcome-heading"
		>
			<div
				class="ibc-lounge-hero relative col-span-1 flex min-h-[260px] flex-col overflow-hidden rounded-2xl border shadow-md {data
					.user.role === 'admin'
					? 'lg:col-span-2'
					: 'lg:col-span-3'}"
			>
				<div
					class="pointer-events-none absolute inset-0 z-0 bg-[url('/images/welcome-island-sunset-bg.jpg')] bg-cover bg-[position:right_center] bg-no-repeat opacity-[0.55] saturate-[1.05]"
					aria-hidden="true"
				></div>
				<div class={hubHeroScrimLrClass} aria-hidden="true"></div>
				<div class={hubHeroScrimTbClass} aria-hidden="true"></div>
				<div
					class="relative z-10 flex flex-1 flex-col justify-between gap-8 p-6 sm:p-8 lg:min-h-[280px]"
				>
					<div class="flex w-full flex-col gap-4 sm:gap-5">
						<div class="flex w-full items-start justify-between gap-3">
							<p
								class="text-[0.7rem] font-semibold tracking-[0.28em] text-white/80 uppercase sm:text-xs sm:tracking-[0.22em]"
							>
								Member area
							</p>
							<div
								class="flex shrink-0 flex-wrap items-center justify-end gap-x-3 gap-y-1.5 text-right"
							>
								<div class="flex items-baseline justify-end gap-2">
									<span
										class="text-[0.65rem] font-semibold tracking-[0.18em] text-white/55 uppercase sm:text-[0.7rem]"
									>
										Member #
									</span>
									<span
										class="text-lg font-bold tracking-tight text-white tabular-nums drop-shadow-[0_1px_4px_rgba(0,0,0,0.35)] sm:text-xl"
									>
										{#if data.user.mbr != null}
											{data.user.mbr}
										{:else if data.user.role !== "admin" && data.user.role !== "member"}
											<span class="text-amber-200/95">Prospect</span>
										{:else}
											—
										{/if}
									</span>
								</div>
								{#if data.user.role === "admin"}
									<Badge
										class="border-amber-200/35 bg-black/35 px-2 py-0 text-[0.65rem] font-semibold text-amber-100/95 shadow-sm backdrop-blur-[2px] hover:bg-black/45"
									>
										Admin
									</Badge>
								{/if}
							</div>
						</div>
						<div class="max-w-3xl space-y-4 sm:space-y-5 lg:max-w-4xl xl:max-w-5xl">
							<h1
								id="welcome-heading"
								class="text-3xl font-bold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] sm:text-4xl"
							>
								Welcome back
							</h1>
							<p
								class="text-[0.95rem] leading-relaxed text-white/82 drop-shadow-[0_1px_4px_rgba(0,0,0,0.35)] sm:text-base"
							>
								Hello,
								<strong class="font-semibold text-white">{data.user.name}</strong>
								—<br />
								here is your Island Beer Club home base.
							</p>
						</div>
					</div>
					<div class="pt-1">
						<Button
							href="/settings"
							variant="outline"
							size="lg"
							class="rounded-full border-amber-200/35 bg-black/40 px-6 text-amber-100/95 shadow-sm backdrop-blur-[2px] hover:bg-black/55 hover:text-amber-50"
						>
							<User class="size-4 opacity-90" aria-hidden="true" />
							View Member Profile
						</Button>
					</div>
				</div>
			</div>
			{#if data.user.role === "admin"}
				<div class="grid min-w-0 grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-1 lg:gap-8">
					<Card.Root
						class=" min-w-0 gap-3 rounded-xl border py-4 shadow-sm sm:gap-6 sm:rounded-2xl sm:py-6"
					>
						<Card.Header class="px-3 pb-2 sm:px-6">
							<div class="flex items-center gap-1.5 sm:gap-2">
								<span
									class="bg-secondary/80 text-secondary-foreground flex size-7 shrink-0 items-center justify-center rounded-md sm:size-8 sm:rounded-lg"
								>
									<TrendingUp class="size-3.5 sm:size-4" />
								</span>
								<Card.Title class="text-sm font-semibold sm:text-base">Engagement</Card.Title>
							</div>
							<Card.Description class="text-[0.65rem] leading-snug sm:text-sm sm:leading-normal">
								Members with numbers vs total roster
							</Card.Description>
						</Card.Header>
						<Card.Content class="px-3 sm:px-6">
							<p class="text-foreground text-2xl font-bold tabular-nums sm:text-4xl">
								{engagementPct}%
							</p>
							<p
								class="text-muted-foreground mt-1.5 line-clamp-3 text-[0.65rem] leading-snug sm:mt-2 sm:text-xs sm:leading-relaxed"
							>
								Higher means more of the club is fully onboarded with member numbers.
							</p>
						</Card.Content>
					</Card.Root>
					<Card.Root
						class=" min-w-0 gap-3 rounded-xl border py-4 shadow-sm sm:gap-6 sm:rounded-2xl sm:py-6"
					>
						<Card.Header class="px-3 pb-2 sm:px-6">
							<div class="flex items-center gap-1.5 sm:gap-2">
								<span
									class="bg-secondary/80 text-secondary-foreground flex size-7 shrink-0 items-center justify-center rounded-md sm:size-8 sm:rounded-lg"
								>
									<Sparkles class="size-3.5 sm:size-4" />
								</span>
								<Card.Title class="text-sm font-semibold sm:text-base">Season pace</Card.Title>
							</div>
							<Card.Description class="text-[0.65rem] leading-snug sm:text-sm sm:leading-normal">
								Events and kegs in the data snapshot
							</Card.Description>
						</Card.Header>
						<Card.Content class="px-3 sm:px-6">
							<p
								class="text-muted-foreground line-clamp-4 text-[0.62rem] leading-snug sm:line-clamp-none sm:text-sm sm:leading-relaxed"
							>
								<span class="text-foreground font-semibold tabular-nums sm:font-bold"
									>{data.clubStats.eventsThisYear}</span
								>
								events this year ·
								<span class="text-foreground font-semibold tabular-nums sm:font-bold"
									>{data.clubStats.kegsConsumed}</span
								> kegs recorded — keep the island pouring.
							</p>
						</Card.Content>
					</Card.Root>
				</div>
			{/if}

			{#if data.memberRollout?.showCard}
				<div class="col-span-1 min-w-0 lg:col-span-3" aria-labelledby="member-rollout-heading">
					<Card.Root class="bg-card rounded-2xl border border-emerald-500/25 shadow-sm">
						<Card.Header class="gap-1 px-4 pb-2 sm:px-6">
							<div class="flex flex-wrap items-center gap-2">
								<span
									class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
								>
									<Mail class="size-4" aria-hidden="true" />
								</span>
								<Card.Title id="member-rollout-heading" class="text-base font-semibold sm:text-lg">
									Existing member rollout
								</Card.Title>
							</div>
							<Card.Description class="text-sm">
								Onboard <strong class="text-foreground font-medium">current members</strong> who
								already have a member number onto this website. Separate from
								<strong class="text-foreground font-medium">Prospect</strong> invitation links.
							</Card.Description>
						</Card.Header>
						<Card.Content class="space-y-4 px-4 sm:px-6">
							{#if !data.memberRollout.eligibleInviter}
								<Alert.Root>
									<Alert.Description>
										After your <strong>first website login</strong> (or use an admin account), you can
										send rollout activation emails. This keeps the chain to members who are already on
										the site.
									</Alert.Description>
								</Alert.Root>
							{:else if !data.memberRollout.resendConfigured}
								<Alert.Root variant="destructive">
									<Alert.Description>
										Configure <code class="text-xs">RESEND_API_KEY</code> and
										<code class="text-xs">RESEND_FROM_EMAIL</code> to email activation links.
									</Alert.Description>
								</Alert.Root>
							{:else}
								<div
									class="text-muted-foreground flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm"
								>
									<span>
										Member rollout sends this period:
										<strong class="text-foreground"
											>{data.memberRollout.usedInWindow} / {data.memberRollout.maxPerWindow}</strong
										>
										sent ·
										<strong class="text-foreground">{data.memberRollout.remaining}</strong> remaining
									</span>
									<span class="text-xs">
										(Rolling {data.memberRollout.windowDays}-day window · only member rollout emails
										count · Prospect invites use their own limits.)
									</span>
								</div>
								{#if data.memberRollout.remaining === 0 && data.memberRollout.nextSlotAt}
									<p class="text-sm text-amber-700 dark:text-amber-400/90">
										Limit reached. Next rollout send available after {formatDate(
											new Date(data.memberRollout.nextSlotAt)
										)}.
									</p>
								{/if}

								<div class="space-y-2">
									<Label for="member-rollout-search">Find member (name, email, or #)</Label>
									<Input
										id="member-rollout-search"
										type="search"
										autocomplete="off"
										placeholder="Start typing… (min. 2 characters)"
										bind:value={memberRolloutQuery}
										oninput={() => scheduleMemberRolloutSearch(memberRolloutQuery)}
										disabled={data.memberRollout.remaining === 0}
										class="max-w-xl"
									/>
								</div>

								{#if memberRolloutSearchLoading}
									<p class="text-muted-foreground text-sm">Searching…</p>
								{:else if memberRolloutQuery.trim().length >= 2 && memberRolloutResults.length === 0}
									<p class="text-muted-foreground text-sm">No eligible members match.</p>
								{:else if memberRolloutResults.length > 0}
									<ul class="divide-border max-w-2xl divide-y rounded-lg border">
										{#each memberRolloutResults as m (m.id)}
											<li
												class="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
											>
												<div class="min-w-0">
													<p class="text-foreground truncate font-medium">{m.name}</p>
													<p class="text-muted-foreground truncate text-sm">
														#{m.mbr} · {m.email}
													</p>
												</div>
												<Button
													type="button"
													size="sm"
													variant="secondary"
													disabled={data.memberRollout.remaining === 0 ||
														!data.memberRollout.canSend ||
														!data.memberRollout.resendConfigured}
													class="shrink-0"
													onclick={() => {
														memberRolloutTarget = m;
														memberRolloutConfirmOpen = true;
													}}
												>
													<Mail class="mr-1.5 size-3.5" aria-hidden="true" />
													Send activation
												</Button>
											</li>
										{/each}
									</ul>
								{/if}
							{/if}
						</Card.Content>
					</Card.Root>

					<Dialog.Root bind:open={memberRolloutConfirmOpen}>
						<Dialog.Content class="sm:max-w-md">
							<Dialog.Header>
								<Dialog.Title>Send activation email?</Dialog.Title>
								<Dialog.Description class="space-y-3 text-left">
									{#if memberRolloutTarget}
										<span>
											Send a website activation link to <strong class="text-foreground"
												>{memberRolloutTarget.name}</strong
											>
											({memberRolloutTarget.email}).
										</span>
									{/if}
									<span class="block">
										Member rollout limit: <strong class="text-foreground"
											>{data.memberRollout?.remaining ?? 0}</strong
										>
										send{data.memberRollout?.remaining === 1 ? "" : "s"} left in your rolling
										<strong class="text-foreground"
											>{data.memberRollout?.windowDays ?? 4}-day</strong
										>
										window (only rollout emails count toward this limit).
									</span>
								</Dialog.Description>
							</Dialog.Header>
							<form
								method="post"
								action="?/sendMemberRolloutActivation"
								use:enhance={() => {
									memberRolloutSending = true;
									return async ({ result, update }) => {
										await update();
										memberRolloutSending = false;
										if (result.type === "success") {
											memberRolloutConfirmOpen = false;
											memberRolloutTarget = null;
											memberRolloutQuery = "";
											memberRolloutResults = [];
											toast.success("Rollout activation email sent.");
										} else if (result.type === "failure") {
											const msg = result.data?.message;
											toast.error(typeof msg === "string" ? msg : "Could not send email.");
										}
									};
								}}
								class="flex flex-col gap-4"
							>
								<input type="hidden" name="targetUserId" value={memberRolloutTarget?.id ?? ""} />
								<Dialog.Footer class="gap-2 sm:justify-end">
									<Button
										type="button"
										variant="outline"
										disabled={memberRolloutSending}
										onclick={() => {
											memberRolloutConfirmOpen = false;
											memberRolloutTarget = null;
										}}>Cancel</Button
									>
									<Button type="submit" disabled={memberRolloutSending || !memberRolloutTarget}>
										{#if memberRolloutSending}
											<Loader2 class="mr-2 size-4 animate-spin" aria-hidden="true" />
											Sending…
										{:else}
											Confirm send
										{/if}
									</Button>
								</Dialog.Footer>
							</form>
						</Dialog.Content>
					</Dialog.Root>
				</div>
			{/if}

			{#if data.user.role === "admin" || showInvitationLinksCard}
				<div
					class="col-span-1 grid grid-cols-1 gap-8 lg:col-span-3 lg:items-stretch {data.user
						.role === 'admin' && showInvitationLinksCard
						? 'lg:grid-cols-[minmax(0,35fr)_minmax(0,65fr)]'
						: ''}"
					aria-label="Prospects and invitation links"
				>
					{#if data.user.role === "admin"}
						<Card.Root
							class="ibc-lounge-hero border-primary/15 relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border shadow-sm lg:h-full"
							aria-labelledby="pending-heading"
						>
							<div
								class="pointer-events-none absolute inset-0 z-0 bg-[url('/images/pending-members-hop-bg.png')] bg-cover bg-[position:right_bottom] bg-no-repeat opacity-[0.55] saturate-[1.05]"
								aria-hidden="true"
							></div>
							<div class={hubHeroScrimLrClass} aria-hidden="true"></div>
							<div class={hubHeroScrimTbClass} aria-hidden="true"></div>
							<div class="relative z-10 flex w-full min-w-0 flex-col gap-2 px-6">
								<div
									class="flex w-full min-w-0 flex-row flex-wrap items-center justify-between gap-x-3 gap-y-2"
								>
									<Card.Title
										id="pending-heading"
										class="dark:text-foreground flex min-w-0 items-center gap-2 text-lg font-semibold tracking-tight text-white drop-shadow-sm"
									>
										<UserPlusIcon class="dark:text-primary size-5 shrink-0 text-white" />
										Prospects
									</Card.Title>
									<Tooltip.Root>
										<Tooltip.Trigger>
											{#snippet child({ props })}
												<Button
													{...props}
													href="/dashboard/pending-members"
													size="sm"
													variant="default"
													aria-label="Manage Prospects"
													class={hubHeroActionBtnClass}
												>
													<ClipboardList class="size-4 shrink-0" aria-hidden="true" />
													<span class="text-xs font-semibold tracking-tight">Manage</span>
												</Button>
											{/snippet}
										</Tooltip.Trigger>
										<Tooltip.Content side="bottom" align="end" sideOffset={6}>
											<p>Manage Prospects</p>
										</Tooltip.Content>
									</Tooltip.Root>
								</div>
								<Card.Description
									class="dark:text-muted-foreground max-w-none leading-snug text-pretty text-white/88"
								>
									Prospects who passed the test but don’t have a member number yet. Manage them and
									assign member numbers.
								</Card.Description>
							</div>
							<Card.Content class="relative z-10 flex flex-1 flex-col gap-4 pt-0">
								<div>
									{#if pendingMembersCardLoading}
										<div class="space-y-3" aria-busy="true" aria-label="Loading Prospects">
											<Skeleton class="h-4 w-36" />
											<Skeleton class="h-4 w-full max-w-md" />
											<Skeleton class="h-4 w-full max-w-[13rem]" />
											<Skeleton class="h-3 w-40" />
										</div>
									{:else if (data.pendingMembersCount ?? 0) > 0}
										<p class="dark:text-muted-foreground text-sm text-white/82">
											<span class="dark:text-foreground font-semibold text-white tabular-nums"
												>{data.pendingMembersCount}</span
											>
											waiting for acceptance.
										</p>
										{#if data.pendingMembers && data.pendingMembers.length > 0}
											<ul class="mt-3 max-h-[7.5rem] space-y-1.5 overflow-hidden text-pretty">
												{#each data.pendingMembers as pending (pending.id)}
													<li class="truncate text-sm">
														<a
															href="/dashboard/pending-members#prospect-{pending.id}"
															class="dark:text-muted-foreground dark:hover:text-foreground text-white/88 underline-offset-2 transition-colors hover:text-white hover:underline"
														>
															{pending.name}
														</a>
													</li>
												{/each}
											</ul>
											{#if (data.pendingMembersCount ?? 0) > data.pendingMembers.length}
												<p class="dark:text-muted-foreground mt-2 text-xs text-white/72">
													+{(data.pendingMembersCount ?? 0) - data.pendingMembers.length} more on the
													full list.
												</p>
											{/if}
										{/if}
									{:else}
										<p class="dark:text-muted-foreground text-sm text-white/82">
											No Prospects right now.
										</p>
									{/if}
								</div>
							</Card.Content>
						</Card.Root>
					{/if}

					{#if showInvitationLinksCard}
						<Card.Root
							class=" border-primary/15 relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border shadow-sm lg:h-full"
							aria-labelledby="invites-heading"
						>
							<div
								class="pointer-events-none absolute inset-0 z-0 bg-[url('/images/invitation-barrels-bg.png')] bg-cover bg-[position:85%_center] bg-no-repeat opacity-[0.55] saturate-[1.05] dark:opacity-[0.64]"
								aria-hidden="true"
							></div>
							<div class={hubCardMidWashClass} aria-hidden="true"></div>
							<div class={hubHeroScrimLrClass} aria-hidden="true"></div>
							<div class={hubHeroScrimTbClass} aria-hidden="true"></div>
							<div class="relative z-10 flex w-full min-w-0 flex-col gap-3 px-6">
								<div
									class="flex w-full min-w-0 flex-row flex-wrap items-center justify-between gap-x-3 gap-y-2"
								>
									<Card.Title
										id="invites-heading"
										class="dark:text-foreground flex min-w-0 items-center gap-2 text-lg font-semibold tracking-tight text-white drop-shadow-sm"
									>
										<LinkIcon class="dark:text-primary size-5 shrink-0 text-white" />
										Invitation links
									</Card.Title>
									{#if canCreateInvites}
										<Button
											type="button"
											size="sm"
											variant="default"
											class={hubHeroActionBtnClass}
											aria-haspopup="dialog"
											aria-expanded={inviteCreateDialogOpen}
											onclick={() => {
												inviteCreateDialogOpen = true;
											}}
										>
											<Plus class="size-4 shrink-0" aria-hidden="true" />
											<span class="text-xs font-semibold tracking-tight">New invite</span>
										</Button>
									{/if}
								</div>
								{#if canCreateInvites}
									<Dialog.Root bind:open={inviteCreateDialogOpen}>
										<Dialog.Content class="sm:max-w-md">
											<Dialog.Header>
												<Dialog.Title>Create invitation</Dialog.Title>
												<Dialog.Description>
													The signup link is sent by email to the prospect. Add their email and a
													label for your records.
												</Dialog.Description>
											</Dialog.Header>
											<form
												method="post"
												action="?/createInvitation"
												use:enhance={() => {
													creating = true;
													return async ({ update, result }) => {
														await update({ reset: true });
														creating = false;
														if (result.type === "success") {
															inviteCreateDialogOpen = false;
															const d = result.data as
																| { invitation?: { token?: string } }
																| undefined;
															const t = d?.invitation?.token;
															if (t) {
																highlightInviteToken = t;
																setTimeout(() => {
																	highlightInviteToken = null;
																}, 12_000);
															}
															toast.success("Invite created and emailed.");
														} else if (result.type === "failure") {
															const msg = result.data?.message;
															inviteErrorMessage =
																typeof msg === "string"
																	? msg
																	: "Could not create an invitation link.";
															inviteErrorOpen = true;
														}
													};
												}}
												class="flex flex-col gap-4"
											>
												<div class="flex flex-col gap-2">
													<Label for="dialog-invite-name">Who is this invite for?</Label>
													<Input
														id="dialog-invite-name"
														name="inviteName"
														type="text"
														required
														maxlength={120}
														autocomplete="off"
														placeholder="e.g. Alex Kim"
														disabled={creating}
													/>
												</div>
												<div class="flex flex-col gap-2">
													<Label for="dialog-invite-email">Prospect email</Label>
													<Input
														id="dialog-invite-email"
														name="recipientEmail"
														type="email"
														required
														autocomplete="email"
														placeholder="alex@example.com"
														disabled={creating}
													/>
												</div>
												<Dialog.Footer>
													<Button
														type="button"
														variant="outline"
														disabled={creating}
														onclick={() => {
															inviteCreateDialogOpen = false;
														}}
													>
														Cancel
													</Button>
													<Button type="submit" disabled={creating} class="gap-1.5">
														{#if creating}
															<Loader2 class="size-4 shrink-0 animate-spin" aria-hidden="true" />
															<span>Generating…</span>
														{:else}
															<span>Create &amp; send</span>
														{/if}
													</Button>
												</Dialog.Footer>
											</form>
										</Dialog.Content>
									</Dialog.Root>
								{/if}
								<Card.Description
									class="dark:text-muted-foreground max-w-none leading-snug text-pretty text-white/88"
								>
									Each invite emails a one-time signup link to the prospect. Use the mail icon on a
									row to resend or reach a different address — copy is still available as a backup.
								</Card.Description>
							</div>
							<Card.Content class="relative z-10 flex flex-1 flex-col p-2 md:p-6">
								<AlertDialog.Root bind:open={inviteErrorOpen}>
									<AlertDialog.Portal>
										<AlertDialog.Overlay
											class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/60"
										/>
										<AlertDialog.Content
											class="bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-md"
										>
											<div class="flex flex-col gap-2">
												<AlertDialog.Title class="text-lg font-semibold tracking-tight">
													Couldn’t create invite
												</AlertDialog.Title>
												<AlertDialog.Description class="text-muted-foreground text-sm">
													{inviteErrorMessage}
												</AlertDialog.Description>
											</div>
											<div class="flex justify-end pt-2">
												<AlertDialog.Cancel
													class="ring-offset-background focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium shadow-sm transition-[color,box-shadow] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
												>
													OK
												</AlertDialog.Cancel>
											</div>
										</AlertDialog.Content>
									</AlertDialog.Portal>
								</AlertDialog.Root>

								<div class="space-y-4">
									{#if isProspectOnboarding && data.prospectGate && !data.prospectGate.canTakeTestNow}
										<Alert.Root class="mb-4" variant="destructive">
											<ClockIcon class="size-4" />
											<Alert.Title>Three meeting dates required first</Alert.Title>
											<Alert.Description>
												Log all three beer club meetings on your dashboard before the IBC test
												unlocks.
											</Alert.Description>
										</Alert.Root>
										<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
											<p class="dark:text-muted-foreground text-sm text-white/88">
												You have {data.prospectGate.meetingCount} of {data.prospectGate
													.meetingsRequired} meetings saved. Add the remaining {meetingsRemaining} on
												this dashboard to continue.
											</p>
											<Button
												class="shrink-0 shadow-md"
												type="button"
												onclick={() => (prospectProgressDialogOpen = true)}
											>
												View progress
											</Button>
										</div>
									{:else if data.user && requiresIbcTest(data.user)}
										<Alert.Root class="mb-4" variant="destructive">
											<ClockIcon class="size-4" />
											<Alert.Title>Test required</Alert.Title>
											<Alert.Description>
												You must pass the official IBC test before you can create invitation links.
											</Alert.Description>
										</Alert.Root>
										<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
											<p class="dark:text-muted-foreground text-sm text-white/88">
												Complete the IBC test to unlock invitations. An admin will review your
												profile after you pass the test.
											</p>
											<Button class="shrink-0 shadow-md">
												<a href="/test">Take test</a>
											</Button>
										</div>
									{:else if data.user?.role !== "admin" && (data.user?.role !== "member" || data.user?.mbr == null)}
										<Alert.Root class="mb-4" variant="default">
											<ClockIcon class="size-4" />
											<Alert.Title>Prospect acceptance required</Alert.Title>
											<Alert.Description>
												You must be accepted as a member and assigned a member number before
												creating invitation links.
											</Alert.Description>
										</Alert.Root>
										<p class="dark:text-muted-foreground text-sm text-white/88">
											{#if data.user.test_passed != null}
												You’ve passed the IBC test. An admin will review your profile and assign
												your member number when you’re accepted.
											{:else}
												An admin will assign your member number when your account is ready.
											{/if}
										</p>
									{:else}
										<div class="mt-6 space-y-3">
											<div
												class="flex flex-row flex-wrap items-center justify-between gap-x-3 gap-y-1"
											>
												<h4
													class="dark:text-foreground text-sm font-semibold text-white drop-shadow-sm"
												>
													Invites this year
												</h4>
												<a
													href="/dashboard/invitations"
													class="dark:text-primary text-xs font-semibold text-amber-200/95 underline-offset-4 hover:underline"
												>
													View all
												</a>
											</div>
											{#if visibleInvitations.length > 0}
												<ul class="@container/invite-widget flex min-w-0 flex-col" role="list">
													{#each visibleInvitations as invitation (invitation.token)}
														<InvitationRow
															{invitation}
															baseUrl={data.baseUrl}
															resendInviteConfigured={data.resendInviteConfigured}
															isHighlighted={invitation.token === highlightInviteToken}
															{inviteCopyBtnClass}
															{inviteRowHighlightClass}
															{inviteRowIdleClass}
															{inviteRowShellClass}
														/>
													{/each}
												</ul>
											{:else}
												<p class="dark:text-muted-foreground text-sm text-white/78">
													No invites from {data.invitationYear} yet.
												</p>
											{/if}
										</div>
									{/if}
								</div>
							</Card.Content>
						</Card.Root>
					{/if}
				</div>
			{/if}
		</section>
	{/if}

	{#if isProspectOnboarding && data.prospectGate}
		<Dialog.Root bind:open={prospectProgressDialogOpen}>
			<Dialog.Content class="w-[min(100vw-2rem,40rem)] sm:max-w-2xl">
				<Dialog.Header>
					<Dialog.Title>Prospect progress</Dialog.Title>
					<Dialog.Description>
						Attend and log three beer club meetings to unlock the IBC test and member-only tools.
					</Dialog.Description>
				</Dialog.Header>
				<div class="space-y-4 md:space-y-5">
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-5">
						{#each [1, 2, 3] as slot (slot)}
							<button
								type="button"
								class="hover:bg-muted/50 focus-visible:ring-ring min-h-[4.75rem] rounded-xl border p-4 text-center transition-colors focus-visible:ring-2 focus-visible:outline-none sm:min-h-0 md:p-5"
								onclick={() => jumpToMeetingSlot(slot)}
							>
								<div class="mb-2 flex justify-center">
									{#if slot <= data.prospectGate.meetingCount}
										<div
											class="flex size-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
										>
											<CheckIcon class="size-4" />
										</div>
									{:else}
										<div
											class="bg-muted text-muted-foreground flex size-8 items-center justify-center rounded-full"
										>
											<ClockIcon class="size-4" />
										</div>
									{/if}
								</div>
								<p class="text-sm font-medium">Meeting {slot}</p>
								<p class="text-muted-foreground mt-1 text-xs">
									{data.prospectGate.meetingDates[slot - 1] || "Not saved yet"}
								</p>
							</button>
						{/each}
					</div>
					<p class="text-muted-foreground text-sm">
						{#if data.prospectGate.canTakeTestNow}
							Nice — all three meetings are logged. You can take the IBC test now.
						{:else}
							You’re {meetingsRemaining} meeting{meetingsRemaining === 1 ? "" : "s"} away from unlocking
							the test.
						{/if}
					</p>
				</div>
				<Dialog.Footer>
					<Button
						type="button"
						variant="outline"
						onclick={() => (prospectProgressDialogOpen = false)}>Close</Button
					>
					{#if data.prospectGate.canTakeTestNow}
						<Button href="/test">Take test</Button>
					{/if}
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>

		<section id="prospect-progress" class="w-full min-w-0 space-y-6 md:space-y-8">
			<Card.Root
				class="border-primary/20 w-full min-w-0 overflow-hidden rounded-2xl border shadow-sm"
			>
				<Card.Header class="space-y-3 md:space-y-4">
					<div class="flex flex-wrap items-start justify-between gap-3">
						<div class="space-y-1">
							<Card.Title class="text-xl">Log your first 3 meetings</Card.Title>
							<Card.Description>
								Before you can take the IBC test or view exclusive member info, save the dates of
								the three beer club meetings you attended.
							</Card.Description>
						</div>
						<Badge variant="secondary" class="text-sm">
							{data.prospectGate.meetingCount}/{data.prospectGate.meetingsRequired} saved
						</Badge>
					</div>
					<Alert.Root variant={data.prospectGate.canTakeTestNow ? "default" : "destructive"}>
						<ClockIcon class="size-4" />
						<Alert.Title>
							{#if data.prospectGate.canTakeTestNow}
								Meetings complete — test unlocked
							{:else}
								Member directory and stats stay locked until all 3 meetings are saved
							{/if}
						</Alert.Title>
						<Alert.Description>
							{#if data.prospectGate.canTakeTestNow}
								You can head straight to the IBC test now.
							{:else}
								Save each meeting whenever you attend it — you do not need to fill all three at
								once.
							{/if}
						</Alert.Description>
					</Alert.Root>
				</Card.Header>
				<Card.Content class="space-y-6 sm:space-y-8 md:space-y-10">
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-5">
						{#each meetingSlots as meeting (meeting.slot)}
							<button
								type="button"
								class={`hover:bg-muted/60 min-h-[3.25rem] rounded-xl border px-4 py-3 text-left text-sm transition-colors sm:min-h-0 md:px-5 md:py-4 ${
									activeMeetingSlot === meeting.slot ? "border-primary bg-primary/5" : ""
								}`}
								onclick={() => (activeMeetingSlot = meeting.slot)}
							>
								<p class="font-medium">{meeting.label}</p>
								<p class="text-muted-foreground text-xs">
									{meeting.dirty ? "Not saved" : meeting.saved ? "Saved" : "Not saved"}
								</p>
							</button>
						{/each}
					</div>
					<div class="rounded-xl border p-4 md:p-6 lg:p-8">
						<div
							class="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between"
						>
							<div class="min-w-0">
								<h3 class="text-base font-medium md:text-lg">{activeMeeting.label}</h3>
								<p class="text-muted-foreground mt-1 text-xs sm:text-sm">
									Choose a date, then click Save date.
								</p>
							</div>
							{#if activeMeeting.saved && !activeMeeting.dirty}
								<Badge variant="secondary">Saved</Badge>
							{/if}
						</div>
						<form
							method="POST"
							action="?/saveProspectMeetingDate"
							use:enhance={enhanceProspectMeetingAction}
							class="space-y-3"
						>
							<input type="hidden" name="slot" value={activeMeeting.slot} />
							{#if activeMeeting.slot === 1}
								<DatePickerField
									id="meeting-1-date"
									name="meetingDate"
									bind:value={meeting1Date}
									maxValue={offsetDateString(meeting2Date, -7)}
									isDateDisabled={disableIfNotWednesdayUtc}
								/>
							{:else if activeMeeting.slot === 2}
								<DatePickerField
									id="meeting-2-date"
									name="meetingDate"
									bind:value={meeting2Date}
									minValue={offsetDateString(meeting1Date, 7)}
									maxValue={offsetDateString(meeting3Date, -7)}
									isDateDisabled={disableIfNotWednesdayUtc}
								/>
							{:else}
								<DatePickerField
									id="meeting-3-date"
									name="meetingDate"
									bind:value={meeting3Date}
									minValue={offsetDateString(meeting2Date, 7)}
									isDateDisabled={disableIfNotWednesdayUtc}
								/>
							{/if}
							<div class="flex flex-wrap gap-2">
								<Button type="submit" size="sm">Save date</Button>
								{#if isMeetingSaved(activeMeeting.slot)}
									<button
										class="text-muted-foreground hover:text-foreground text-sm"
										type="submit"
										formaction="?/clearProspectMeetingDate"
										formmethod="POST"
									>
										Clear
									</button>
								{/if}
							</div>
						</form>
					</div>
					<div class="flex flex-wrap items-center gap-3">
						<Button
							type="button"
							variant="outline"
							onclick={() => (prospectProgressDialogOpen = true)}
						>
							View progress
						</Button>
						{#if data.prospectGate.canTakeTestNow}
							<Button href="/test">Take the IBC test</Button>
						{/if}
					</div>
				</Card.Content>
			</Card.Root>
		</section>
	{/if}

	{#if data.user && canAccessExclusiveFeatures}
		<div
			class="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] lg:items-stretch"
			aria-label="Upcoming events and quick actions"
		>
			<!-- Upcoming events -->
			<section class="min-w-0 lg:flex lg:flex-col" aria-labelledby="tables-heading">
				<Card.Root
					class="ibc-lounge-hero  border-primary/15 relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border shadow-sm lg:h-full"
				>
					<div
						class="pointer-events-none absolute inset-0 z-0 bg-[url('/images/upcoming-events-bg.png')] bg-cover bg-[position:center_28%] bg-no-repeat opacity-[0.55] saturate-[1.05] dark:opacity-[0.58]"
						aria-hidden="true"
					></div>
					<div class={hubCardMidWashClass} aria-hidden="true"></div>
					<div class={hubHeroScrimLrClass} aria-hidden="true"></div>
					<div class={hubHeroScrimTbClass} aria-hidden="true"></div>
					<div class="relative z-10 flex w-full min-w-0 flex-col gap-3 px-6">
						<div
							class="flex w-full min-w-0 flex-row flex-wrap items-center justify-between gap-x-3 gap-y-2"
						>
							<Card.Title
								id="tables-heading"
								class="dark:text-foreground flex min-w-0 items-center gap-2 text-lg font-semibold tracking-tight text-white drop-shadow-sm"
							>
								<Calendar class="dark:text-primary size-5 shrink-0 text-white" />
								Upcoming events
							</Card.Title>
							<a
								href="/dashboard/events"
								class="dark:text-primary text-xs font-semibold text-amber-200/95 underline-offset-4 hover:underline"
							>
								View all
							</a>
						</div>
						<Card.Description
							class="dark:text-muted-foreground max-w-none leading-snug text-pretty text-white/88"
						>
							Next on the club calendar
						</Card.Description>
					</div>
					<Card.Content class="relative z-10 flex flex-1 flex-col p-2 md:p-6">
						{#if data.upcomingEvents.length === 0}
							<p class="dark:text-muted-foreground text-sm text-white/78">
								No upcoming published events.
							</p>
						{:else}
							<ul
								class="flex flex-col overflow-hidden"
								role="list"
								aria-label="Upcoming events: title, date, description or location, and access"
							>
								{#each data.upcomingEvents as ev (ev.id)}
									<li class="{inviteRowShellClass} list-none p-0">
										<div class="{upcomingEventsRowGridClass} {inviteRowIdleClass}">
											<div
												class="dark:text-foreground min-w-0 px-3 py-2 text-xs font-medium text-white/92 sm:px-4"
											>
												<a
													href="/dashboard/events"
													class="dark:hover:text-primary block truncate transition-colors hover:text-white/95"
												>
													{ev.title}
												</a>
											</div>
											<div
												class="dark:text-muted-foreground flex w-full min-w-0 items-center justify-center px-2 py-2 text-xs text-white/88 tabular-nums sm:px-3"
											>
												<span class="block w-full truncate text-center">
													{ev.event_date ? formatDate(new Date(ev.event_date)) : "—"}
												</span>
											</div>
											<div
												class="dark:text-muted-foreground hidden min-w-0 px-3 py-2 text-xs text-white/85 sm:block sm:px-4"
											>
												<span class="block truncate">
													{ev.description?.trim() || ev.location?.trim() || "—"}
												</span>
											</div>
											<div class="flex min-h-10 items-center justify-center px-2 py-2 sm:px-3">
												{#if ev.members_only}
													<Badge
														variant="secondary"
														class="w-full max-w-[5.25rem] justify-center rounded-sm px-2 py-0.5 text-center text-[10px] whitespace-nowrap"
													>
														Members
													</Badge>
												{:else}
													<Badge
														variant="outline"
														class="dark:border-border dark:text-foreground w-full max-w-[5.25rem] justify-center rounded-sm border-white/40 bg-black/15 px-2 py-0.5 text-center text-[10px] whitespace-nowrap text-white/90 dark:bg-transparent"
													>
														Public
													</Badge>
												{/if}
											</div>
										</div>
									</li>
								{/each}
							</ul>
						{/if}
					</Card.Content>
				</Card.Root>
			</section>

			<!-- Quick actions -->
			<section class="min-w-0 lg:flex lg:flex-col" aria-labelledby="actions-heading">
				<Card.Root
					class=" from-sidebar/25 to-card flex min-h-0 min-w-0 flex-1 flex-col rounded-2xl border bg-gradient-to-br shadow-sm lg:h-full"
					aria-labelledby="actions-heading"
				>
					<Card.Header class="flex flex-row items-center gap-3 pb-2">
						<div
							class="border-primary/45 bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-xl border shadow-sm"
							aria-hidden="true"
						>
							<LayoutGrid class="text-primary size-5" />
						</div>
						<div class="min-w-0">
							<Card.Title
								id="actions-heading"
								class="text-foreground text-lg font-semibold tracking-tight"
							>
								Quick actions
							</Card.Title>
							<Card.Description class="text-muted-foreground text-sm leading-snug">
								Shortcuts to common member tools
							</Card.Description>
						</div>
					</Card.Header>
					<Card.Content class="flex flex-1 flex-col gap-2">
						<QuickActionLink href="/dashboard/members">
							<BookUser class="text-primary size-[1.15rem] shrink-0" />
							{data.user.role === "admin" ? "Manage members" : "Member directory"}
						</QuickActionLink>
						{#if data.user.role === "admin"}
							<QuickActionLink href="/admin/events">
								<CalendarDays class="text-primary size-[1.15rem] shrink-0" />
								Manage events
							</QuickActionLink>
							<QuickActionLink href="/admin/stats/beer-consumed" class="whitespace-normal">
								<Beer class="text-primary size-[1.15rem] shrink-0" />
								<span class="min-w-0 text-left leading-snug">
									<span class="sm:hidden">Beer consumed</span>
									<span class="hidden sm:inline">Manage Beer Consumed</span>
								</span>
							</QuickActionLink>
							<QuickActionLink href="/admin/stats/keg-credits">
								<Package class="text-primary size-[1.15rem] shrink-0" />
								Manage Keg Credits
							</QuickActionLink>
						{:else}
							<QuickActionLink href="/dashboard/stats" class="whitespace-normal">
								<BarChart3 class="text-primary size-[1.15rem] shrink-0" />
								<span class="min-w-0 text-left leading-snug">Keg &amp; beer stats</span>
							</QuickActionLink>
							<QuickActionLink href="/dashboard/events">
								<CalendarRange class="text-primary size-[1.15rem] shrink-0" />
								View events
							</QuickActionLink>
						{/if}
					</Card.Content>
				</Card.Root>
			</section>
		</div>
	{/if}
</div>
