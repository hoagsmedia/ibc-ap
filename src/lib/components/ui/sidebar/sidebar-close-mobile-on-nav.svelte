<script lang="ts">
	import { page } from "$app/state";
	import { useSidebar } from "./context.svelte.js";

	const sidebar = useSidebar();

	$effect(() => {
		if (page.url.pathname.length >= 0) {
			sidebar.setOpenMobile(false);
		}
	});
</script>
