import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const lat = searchParams.get("lat");
	const lng = searchParams.get("lng");

	if (!lat || !lng) {
		return NextResponse.json(
			{ error: "Latitude and longitude are required" },
			{ status: 400 }
		);
	}

	try {
		const apiKey = process.env.GOOGLE_MAPS_API_KEY;
		// Replace this URL with the actual geocoding service you're using
		const response = await fetch(
			`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
		);
		const data = await response.json();

		let postalCode = "";
		for (const result of data.results) {
			for (const component of result.address_components) {
				if (component.types.includes("postal_code")) {
					postalCode = component.long_name;
					break;
				}
			}
			if (postalCode) break;
		}

		return NextResponse.json({ postalCode });
	} catch (error) {
		console.error("Error in reverse geocoding:", error);
		return NextResponse.json(
			{ error: "Failed to perform reverse geocoding" },
			{ status: 500 }
		);
	}
}
