import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { OurFileRouter } from '$lib/server/uploadthing';
import { generateSvelteHelpers } from '@uploadthing/svelte';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// generate user itials from name
export function generateUsername(name: string): string {
	const parts = name.split(' ');
	if (parts.length === 0) return '';
	if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
	return `${parts[0].charAt(0).toUpperCase()}${parts[1].charAt(0).toUpperCase()}`;
}

export function formatDate(date: number | Date): string {
	const d = new Date(date);
	const day = String(d.getDate()).padStart(2, '0');
	const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase(); // "JAN", "FEB", etc.
	const year = String(d.getFullYear()).slice(-2); // last two digits
	return `${day}-${month}-${year}`;
}

export function formatDateTime(date: Date): string {
	const pad = (n: number) => String(n).padStart(2, '0');
	const day = pad(date.getDate());
	const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
	const year = String(date.getFullYear()).slice(-2);
	const hours = pad(date.getHours());
	const minutes = pad(date.getMinutes());
	const seconds = pad(date.getSeconds());

	return `${day}-${month}-${year}-${hours}:${minutes}:${seconds}`;
}

export const { createUploader, createUploadThing } = generateSvelteHelpers<OurFileRouter>();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
