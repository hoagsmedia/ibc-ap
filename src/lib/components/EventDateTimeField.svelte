<script lang="ts">
	import { Calendar } from "$lib/components/ui/calendar/index.js";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
	import ClockIcon from "@lucide/svelte/icons/clock";
	import { CalendarDate } from "@internationalized/date";
	import { cn } from "$lib/utils.js";

	let {
		id,
		name,
		value = $bindable(""),
		"aria-invalid": ariaInvalid,
		class: className
	}: {
		id: string;
		name: string;
		value: string;
		"aria-invalid"?: boolean | "true" | "false";
		class?: string;
	} = $props();

	function pad(n: number) {
		return String(n).padStart(2, "0");
	}

	/**
	 * Parse `YYYY-MM-DDTHH:mm` as *local* wall time — do not use `new Date(string)` (UTC shift).
	 */
	function parseValue(s: string): { date: CalendarDate | undefined; time: string } {
		if (!s?.trim()) return { date: undefined, time: "12:00" };
		const m = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
		if (m) {
			const y = Number(m[1]);
			const mo = Number(m[2]);
			const d = Number(m[3]);
			const h = Number(m[4]);
			const mi = Number(m[5]);
			if ([y, mo, d, h, mi].some((x) => Number.isNaN(x))) {
				return { date: undefined, time: "12:00" };
			}
			return {
				date: new CalendarDate(y, mo, d),
				time: `${pad(h)}:${pad(mi)}`
			};
		}
		const dt = new Date(s);
		if (Number.isNaN(dt.getTime())) return { date: undefined, time: "12:00" };
		return {
			date: new CalendarDate(dt.getFullYear(), dt.getMonth() + 1, dt.getDate()),
			time: `${pad(dt.getHours())}:${pad(dt.getMinutes())}`
		};
	}

	function compose(d: CalendarDate | undefined, time: string): string {
		if (!d) return "";
		const t = time && /^\d{1,2}:\d{2}$/.test(time) ? time : "12:00";
		const [hh, mm] = t.split(":").map((x) => Number.parseInt(x, 10));
		const h = Number.isFinite(hh) ? pad(Math.min(23, Math.max(0, hh))) : "12";
		const m = Number.isFinite(mm) ? pad(Math.min(59, Math.max(0, mm))) : "00";
		return `${d.year}-${pad(d.month)}-${pad(d.day)}T${h}:${m}`;
	}

	function formatDateOnlyLabel(s: string): string {
		if (!s?.trim()) return "Select date";
		const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
		if (m) {
			const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
			return d.toLocaleDateString(undefined, {
				weekday: "short",
				month: "short",
				day: "numeric",
				year: "numeric"
			});
		}
		const d = new Date(s);
		if (Number.isNaN(d.getTime())) return "Select date";
		return d.toLocaleDateString(undefined, {
			weekday: "short",
			month: "short",
			day: "numeric",
			year: "numeric"
		});
	}

	const init = parseValue(value);
	let dateValue = $state<CalendarDate | undefined>(init.date);
	let timeValue = $state(init.time);

	/** Tracks `value` we last wrote or accepted — avoids sync loops with the calendar. */
	let lastSyncedValue = $state(value);

	let open = $state(false);

	const timeFieldId = $derived(`${id}-time`);

	/** Parent / form changed `value` (navigation, reset) — refresh local date & time. */
	$effect(() => {
		void value;
		if (value === lastSyncedValue) return;
		lastSyncedValue = value;
		const p = parseValue(value);
		dateValue = p.date;
		timeValue = p.time;
	});

	/** User changed date in calendar or time in field — push to bound `value`. */
	$effect(() => {
		void dateValue;
		void timeValue;
		const next = compose(dateValue, timeValue);
		if (next === value) return;
		value = next;
		lastSyncedValue = next;
	});
</script>

<div
	class={cn(
		"grid w-full min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(8.5rem,10rem)] sm:items-end",
		className
	)}
>
	<input type="hidden" {name} {value} />

	<div class="min-w-0 space-y-2">
		<label class="text-muted-foreground text-xs font-medium" for={id}>Date</label>
		<Popover.Root bind:open>
			<Popover.Trigger {id}>
				{#snippet child({ props })}
					<Button
						{...props}
						type="button"
						variant="outline"
						aria-invalid={ariaInvalid}
						class="h-10 w-full min-w-0 justify-between gap-2 font-normal"
					>
						<span class="truncate text-left">{formatDateOnlyLabel(value)}</span>
						<ChevronDownIcon class="size-4 shrink-0 opacity-60" />
					</Button>
				{/snippet}
			</Popover.Trigger>
			<Popover.Content class="w-auto max-w-[min(100vw-2rem,22rem)] overflow-hidden p-0" align="start">
				<Calendar
					type="single"
					bind:value={dateValue}
					captionLayout="dropdown"
					class="rounded-none border-0 shadow-none"
				/>
				<div class="border-border flex justify-end border-t p-2">
					<Button
						type="button"
						variant="secondary"
						size="sm"
						class="w-full sm:w-auto"
						onclick={() => (open = false)}
					>
						Done
					</Button>
				</div>
			</Popover.Content>
		</Popover.Root>
	</div>

	<div class="min-w-0 space-y-2">
		<label class="text-muted-foreground text-xs font-medium" for={timeFieldId}>Time</label>
		<div class="relative">
			<ClockIcon
				class="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
				aria-hidden="true"
			/>
			<Input
				id={timeFieldId}
				type="time"
				step="60"
				bind:value={timeValue}
				class="h-10 bg-background pl-9"
				aria-invalid={ariaInvalid}
			/>
		</div>
	</div>
</div>
