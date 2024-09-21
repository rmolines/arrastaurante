import { useState, useEffect, useCallback } from "react";
import { Restaurant } from "../types/restaurants";

interface FetchParams {
	lat: number;
	lng: number;
	priceFilter: number | null;
	distanceFilter: number;
	ratingFilter: number;
}

interface UseFetchRestaurantsReturn {
	restaurants: Restaurant[];
	loading: boolean;
	error: string | null;
	loadMore: () => void;
	reset: () => void;
}

const useFetchRestaurants = (
	params: FetchParams
): UseFetchRestaurantsReturn => {
	const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
	const [nextPageToken, setNextPageToken] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const fetchRestaurants = useCallback(
		async (pageToken: string | null = null) => {
			setLoading(true);
			setError(null);
			try {
				const url = new URL("/api/restaurants", window.location.origin);
				url.searchParams.append("lat", params.lat.toString());
				url.searchParams.append("lng", params.lng.toString());
				if (params.priceFilter !== null) {
					url.searchParams.append(
						"price",
						params.priceFilter.toString()
					);
				}
				url.searchParams.append(
					"distance",
					params.distanceFilter.toString()
				);
				url.searchParams.append(
					"rating",
					params.ratingFilter.toString()
				);
				if (pageToken) {
					url.searchParams.append("pageToken", pageToken);
				}

				const response = await fetch(url.toString());
				const data = await response.json();

				if (!response.ok) {
					throw new Error(
						data.error || "Failed to fetch restaurants"
					);
				}

				setRestaurants((prev) => [...prev, ...data.restaurants]);
				setNextPageToken(data.nextPageToken);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Unknown error");
			} finally {
				setLoading(false);
			}
		},
		[params]
	);

	useEffect(() => {
		// Initial fetch
		setRestaurants([]);
		setNextPageToken(null);
		fetchRestaurants();
	}, [fetchRestaurants]);

	const loadMore = () => {
		if (nextPageToken && !loading) {
			fetchRestaurants(nextPageToken);
		}
	};

	const reset = () => {
		setRestaurants([]);
		setNextPageToken(null);
		fetchRestaurants();
	};

	return { restaurants, loading, error, loadMore, reset };
};

export default useFetchRestaurants;
