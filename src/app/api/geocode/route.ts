import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const postalCode = searchParams.get("postalCode");

	if (!postalCode) {
		return NextResponse.json(
			{ error: "Missing postal code parameter" },
			{ status: 400 }
		);
	}

	const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
	const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${postalCode}&key=${apiKey}`;

	try {
		const response = await fetch(apiUrl);
		if (!response.ok) {
			throw new Error("Error fetching geocode data");
		}
		const data = await response.json();

		if (data.results && data.results.length > 0) {
			const { lat, lng } = data.results[0].geometry.location;
			return NextResponse.json({ lat, lng });
		} else {
			return NextResponse.json(
				{ error: "No results found for the given postal code" },
				{ status: 404 }
			);
		}
	} catch (error) {
		console.error("API error:", error);
		return NextResponse.json(
			{ error: "Error fetching geocode data" },
			{ status: 500 }
		);
	}
}
