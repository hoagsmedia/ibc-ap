<script lang="ts">
	import { page } from "$app/state";
	import { useSidebar } from "./context.svelte.js";

	const sidebar = useSidebar();

	$effect(() => {
		page.url.href;
		sidebar.setOpenMobile(false);
	});
</script>
