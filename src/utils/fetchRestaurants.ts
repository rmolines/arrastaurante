import { Restaurant } from "@/types/restaurants";

export const fetchNearbyRestaurants = async (
	lat: number,
	lng: number,
	priceFilter: number | null,
	distanceFilter: number,
	ratingFilter: number
): Promise<Restaurant[]> => {
	const params = new URLSearchParams({
		lat: lat.toString(),
		lng: lng.toString(),
		distance: distanceFilter.toString(),
		rating: ratingFilter.toString(),
	});

	// Add price filter to the API request if it's not null
	if (priceFilter !== null) {
		params.append("price", priceFilter.toString());
	}
	console.log(params.toString());

	const response = await fetch(`/api/restaurants?${params.toString()}`);
	if (!response.ok) {
		throw new Error("Failed to fetch restaurants");
	}
	return response.json();
};
