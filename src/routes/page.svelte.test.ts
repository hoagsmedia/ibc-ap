import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import Page from './+page.svelte';

describe('Home page', () => {
	test('should render h1 elements', () => {
		render(Page);
		const h1Elements = screen.getAllByRole('heading', { level: 1 });
		expect(h1Elements).toHaveLength(2);
		expect(h1Elements[0]).toBeInTheDocument();
		expect(h1Elements[1]).toBeInTheDocument();
	});
});
