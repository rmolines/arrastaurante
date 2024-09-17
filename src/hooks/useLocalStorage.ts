import { useState } from "react";
import { Restaurant } from "@/types/restaurants";

function useLocalStorage(key: string, initialValue: Restaurant[]) {
	const [storedValue, setStoredValue] = useState<Restaurant[]>(() => {
		if (typeof window === "undefined") {
			return initialValue;
		}
		try {
			const item = window.localStorage.getItem(key);
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			console.log(error);
			return initialValue;
		}
	});

	const setValue = (
		value: Restaurant[] | ((val: Restaurant[]) => Restaurant[])
	) => {
		try {
			const valueToStore =
				value instanceof Function ? value(storedValue) : value;
			setStoredValue(valueToStore);
			if (typeof window !== "undefined") {
				window.localStorage.setItem(key, JSON.stringify(valueToStore));
			}
		} catch (error) {
			console.log(error);
		}
	};

	return [storedValue, setValue] as const;
}

export default useLocalStorage;
