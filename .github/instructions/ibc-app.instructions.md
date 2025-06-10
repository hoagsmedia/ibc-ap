---
applyTo: '**'
---

# 🧭 GitHub Copilot Instructions — Island Beer Club Project

## 🎯 Project Overview

This repository contains the codebase for **Island Beer Club**, a modern redesign of a legacy website. The new system consists of:

- A **public-facing site** for members and visitors.
- An **admin dashboard** for managing events, content, and user data.

This project replaces a static Web 1.0 HTML site with a fully dynamic, type-safe, modern web application.
Here is the old website for reference: [Island Beer Club](https://islandbeerclub.com/).

---

## 🧠 AI Assistant Role

You are acting as a **senior full-stack Svelte developer** with modern web best practices. Your role is to provide **correct, minimal, and production-grade code**. Your output should be readable, maintainable, and idiomatic to the tools listed below.

---

## 🛠️ Tech Stack

Please write code using the following technologies and tools:

- **Svelte 5** with Runes (`$state`, `$derived`, etc.)
- **SvelteKit 2**
- **Tailwind CSS** (`^4.0`) — minimal, semantic utility classes
- **Shadcn-Svelte** — for accessible UI components
- **Drizzle ORM** — typed PostgreSQL access layer
- **Lucia Auth** — for secure session-based authentication
- **SvelteKit Superforms** — server-first form handling and validation
- **Zod** — schema-based validation for form inputs and backend logic
- **TypeScript** — strict and clean
- **Vitest** — for unit testing

---

## 🔍 Guidelines for Code Suggestions

- Always use **Svelte 5 Runes** — never legacy `$:` reactivity.
- Tailwind CSS should be **concise** and **semantic**. Avoid excessive class stacking.
- Prefer **server-first** patterns where possible (e.g., form actions over client fetch).
- Drizzle ORM: use `pg` for queries; enforce schema typing.
- Authentication: default to `Lucia` unless otherwise stated.
- Component libraries: use `shadcn-svelte` for inputs, dialogs, modals, etc.
- Avoid deprecated or unstable APIs.
- Always generate **valid**, **typed**, and **runnable** code.

---

## 💡 Copilot Behavior

- Assume this is a **multi-user production app**.
- Avoid hardcoded secrets, tokens, or unsafe operations.
- Minimize unnecessary re-renders and side effects.
- For complex logic, prefer splitting into helper functions or utilities.
- When in doubt, **ask before assuming**.

---

## 🧪 Testing

- Use **Vitest** for unit tests.
- Always return typed test expectations.
- When creating testable logic (utils, helpers), write test stubs in parallel.

---

## 🧼 Style & Formatting

- Use `prettier`, `eslint`, and `typescript-eslint` to conform to formatting.
- Keep all files **lean and modular**.
- Component naming should match their file names and be PascalCase.

---

## 📎 File & Directory Structure

Match standard SvelteKit 2 conventions:

- `src/routes/`: page components and endpoints
- `src/lib/`: reusable components, logic, and utilities
- `src/lib/server/`: server-only files (e.g., database, auth)
- `src/params/`: custom route matchers
- `static/`: public assets
- `tests/`: all vitest files

---

## 🎨 Theming

- Use CSS Variables to customize the look and feel of your application.
- Do not modify the default css variables in the :root and .dark selectors.
- Use the provided CSS variables for background and foreground colors to ensure consistency across components.
- Use the `bg-` and `text-` prefixes for background and text colors, respectively.
- The new `size-*` utility (added in Tailwind v3.4), is now fully supported by tailwind-merge. You can replace `w-* h-*` with the new `size-*` utility:

- We use CSS variables for styling. This allows you to easily change the colors of components without having to update class names.

### Convention

- We use a simple background and foreground convention for colors. The background variable is used for the background color of the component and the foreground variable is used for the text color.

- The background suffix is omitted when the variable is used for the background color of the component.

- Given the following CSS variables:

```css
--primary: oklch(0.205 0 0);
--primary-foreground: oklch(0.985 0 0);
```

- The background color of the following component will be var(--primary) and the foreground color will be var(--primary-foreground).

```HTML
<div class="bg-primary text-primary-foreground">Hello</div>
```

## 🛑 What _Not_ To Do

- Don’t use `$:` or auto-subscription to stores
- Don’t use inline styles unless absolutely required
- Don’t import libraries not in the dependencies
- Don’t hallucinate component APIs from `shadcn-svelte` or `lucia`
- Don’t generate outdated syntax (e.g., `export let` for props in Svelte 5)

---

## ✅ Example Prompt (Recommended Style)

```svelte
<!-- +page.svelte -->
<script lang="ts">
	let count = $state(0);
</script>

<button on:click={() => count++} class="btn-primary">Clicks: {count}</button>
```
