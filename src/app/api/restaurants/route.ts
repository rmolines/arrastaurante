// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// app/api/restaurants/route.ts

import { NextResponse } from "next/server";
import { GooglePlace, Restaurant } from "@/types/restaurants";
import { calculateDistance } from "@/utils/geoUtils";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const lat = searchParams.get("lat");
	const lng = searchParams.get("lng");
	const price = searchParams.get("price");
	const distance = searchParams.get("distance");
	const rating = searchParams.get("rating");

	if (!lat || !lng) {
		return NextResponse.json(
			{ error: "Missing location parameters" },
			{ status: 400 }
		);
	}

	const apiKey = process.env.GOOGLE_MAPS_API_KEY;
	const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;

	try {
		const params = new URLSearchParams({
			location: `${lat},${lng}`,
			radius: distance
				? (parseFloat(distance) * 1000).toString()
				: "1000", // Default 1km
			type: "restaurant",
			key: apiKey || "",
		});

		if (price) {
			params.append("minprice", price);
			// Google Places API uses minprice and maxprice as integers (0-4)
		}

		if (rating) {
			// Google Places API doesn't support rating filter directly.
			// Filtering will be handled after fetching.
		}

		const response = await fetch(`${apiUrl}?${params.toString()}`, {
			method: "GET",
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error("API error response:", errorText);
			throw new Error(
				`Error fetching restaurant data: ${response.status} ${response.statusText}`
			);
		}

		const data = await response.json();

		if (!data.results || !Array.isArray(data.results)) {
			console.error("Unexpected API response structure:", data);
			return NextResponse.json(
				{ error: "Unexpected API response structure" },
				{ status: 500 }
			);
		}

		// Process and filter the results
		let detailedResults: Restaurant[] = data.results.map(
			(place: GooglePlace): Restaurant => ({
				place_id: place.place_id,
				name: place.name || "",
				address: place.vicinity || "",
				rating: place.rating || 0,
				price_level: place.price_level || 0,
				types: place.types || [],
				primary_type_display_name: place.types?.[0] || "Restaurant",
				opening_hours: place.opening_hours,
				photos: place.photos
					? place.photos.map((photo) => ({
							name: photo.photo_reference,
							widthPx: photo.width,
							heightPx: photo.height,
					  }))
					: [],
				website: place.website || "",
				reviews: [], // Google Places Nearby Search doesn't return reviews
				latitude: place.geometry?.location.lat,
				longitude: place.geometry?.location.lng,
				distance: calculateDistance(
					parseFloat(lat),
					parseFloat(lng),
					place.geometry?.location.lat || 0,
					place.geometry?.location.lng || 0
				),
			})
		);

		// Apply rating filter if specified
		if (rating) {
			detailedResults = detailedResults.filter(
				(restaurant) => restaurant.rating >= parseFloat(rating)
			);
		}

		return NextResponse.json(detailedResults);
	} catch (error) {
		console.error("API error:", error);
		return NextResponse.json(
			{
				error: "Error fetching restaurant data",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 }
		);
	}
}

// Helper function
function parsePriceLevel(priceLevel: string | undefined): number {
	switch (priceLevel) {
		case "0":
			return 0;
		case "1":
			return 1;
		case "2":
			return 2;
		case "3":
			return 3;
		case "4":
			return 4;
		default:
			return 0;
	}
}
