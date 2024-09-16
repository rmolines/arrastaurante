// app/api/restaurants/route.ts
//@ts-nocheck

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

	const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
	const apiUrl = `https://places.googleapis.com/v1/places:searchNearby`;

	try {
		const requestBody = JSON.stringify({
			locationRestriction: {
				circle: {
					center: {
						latitude: parseFloat(lat),
						longitude: parseFloat(lng),
					},
					radius: parseFloat(distance || "50") * 1000, // Convert km to meters
				},
			},
			includedTypes: ["restaurant"],
			maxResultCount: 20,
			priceLevels: price ? [parsePriceLevel(price)] : undefined,
		});

		const response = await fetch(apiUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Goog-Api-Key": apiKey || "",
				"X-Goog-FieldMask":
					"places.id,places.displayName,places.formattedAddress,places.rating,places.priceLevel,places.types,places.currentOpeningHours,places.photos,places.websiteUri,places.reviews,places.primaryTypeDisplayName,places.location",
			},
			body: requestBody,
		});

		const responseText = await response.text();

		if (!response.ok) {
			console.error("API error response:", responseText);
			throw new Error(
				`Error fetching restaurant data: ${response.status} ${response.statusText}`
			);
		}

		let data;
		try {
			data = JSON.parse(responseText);
		} catch (parseError) {
			console.error("Error parsing JSON:", parseError);
			return NextResponse.json(
				{ error: "Invalid JSON response from API" },
				{ status: 500 }
			);
		}

		if (
			!data ||
			typeof data !== "object" ||
			Object.keys(data).length === 0
		) {
			console.warn("Empty API response");
			return NextResponse.json({ places: [] });
		}

		if (!data.places || !Array.isArray(data.places)) {
			console.error("Unexpected API response structure:", data);
			return NextResponse.json(
				{ error: "Unexpected API response structure" },
				{ status: 500 }
			);
		}

		// Process and filter the results
		let detailedResults = data.places.map(
			(place: GooglePlace): Restaurant => ({
				place_id: place.id,
				name: place.displayName?.text || "",
				address: place.formattedAddress || "",
				rating: place.rating || 0,
				price_level: place.priceLevel,
				types: place.types || [],
				primary_type_display_name:
					place.primaryTypeDisplayName?.text ||
					place.types?.[0] ||
					"Restaurant",
				opening_hours: place.currentOpeningHours,
				photos: place.photos || [],
				website: place.websiteUri || "",
				reviews: place.reviews || [],
				latitude: place.location?.latitude,
				longitude: place.location?.longitude,
				distance: calculateDistance(
					parseFloat(lat),
					parseFloat(lng),
					place.location?.latitude ?? 0,
					place.location?.longitude ?? 0
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

// Helper function (keep this at the end of the file)
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
			return 0; // Default to 0 if undefined or unknown
	}
}
