import { browser } from "$app/environment";

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
			if (browser && this.value !== undefined) {
				localStorage.setItem(this.key, this.serialize(this.value));
			}
		});
	}

	serialize(value: T): string {
		return JSON.stringify(value);
	}

	deserialize(value: string): T {
		return JSON.parse(value);
	}
}
