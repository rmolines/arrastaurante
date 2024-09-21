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
	const apiUrl = "https://places.googleapis.com/v1/places:searchNearby";

	try {
		const allPlaces: GooglePlace[] = [];
		let nextPageToken: string | undefined = undefined;

		do {
			const requestBody: any = {
				locationRestriction: {
					circle: {
						center: {
							latitude: parseFloat(lat),
							longitude: parseFloat(lng),
						},
						radius: distance ? parseFloat(distance) * 1000 : 1000, // Convert km to meters
					},
				},
				includedTypes: ["restaurant"],
				excludedTypes: ["night_club"],
				languageCode: "pt-BR", // Add this line to set the language to Brazilian Portuguese
				regionCode: "pt",
			};

			if (price) {
				requestBody.maxPriceLevelEnum = `PRICE_LEVEL_${price}`;
			}

			if (nextPageToken) {
				requestBody.pageToken = nextPageToken;
			}

			const response = await fetch(apiUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Goog-Api-Key": apiKey || "",
					"X-Goog-FieldMask":
						"places.id,places.displayName,places.formattedAddress,places.rating,places.priceLevel,places.types,places.businessStatus,places.photos,places.primaryTypeDisplayName,places.location",
				},
				body: JSON.stringify(requestBody),
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error("API error response:", errorText);
				throw new Error(
					`Error fetching restaurant data: ${response.status} ${response.statusText}`
				);
			}

			const data = await response.json();

			if (!data.places || !Array.isArray(data.places)) {
				console.error("Unexpected API response structure:", data);
				return NextResponse.json(
					{ error: "Unexpected API response structure" },
					{ status: 500 }
				);
			}

			allPlaces.push(...data.places);

			nextPageToken = data.nextPageToken;

			console.log(data);

			// Google recommends a short delay before using nextPageToken
			if (nextPageToken) {
				await new Promise((resolve) => setTimeout(resolve, 2000));
			}
		} while (nextPageToken);

		// Process and filter the results
		let detailedResults: Restaurant[] = allPlaces.map(
			(place: GooglePlace): Restaurant => ({
				place_id: place.id,
				name: place.displayName?.text || "",
				address: place.formattedAddress || "",
				rating: place.rating || 0,
				price_level: parsePriceLevel(place.priceLevel),
				types: place.types || [],
				primary_type_display_name:
					place.primaryTypeDisplayName?.text || "Restaurant",
				photos: place.photos
					? place.photos.map((photo: GooglePhoto) => ({
							name: photo.name,
							widthPx: photo.widthPx,
							heightPx: photo.heightPx,
					  }))
					: [],
				website: "", // Not available in this API response
				reviews: [], // Not available in this API response
				latitude: place.location?.latitude,
				longitude: place.location?.longitude,
				distance: calculateDistance(
					parseFloat(lat),
					parseFloat(lng),
					place.location?.latitude || 0,
					place.location?.longitude || 0
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
		case "PRICE_LEVEL_FREE":
			return 0;
		case "PRICE_LEVEL_INEXPENSIVE":
			return 1;
		case "PRICE_LEVEL_MODERATE":
			return 2;
		case "PRICE_LEVEL_EXPENSIVE":
			return 3;
		case "PRICE_LEVEL_VERY_EXPENSIVE":
			return 4;
		default:
			return 0;
	}
}
