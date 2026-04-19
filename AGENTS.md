# Agent / AI assistant notes

## Stack

- **Svelte 5** runes (`$props`, `$state`, `$derived`, `$effect`, etc.) — see `package.json` (`svelte` ^5).
- **SvelteKit 2** — `@sveltejs/kit`, `@sveltejs/vite-plugin-svelte` ^5.
- **shadcn-svelte** — initialized via `components.json` (registry `https://shadcn-svelte.com/registry`). UI lives under `$lib/components/ui`. Global styles and theme tokens: `src/app.css` (imported from `src/routes/+layout.svelte`). Add or update components with `pnpm dlx shadcn-svelte@latest add <name>` per [shadcn-svelte installation (SvelteKit)](https://www.shadcn-svelte.com/docs/installation/sveltekit).

## Svelte MCP (Model Context Protocol)

This project is intended to be used with the **official Svelte MCP server** so assistants get Svelte 5 / SvelteKit docs and the **svelte-autofixer** tool.

### Cursor setup

1. Command palette → **View: Open MCP Settings** → **Add custom MCP**, **or** merge into your MCP config:

```json
{
	"mcpServers": {
		"svelte": {
			"command": "npx",
			"args": ["-y", "@sveltejs/mcp"]
		}
	}
}
```

2. See [Svelte AI overview — Setup](https://svelte.dev/docs/ai/overview#Setup) and [local setup](https://svelte.dev/docs/ai/local-setup). You can also run `npx sv add mcp` in a SvelteKit app for interactive setup.

### Using the MCP tools (prompt for assistants)

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available Svelte MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.

Optional: use the [svelte-task](https://svelte.dev/docs/ai/prompts#svelte-task) prompt for task-focused workflows.
