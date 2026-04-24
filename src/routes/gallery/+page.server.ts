import type { PageServerLoad } from './$types';
import fs from 'fs/promises';
import path from 'path';

type GalleryItem = {
	src: string;
	title: string;
	details: string;
	dateLabel: string | null;
};

function toTitleCase(value: string) {
	return value
		.split(/\s+/)
		.filter(Boolean)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ');
}

function normalizeName(file: string) {
	return file
		.replace(/\.[^.]+$/, '')
		.replace(/([a-z])([A-Z])/g, '$1 $2')
		.replace(/[_-]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function formatDateToken(token: string) {
	const compact = token.match(/^(\d{1,2})([A-Za-z]{3})(\d{2,4})$/);
	if (compact) {
		const [, day, month, year] = compact;
		const fullYear = year.length === 2 ? `20${year}` : year;
		return `${month} ${Number(day)}, ${fullYear}`;
	}

	return /^\d{4}$/.test(token) ? token : null;
}

function buildGalleryItem(file: string): GalleryItem {
	const normalized = normalizeName(file);
	const dateToken = normalized.match(/\b\d{1,2}[A-Za-z]{3}\d{2,4}\b|\b\d{4}\b/)?.[0] ?? null;
	const titleSource = dateToken ? normalized.replace(dateToken, '').trim() : normalized;
	const title = toTitleCase(titleSource || normalized);

	return {
		src: `/banner-travel/${file}`,
		title,
		details: 'Island Beer Club travel gallery',
		dateLabel: dateToken ? formatDateToken(dateToken) : null
	};
}

export const load: PageServerLoad = async () => {
	const dir = path.resolve('static/banner-travel');
	let files: string[] = [];

	try {
		files = (await fs.readdir(dir)).filter((f) => /\.(jpe?g)$/i.test(f));
	} catch {
		return { items: [], images: [] };
	}

	const items = files.map(buildGalleryItem);

	return {
		items,
		images: items.map((item) => item.src)
	};
};
