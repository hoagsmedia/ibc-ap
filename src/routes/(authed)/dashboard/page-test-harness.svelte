<script lang="ts">
	/** Test-only wrapper: supplies the Tooltip.Provider that the app layout normally provides. */
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";
	import Page from "./+page.svelte";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
</script>

<Tooltip.Provider>
	<Page {data} />
</Tooltip.Provider>
