import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const photoName = request.nextUrl.searchParams.get("photoName");

	if (!photoName) {
		return NextResponse.json(
			{ error: "Invalid photo name" },
			{ status: 400 }
		);
	}

	const apiKey = process.env.GOOGLE_MAPS_API_KEY;
	if (!apiKey) {
		throw new Error("API key is not defined");
	}

	// Updated URL to use the new Places API endpoint
	const url = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=400&key=${apiKey}`;

	try {
		const response = await fetch(url, {
			headers: {
				// Updated header name
				"X-Goog-Api-Key": apiKey,
				// Removed unnecessary header
			},
		});

		if (!response.ok) {
			throw new Error(
				`Failed to fetch photo data: ${response.statusText}`
			);
		}

		// The response is now directly the image data
		const buffer = await response.arrayBuffer();
		const headers = new Headers(response.headers);
		headers.set("Cache-Control", "public, max-age=300");
		headers.set(
			"Content-Type",
			response.headers.get("Content-Type") || "image/jpeg"
		); // Ensure Content-Type is set

		return new NextResponse(buffer, {
			status: 200,
			headers: headers,
		});
	} catch (error) {
		console.error("Failed to fetch image:", error);
		return NextResponse.json(
			{ error: "Failed to fetch image" },
			{ status: 500 }
		);
	}
}
