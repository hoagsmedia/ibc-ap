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

export const { createUploader, createUploadThing } = generateSvelteHelpers<OurFileRouter>();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
