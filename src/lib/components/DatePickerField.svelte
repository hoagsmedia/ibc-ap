<script lang="ts">
	import { Calendar } from "$lib/components/ui/calendar/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
	import { CalendarDate } from "@internationalized/date";
	import type { DateValue } from "@internationalized/date";
	import { cn } from "$lib/utils.js";

	let {
		id,
		name,
		value = $bindable(""),
		placeholder = "Select date",
		disabled = false,
		minValue,
		maxValue,
		isDateDisabled,
		isDateUnavailable,
		"aria-invalid": ariaInvalid,
		class: className
	}: {
		id: string;
		name: string;
		value: string;
		placeholder?: string;
		disabled?: boolean;
		minValue?: string;
		maxValue?: string;
		/** Prefer this for “cannot select” days; Bits maps it to `data-disabled`. */
		isDateDisabled?: (date: DateValue) => boolean;
		/** Use for “unavailable” semantics (e.g. booked); Bits maps to `data-unavailable` (line-through in default styles). */
		isDateUnavailable?: (date: DateValue) => boolean;
		"aria-invalid"?: boolean | "true" | "false";
		class?: string;
	} = $props();

	function pad(n: number) {
		return String(n).padStart(2, "0");
	}

	function parseDateOnly(s: string | undefined): CalendarDate | undefined {
		if (!s?.trim()) return undefined;
		const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
		if (!m) return undefined;
		const year = Number(m[1]);
		const month = Number(m[2]);
		const day = Number(m[3]);
		if ([year, month, day].some((x) => Number.isNaN(x))) return undefined;
		return new CalendarDate(year, month, day);
	}

	function composeDateOnly(d: CalendarDate | undefined): string {
		if (!d) return "";
		return `${d.year}-${pad(d.month)}-${pad(d.day)}`;
	}

	function formatDateOnlyLabel(s: string): string {
		if (!s?.trim()) return placeholder;
		const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
		if (!m) return placeholder;
		const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
		if (Number.isNaN(d.getTime())) return placeholder;
		return d.toLocaleDateString(undefined, {
			weekday: "short",
			month: "short",
			day: "numeric",
			year: "numeric"
		});
	}

	let dateValue = $state<CalendarDate | undefined>(parseDateOnly(value));
	let lastSyncedValue = $state(value);
	let open = $state(false);

	$effect(() => {
		void value;
		if (value === lastSyncedValue) return;
		lastSyncedValue = value;
		dateValue = parseDateOnly(value);
	});

	$effect(() => {
		void dateValue;
		const next = composeDateOnly(dateValue);
		if (next === value) return;
		value = next;
		lastSyncedValue = next;
	});
</script>

<input type="hidden" {id} {name} bind:value {disabled} />

<Popover.Root bind:open>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button
				{...props}
				type="button"
				variant="outline"
				{disabled}
				aria-invalid={ariaInvalid}
				class={cn(
					"h-8 w-full max-w-full min-w-0 justify-between gap-2 px-3 text-sm font-normal",
					!value && "text-muted-foreground",
					className
				)}
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
			minValue={parseDateOnly(minValue)}
			maxValue={parseDateOnly(maxValue)}
			{isDateDisabled}
			{isDateUnavailable}
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
