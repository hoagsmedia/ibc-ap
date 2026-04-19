import { browser } from "$app/environment";

const WRITE_DEBOUNCE_MS = 250;

export class LocalStorage<T> {
	value = $state<T>();
	key = "";

	constructor(key: string, value: T) {
		this.key = key;
		this.value = value;
		if (browser) {
			const item = localStorage.getItem(key);
			if (item) this.value = this.deserialize(item);
		}

		$effect(() => {
			if (!browser || this.value === undefined) return;

			const key = this.key;
			const payload = this.serialize(this.value);
			const id = window.setTimeout(() => {
				try {
					localStorage.setItem(key, payload);
				} catch (e) {
					console.warn("[localStorage] write failed:", e);
				}
			}, WRITE_DEBOUNCE_MS);

			return () => window.clearTimeout(id);
		});
	}

	serialize(value: T): string {
		return JSON.stringify(value);
	}

	deserialize(value: string): T {
		return JSON.parse(value);
	}
}
